import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import https from 'https';

/**
 * Upload apartment images to Supabase Storage and create media rows.
 * Downloads real photos from Unsplash and organizes them per unit.
 *
 * Usage: npx tsx scripts/supabase/upload-images.ts
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

// Curated Unsplash photo IDs — apartment interiors, real estate
const PHOTO_IDS = [
  '1502672260266-1c1ef2d93688', // modern living room
  '1560448204771-d2e7e2a22e43', // bright apartment
  '1522708323590-d24dbb6b0267', // cozy living room
  '1560185893-a55cbc8c57e8', // kitchen
  '1556909114-f6e7ad7d3136', // modern kitchen
  '1600585154340-be6161a56a0c', // bedroom
  '1616594039964-ae9021a400a0', // bathroom
  '1600607687939-ce8a6c25118c', // balcony view
  '1586105251261-72a756497a0d', // apartment exterior
  '1545324418-cc1a3fa10c00', // building facade
  '1600566753190-17f0baa2a6c0', // open plan
  '1600585154526-990dced4db0d', // dining area
];

// Map unit types to relevant photos
const UNIT_PHOTO_SETS: Record<string, number[]> = {
  // 3 ambientes (A, C) — get 4 photos: living, kitchen, bedroom, bathroom
  large: [0, 3, 5, 6],
  // 2 ambientes (B, D) — get 3 photos: living, kitchen, balcony/view
  small: [2, 4, 7],
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

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);

  if (!exists) {
    console.log(`Creating bucket "${BUCKET}"...`);
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error) throw error;
    console.log('  Created\n');
  } else {
    console.log(`Bucket "${BUCKET}" already exists\n`);
  }
}

async function run() {
  console.log('Starting image upload...\n');

  await ensureBucket();

  // Clear existing media rows
  console.log('Clearing existing media rows...');
  await supabase.from('media').delete().not('id', 'is', null);
  console.log('  Done\n');

  // Get the building project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, slug')
    .eq('slug', 'torre-norte')
    .single();

  if (projectError || !project) {
    console.error('Project "torre-norte" not found. Run db:seed first.');
    process.exit(1);
  }

  // Get all unit layers (depth 2 = leaves)
  const { data: units, error: unitsError } = await supabase
    .from('layers')
    .select('id, slug, name, properties, depth')
    .eq('project_id', project.id)
    .eq('depth', 2)
    .order('slug');

  if (unitsError) throw unitsError;
  console.log(`Found ${units.length} units to upload images for\n`);

  let totalUploaded = 0;
  let totalMedia = 0;

  for (const unit of units) {
    const unitType = unit.properties as Record<string, unknown>;
    const isLarge = (unitType.unit_type as string)?.includes('3');
    const photoIndices = isLarge ? UNIT_PHOTO_SETS.large : UNIT_PHOTO_SETS.small;

    console.log(`  ${unit.slug} (${isLarge ? '3 amb' : '2 amb'}):`);

    for (let i = 0; i < photoIndices.length; i++) {
      const photoId = PHOTO_IDS[photoIndices[i]];
      const photoUrl = getPhotoUrl(photoId, 800, 600);
      const storagePath = `torre-norte/layers/${unit.slug}/gallery/photo-${i + 1}.jpg`;

      try {
        // Download
        const imageBuffer = await downloadImage(photoUrl);
        console.log(`    Downloaded photo ${i + 1} (${(imageBuffer.length / 1024).toFixed(0)}KB)`);

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, imageBuffer, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          console.error(`    Upload failed: ${uploadError.message}`);
          continue;
        }
        totalUploaded++;

        // Get public URL
        const { data: publicUrl } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(storagePath);

        // Create media row
        const purpose = i === 0 ? 'cover' : 'gallery';
        const { error: mediaError } = await supabase.from('media').insert({
          project_id: project.id,
          layer_id: unit.id,
          type: 'image',
          purpose,
          storage_path: storagePath,
          url: publicUrl.publicUrl,
          title: `${unit.name} - Foto ${i + 1}`,
          alt_text: `${unit.name} - Vista ${i + 1}`,
          sort_order: i,
          metadata: { width: 800, height: 600, format: 'jpg', size_bytes: imageBuffer.length },
        });

        if (mediaError) {
          console.error(`    Media row failed: ${mediaError.message}`);
          continue;
        }
        totalMedia++;
        console.log(`    Uploaded → ${purpose}`);
      } catch (err) {
        console.error(`    Error: ${err instanceof Error ? err.message : err}`);
      }
    }
  }

  console.log(`\nUpload complete!`);
  console.log(`  Images uploaded: ${totalUploaded}`);
  console.log(`  Media rows created: ${totalMedia}`);
  console.log(`  Bucket: ${BUCKET}`);
  console.log(`  Path: torre-norte/layers/{unit-slug}/gallery/`);
}

run().catch((err) => {
  console.error('Upload failed:', err);
  process.exit(1);
});
