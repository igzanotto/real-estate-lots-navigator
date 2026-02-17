import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Remove all image URLs from lots (doesn't delete from storage)
 */
async function removeSampleImages() {
  console.log('🗑️  Removing image URLs from lots database...\n');

  try {
    const { error } = await supabase
      .from('lots')
      .update({ image_url: null })
      .not('image_url', 'is', null);

    if (error) throw error;

    console.log('✅ Image URLs removed from database!');
    console.log('\n💡 Note: Images still exist in Supabase Storage.');
    console.log('   Delete them manually from the Supabase dashboard if needed.');
  } catch (error) {
    console.error('❌ Error removing images:', error);
    process.exit(1);
  }
}

removeSampleImages();
