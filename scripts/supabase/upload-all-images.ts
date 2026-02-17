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
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
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
    console.error(`  ❌ ${path}: ${error.message}`);
    return false;
  }
  return true;
}

/**
 * Upload all images (backgrounds + lots)
 */
async function uploadAllImages() {
  console.log('🏗️  Uploading complete image set...\n');

  let uploaded = 0;
  let failed = 0;

  try {
    // ============================================
    // 1. BACKGROUND IMAGES (aerial/map views)
    // ============================================
    console.log('📍 1/4: Uploading background images...\n');

    const backgrounds = [
      // Main map background (3 zones layout)
      {
        path: 'backgrounds/mapa-principal.jpg',
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop&q=80',
        desc: 'Main map background'
      },

      // Zone backgrounds
      {
        path: 'backgrounds/zona-a.jpg',
        url: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1920&h=1080&fit=crop&q=80',
        desc: 'Zona A background'
      },
      {
        path: 'backgrounds/zona-b.jpg',
        url: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1920&h=1080&fit=crop&q=80',
        desc: 'Zona B background'
      },
      {
        path: 'backgrounds/zona-c.jpg',
        url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&h=1080&fit=crop&q=80',
        desc: 'Zona C background'
      },
    ];

    // Block backgrounds (14 total: 4+4+6)
    const blockImageUrls = [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&h=1080&fit=crop&q=80',
    ];

    const blockConfigs = [
      { zone: 'a', count: 4 },
      { zone: 'b', count: 4 },
      { zone: 'c', count: 6 },
    ];

    let urlIdx = 0;
    const blockBackgrounds = blockConfigs.flatMap(({ zone, count }) =>
      Array.from({ length: count }, (_, i) => ({
        path: `backgrounds/zona-${zone}-manzana-${i + 1}.jpg`,
        url: blockImageUrls[urlIdx++ % blockImageUrls.length],
        desc: `Zona ${zone.toUpperCase()} - Manzana ${i + 1}`,
      }))
    );

    const allBackgrounds = [...backgrounds, ...blockBackgrounds];

    for (const bg of allBackgrounds) {
      try {
        console.log(`  📥 ${bg.desc}...`);
        const buffer = await downloadImage(bg.url);
        if (await uploadImage(bg.path, buffer)) {
          console.log(`  ✅ ${bg.path}`);
          uploaded++;
        } else {
          failed++;
        }
      } catch {
        console.error(`  ❌ Failed: ${bg.path}`);
        failed++;
      }
    }

    console.log(`\n  📊 Backgrounds: ${uploaded} uploaded\n`);

    // ============================================
    // 2. LOT IMAGES - All 112 lots
    // ============================================
    console.log('📍 2/4: Uploading lot images (this will take a while)...\n');

    // Real estate images from Unsplash (high quality)
    const lotImageUrls = [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=85',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=85',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=85',
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=85',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=85',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=85',
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=85',
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=85',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=85',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=85',
    ];

    const zones = [
      { id: 'a', blocks: 4 },
      { id: 'b', blocks: 4 },
      { id: 'c', blocks: 6 },
    ];

    let lotCount = 0;

    for (const zone of zones) {
      for (let block = 1; block <= zone.blocks; block++) {
        console.log(`  📦 Zona ${zone.id.toUpperCase()} - Manzana ${block}...`);

        for (let lot = 1; lot <= 8; lot++) {
          const lotPadded = lot.toString().padStart(2, '0');
          const path = `zona-${zone.id}/manzana-${block}/lote-${lotPadded}-main.jpg`;

          // Rotate through available images
          const imageUrl = lotImageUrls[lotCount % lotImageUrls.length];

          try {
            const buffer = await downloadImage(imageUrl);
            if (await uploadImage(path, buffer)) {
              lotCount++;
              process.stdout.write(`\r    ✅ ${lotCount}/112 lots uploaded`);
            } else {
              failed++;
            }
          } catch {
            failed++;
          }
        }
      }
    }

    console.log(`\n\n  📊 Lots: ${lotCount} uploaded\n`);

    // ============================================
    // FINAL SUMMARY
    // ============================================
    console.log('\n═══════════════════════════════════════');
    console.log('📊 FINAL RESULTS:');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Total uploaded: ${uploaded + lotCount} images`);
    console.log(`   - Backgrounds: ${uploaded}`);
    console.log(`   - Lot photos: ${lotCount}`);
    if (failed > 0) {
      console.log(`❌ Failed: ${failed}`);
    }
    console.log('\n🔗 Next steps:');
    console.log('   1. Run: npm run db:add-images');
    console.log('   2. Restart dev server');
    console.log('   3. Test Progressive Loading!');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

uploadAllImages();
