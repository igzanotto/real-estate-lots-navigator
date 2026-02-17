import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import https from 'https';

/**
 * Upload exploration background images for each layer level.
 * These appear behind the SVG maps in ExplorerView.
 *
 * Usage: npx tsx scripts/supabase/upload-backgrounds.ts
 */

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET = 'project-media';

// Background photos by layer type
const BACKGROUNDS = {
  // Project root — modern building complex exterior
  project: '1486406146926-c627a92ad1ab',
  // Tower — tall residential building facade
  tower: '1545324418-cc1a3fa10c00',
  // Floor — apartment building hallway / corridor
  floor: '1560185127-6ed189bf02f4',
};

function getPhotoUrl(photoId: string, width: number, height: number): string {
  return `https://images.unsplash.com/photo-${photoId}?w=${width}&h=${height}&fit=crop&auto=format&q=80`;
}

async function downloadImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const request = (redirectUrl: string, redirectCount = 0) => {
      if (redirectCount > 5) {
        reject(new Error('Too many redirects'));
        return;
      }
      https.get(redirectUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          request(res.headers.location, redirectCount + 1);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }).on('error', reject);
    };
    request(url);
  });
}

async function uploadAndCreateMedia(
  projectId: string,
  layerId: string | null,
  storagePath: string,
  photoId: string,
  title: string,
): Promise<boolean> {
  try {
    const photoUrl = getPhotoUrl(photoId, 1920, 1080);
    const imageBuffer = await downloadImage(photoUrl);
    console.log(`    Downloaded (${(imageBuffer.length / 1024).toFixed(0)}KB)`);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error(`    Upload failed: ${uploadError.message}`);
      return false;
    }

    const { data: publicUrl } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    const { error: mediaError } = await supabase.from('media').insert({
      project_id: projectId,
      layer_id: layerId,
      type: 'image',
      purpose: 'exploration',
      storage_path: storagePath,
      url: publicUrl.publicUrl,
      title,
      alt_text: title,
      sort_order: 0,
      metadata: { width: 1920, height: 1080, format: 'jpg', size_bytes: imageBuffer.length },
    });

    if (mediaError) {
      console.error(`    Media row failed: ${mediaError.message}`);
      return false;
    }

    console.log(`    Uploaded → exploration`);
    return true;
  } catch (err) {
    console.error(`    Error: ${err instanceof Error ? err.message : err}`);
    return false;
  }
}

async function run() {
  console.log('Starting background upload...\n');

  // Get project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, slug, name')
    .eq('slug', 'torre-norte')
    .single();

  if (projectError || !project) {
    console.error('Project "torre-norte" not found. Run db:seed first.');
    process.exit(1);
  }

  // Remove existing exploration media
  console.log('Clearing existing exploration media...');
  await supabase
    .from('media')
    .delete()
    .eq('project_id', project.id)
    .eq('purpose', 'exploration');
  console.log('  Done\n');

  let count = 0;

  // 1. Project root background (layer_id = NULL)
  console.log('  Project root background:');
  const ok1 = await uploadAndCreateMedia(
    project.id,
    null,
    `torre-norte/backgrounds/project-overview.jpg`,
    BACKGROUNDS.project,
    'Vista general del complejo',
  );
  if (ok1) count++;

  // 2. Tower backgrounds (depth 0)
  const { data: towers } = await supabase
    .from('layers')
    .select('id, slug, name')
    .eq('project_id', project.id)
    .eq('depth', 0)
    .order('sort_order');

  for (const tower of towers ?? []) {
    console.log(`  ${tower.name} background:`);
    const ok = await uploadAndCreateMedia(
      project.id,
      tower.id,
      `torre-norte/backgrounds/${tower.slug}.jpg`,
      BACKGROUNDS.tower,
      `Vista de ${tower.name}`,
    );
    if (ok) count++;
  }

  // 3. Floor backgrounds (depth 1)
  const { data: floors } = await supabase
    .from('layers')
    .select('id, slug, name')
    .eq('project_id', project.id)
    .eq('depth', 1)
    .order('slug');

  for (const floor of floors ?? []) {
    console.log(`  ${floor.slug} background:`);
    const ok = await uploadAndCreateMedia(
      project.id,
      floor.id,
      `torre-norte/backgrounds/${floor.slug}.jpg`,
      BACKGROUNDS.floor,
      `Vista de ${floor.name}`,
    );
    if (ok) count++;
  }

  console.log(`\nBackground upload complete!`);
  console.log(`  Exploration images: ${count}`);
  console.log(`    Project root: 1`);
  console.log(`    Towers: ${towers?.length ?? 0}`);
  console.log(`    Floors: ${floors?.length ?? 0}`);
}

run().catch((err) => {
  console.error('Upload failed:', err);
  process.exit(1);
});
