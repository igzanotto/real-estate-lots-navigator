import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Generate Supabase Storage image path for a lot
 * Format: zona-a/manzana-1/lote-01-main.jpg
 */
function getLotImagePath(lotSlug: string): string {
  const parts = lotSlug.split('-');
  const zone = parts.slice(0, 2).join('-'); // zona-a
  const block = parts.slice(2, 4).join('-'); // manzana-1
  const lot = parts.slice(4).join('-'); // lote-01

  return `${zone}/${block}/${lot}-main.jpg`;
}

/**
 * Get full Supabase Storage URL
 */
function getStorageUrl(path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/images/${path}`;
}

/**
 * Check if image exists in Supabase Storage
 */
async function imageExists(path: string): Promise<boolean> {
  const { data, error } = await supabase
    .storage
    .from('images')
    .list(path.split('/').slice(0, -1).join('/'));

  if (error) return false;

  const filename = path.split('/').pop();
  return data?.some(file => file.name === filename) || false;
}

/**
 * Add Supabase Storage image URLs to lots that have uploaded images
 */
async function addSampleImages() {
  console.log('📸 Linking Supabase Storage images to lots...\n');

  try {
    // Get all lots
    const { data: lots, error } = await supabase
      .from('lots')
      .select('id, slug, name')
      .order('slug');

    if (error) throw error;

    let updated = 0;
    let notFound = 0;

    for (const lot of lots!) {
      const imagePath = getLotImagePath(lot.slug);
      const imageUrl = getStorageUrl(imagePath);

      // Check if image exists in storage
      const exists = await imageExists(imagePath);

      if (exists) {
        const { error: updateError } = await supabase
          .from('lots')
          .update({ image_url: imageUrl })
          .eq('id', lot.id);

        if (updateError) {
          console.error(`  ❌ Error updating ${lot.slug}:`, updateError.message);
        } else {
          console.log(`  ✅ ${lot.name} → ${imagePath}`);
          updated++;
        }
      } else {
        console.log(`  ⏭️  ${lot.name} - no image in storage`);
        notFound++;
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`   ✅ Linked: ${updated} lots`);
    console.log(`   ⏭️  Not found: ${notFound} lots`);

    if (notFound > 0) {
      console.log('\n💡 To upload missing images, run:');
      console.log('   npm run db:upload-all');
      console.log('   npm run db:add-images');
    }
  } catch (error) {
    console.error('❌ Error adding images:', error);
    process.exit(1);
  }
}

addSampleImages();
