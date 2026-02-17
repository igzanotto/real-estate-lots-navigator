import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyImages() {
  console.log('🔍 Verifying images in database vs storage...\n');

  try {
    // Get all lots from database
    const { data: lots, error } = await supabase
      .from('lots')
      .select('id, slug, name, image_url')
      .order('slug');

    if (error) throw error;

    let found = 0;
    let missing = 0;
    let noUrl = 0;

    console.log('Checking each lot...\n');

    for (const lot of lots!) {
      if (!lot.image_url) {
        console.log(`  ⚠️  ${lot.name} (${lot.slug}) - No image_url in database`);
        noUrl++;
        continue;
      }

      // Extract path from URL
      const urlPath = lot.image_url.split('/images/')[1];
      if (!urlPath) {
        console.log(`  ❌ ${lot.name} - Invalid URL format: ${lot.image_url}`);
        missing++;
        continue;
      }

      // Check if file exists in storage
      const pathParts = urlPath.split('/');
      const folder = pathParts.slice(0, -1).join('/');
      const filename = pathParts[pathParts.length - 1];

      const { data: files } = await supabase.storage
        .from('images')
        .list(folder);

      const exists = files?.some(f => f.name === filename);

      if (exists) {
        found++;
        process.stdout.write(`\r  ✅ Verified: ${found}/${lots!.length}`);
      } else {
        console.log(`\n  ❌ ${lot.name} (${lot.slug}) - File not found: ${urlPath}`);
        missing++;
      }
    }

    console.log('\n\n═══════════════════════════════════════');
    console.log('📊 VERIFICATION RESULTS:');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Found: ${found}`);
    console.log(`❌ Missing: ${missing}`);
    console.log(`⚠️  No URL: ${noUrl}`);
    console.log(`📝 Total: ${lots!.length}`);
    console.log('═══════════════════════════════════════\n');

    if (missing > 0) {
      console.log('💡 To fix missing images:');
      console.log('   1. Run: npm run db:upload-all');
      console.log('   2. Then: npm run db:add-images\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyImages();
