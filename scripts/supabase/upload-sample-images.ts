import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as https from 'https';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Download image from URL
 */
function downloadImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks: Buffer[] = [];

      response.on('data', (chunk) => {
        chunks.push(chunk);
      });

      response.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      response.on('error', reject);
    });
  });
}

/**
 * Upload image to Supabase Storage
 */
async function uploadImage(path: string, imageBuffer: Buffer): Promise<boolean> {
  const { error } = await supabase.storage
    .from('images')
    .upload(path, imageBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) {
    console.error(`  ❌ Error uploading ${path}:`, error.message);
    return false;
  }

  return true;
}

/**
 * Upload sample images for testing
 */
async function uploadSampleImages() {
  console.log('📸 Downloading and uploading sample images...\n');

  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const imagesBucket = buckets?.find(b => b.name === 'images');

    if (!imagesBucket) {
      console.error('❌ Bucket "images" not found!');
      console.log('   Please create it first at:');
      console.log('   https://supabase.com/dashboard/project/wjarjmsswpphqvslzozy/storage/buckets');
      process.exit(1);
    }

    // Sample images to upload (using Unsplash for high-quality real estate images)
    const imagesToUpload = [
      // Zona A - Manzana 1
      { path: 'zona-a/manzana-1/lote-01-main.jpg', url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80' },
      { path: 'zona-a/manzana-1/lote-02-main.jpg', url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80' },
      { path: 'zona-a/manzana-1/lote-03-main.jpg', url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80' },

      // Zona A - Manzana 2
      { path: 'zona-a/manzana-2/lote-01-main.jpg', url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80' },
      { path: 'zona-a/manzana-2/lote-02-main.jpg', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80' },

      // Zona B - Manzana 1
      { path: 'zona-b/manzana-1/lote-01-main.jpg', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80' },
      { path: 'zona-b/manzana-1/lote-02-main.jpg', url: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80' },

      // Zona C - Manzana 1
      { path: 'zona-c/manzana-1/lote-01-main.jpg', url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80' },
    ];

    let uploaded = 0;
    let failed = 0;

    for (const image of imagesToUpload) {
      try {
        console.log(`  ⬇️  Downloading ${image.path}...`);
        const imageBuffer = await downloadImage(image.url);

        console.log(`  ⬆️  Uploading to Supabase Storage...`);
        const success = await uploadImage(image.path, imageBuffer);

        if (success) {
          console.log(`  ✅ ${image.path}\n`);
          uploaded++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`  ❌ Failed to process ${image.path}:`, error);
        failed++;
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`   ✅ Uploaded: ${uploaded} images`);
    if (failed > 0) {
      console.log(`   ❌ Failed: ${failed} images`);
    }

    if (uploaded > 0) {
      console.log(`\n🔗 Next step: Link images to database`);
      console.log('   Run: npm run db:add-images');
    }
  } catch (error) {
    console.error('❌ Error uploading images:', error);
    process.exit(1);
  }
}

uploadSampleImages();
