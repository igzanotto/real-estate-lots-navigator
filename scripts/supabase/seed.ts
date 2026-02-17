import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { EntityStatus } from '../../types/hierarchy.types';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Generate 8 lots for a block (4 rows × 2 columns)
 */
function generateLotsData(zoneLetter: string, blockNum: number, zoneDbId: string, blockDbId: string) {
  const lots: Record<string, unknown>[] = [];
  const blockSlug = `zona-${zoneLetter.toLowerCase()}-manzana-${blockNum}`;

  for (let i = 1; i <= 8; i++) {
    const lotNum = i.toString().padStart(2, '0');
    const lotSlug = `${blockSlug}-lote-${lotNum}`;

    // Simulate different statuses
    let status: EntityStatus = 'available';
    if (i % 5 === 0) status = 'sold';
    else if (i % 3 === 0) status = 'reserved';
    else if (i % 7 === 0) status = 'not_available';

    // Corner lots: corners of 4x2 grid (positions 1, 2, 7, 8)
    const isCorner = i === 1 || i === 2 || i === 7 || i === 8;

    // Base area: 250-350 m² with variation
    const baseArea = 280;
    const variation = (i % 8) * 10;
    const area = baseArea + variation;

    // Price: $60-90 per m² depending on status and corner
    const pricePerSqm = isCorner ? 90 : 70;
    const price = status === 'sold' ? null : area * pricePerSqm;

    // Dimensions
    const frontMeters = isCorner ? 12 + (i % 3) : 10 + (i % 3);
    const depthMeters = Math.round(area / frontMeters);

    // Orientation (varies by position)
    const orientations = ['Norte', 'Sur', 'Este', 'Oeste', 'Noreste', 'Noroeste'];
    const orientation = orientations[i % orientations.length];

    // Features (more for available lots)
    const baseFeatures = [
      'Agua potable',
      'Electricidad',
      'Alumbrado público',
      'Acceso pavimentado',
    ];
    const premiumFeatures = [
      'Gas natural',
      'Cloacas',
      'Fibra óptica',
      'Seguridad 24hs',
    ];
    const features = isCorner || status === 'available'
      ? [...baseFeatures, ...premiumFeatures.slice(0, 2)]
      : baseFeatures;

    // Description
    const descriptions = [
      `Excelente lote ubicado en ${zoneLetter.toUpperCase()}, ideal para construcción de vivienda familiar.`,
      `Terreno con excelente ubicación y orientación ${orientation.toLowerCase()}.`,
      `Lote ${isCorner ? 'de esquina ' : ''}con todos los servicios disponibles.`,
      `Propiedad en zona residencial de alto desarrollo, perfecta para inversión.`,
    ];
    const description = descriptions[i % descriptions.length];

    lots.push({
      zone_id: zoneDbId,
      block_id: blockDbId,
      slug: lotSlug,
      name: `Lote ${i}`,
      label: `L${i}`,
      status,
      area,
      price,
      is_corner: isCorner,
      description,
      front_meters: frontMeters,
      depth_meters: depthMeters,
      orientation,
      features: JSON.stringify(features),
    });
  }

  return lots;
}

/**
 * Seed the database with initial data
 */
async function seedDatabase() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Clear existing data (in reverse order due to foreign keys)
    console.log('🗑️  Clearing existing data...');
    await supabase.from('lots').delete().not('id', 'is', null);
    await supabase.from('blocks').delete().not('id', 'is', null);
    await supabase.from('zones').delete().not('id', 'is', null);
    console.log('✅ Existing data cleared\n');

    // Seed Zones
    console.log('📍 Seeding zones...');
    const zonesData = [
      {
        slug: 'zona-a',
        name: 'Zona A',
        label: 'Zona A',
        status: 'available' as EntityStatus,
        svg_path: '/svgs/zonas/zona-a.svg',
      },
      {
        slug: 'zona-b',
        name: 'Zona B',
        label: 'Zona B',
        status: 'available' as EntityStatus,
        svg_path: '/svgs/zonas/zona-b.svg',
      },
      {
        slug: 'zona-c',
        name: 'Zona C',
        label: 'Zona C',
        status: 'available' as EntityStatus,
        svg_path: '/svgs/zonas/zona-c.svg',
      },
    ];

    const { data: zones, error: zonesError } = await supabase
      .from('zones')
      .insert(zonesData)
      .select();

    if (zonesError) throw zonesError;
    console.log(`✅ Created ${zones.length} zones\n`);

    // Seed Blocks and Lots
    const zoneConfig = [
      { letter: 'A', dbZone: zones[0], blockCount: 4 },
      { letter: 'B', dbZone: zones[1], blockCount: 4 },
      { letter: 'C', dbZone: zones[2], blockCount: 6 },
    ];

    let totalBlocks = 0;
    let totalLots = 0;

    for (const { letter, dbZone, blockCount } of zoneConfig) {
      console.log(`📦 Seeding blocks for Zona ${letter}...`);

      for (let i = 1; i <= blockCount; i++) {
        const blockSlug = `zona-${letter.toLowerCase()}-manzana-${i}`;
        const blockData = {
          zone_id: dbZone.id,
          slug: blockSlug,
          name: `Manzana ${i}`,
          label: `M${i}`,
          status: 'available' as EntityStatus,
          svg_path: `/svgs/manzanas/${blockSlug}.svg`,
        };

        const { data: block, error: blockError } = await supabase
          .from('blocks')
          .insert(blockData)
          .select()
          .single();

        if (blockError) throw blockError;
        totalBlocks++;

        // Generate and insert lots for this block
        const lotsData = generateLotsData(letter, i, dbZone.id, block.id);
        const { error: lotsError } = await supabase.from('lots').insert(lotsData);

        if (lotsError) throw lotsError;
        totalLots += lotsData.length;

        console.log(`  ✅ Created block ${blockSlug} with ${lotsData.length} lots`);
      }
      console.log();
    }

    console.log('🎉 Database seeded successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   Zones: ${zones.length}`);
    console.log(`   Blocks: ${totalBlocks}`);
    console.log(`   Lots: ${totalLots}`);
    console.log(`\n✨ Total: ${totalLots} lots across ${totalBlocks} blocks in ${zones.length} zones`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
