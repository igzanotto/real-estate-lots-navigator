import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

/**
 * Seed the new schema (projects/layers/media) with sample data.
 * Creates a subdivision project similar to the original data.
 *
 * Usage: npx tsx scripts/supabase/seed.ts
 */

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

type Status = 'available' | 'reserved' | 'sold' | 'not_available';

function generateLotProperties(lotIndex: number, zoneLetter: string, isCorner: boolean): Record<string, unknown> {
  const baseArea = 280;
  const variation = (lotIndex % 8) * 10;
  const area = baseArea + variation;

  const status = getLotStatus(lotIndex);
  const pricePerSqm = isCorner ? 90 : 70;
  const price = status === 'sold' ? null : area * pricePerSqm;

  const frontMeters = isCorner ? 12 + (lotIndex % 3) : 10 + (lotIndex % 3);
  const depthMeters = Math.round(area / frontMeters);

  const orientations = ['Norte', 'Sur', 'Este', 'Oeste', 'Noreste', 'Noroeste'];
  const orientation = orientations[lotIndex % orientations.length];

  const baseFeatures = ['Agua potable', 'Electricidad', 'Alumbrado público', 'Acceso pavimentado'];
  const premiumFeatures = ['Gas natural', 'Cloacas', 'Fibra óptica', 'Seguridad 24hs'];
  const features = isCorner || status === 'available'
    ? [...baseFeatures, ...premiumFeatures.slice(0, 2)]
    : baseFeatures;

  const descriptions = [
    `Excelente lote ubicado en Zona ${zoneLetter}, ideal para construcción de vivienda familiar.`,
    `Terreno con excelente ubicación y orientación ${orientation.toLowerCase()}.`,
    `Lote ${isCorner ? 'de esquina ' : ''}con todos los servicios disponibles.`,
    `Propiedad en zona residencial de alto desarrollo, perfecta para inversión.`,
  ];

  return {
    area,
    price,
    is_corner: isCorner,
    front_meters: frontMeters,
    depth_meters: depthMeters,
    orientation,
    features,
    description: descriptions[lotIndex % descriptions.length],
  };
}

function getLotStatus(index: number): Status {
  if (index % 5 === 0) return 'sold';
  if (index % 3 === 0) return 'reserved';
  if (index % 7 === 0) return 'not_available';
  return 'available';
}

async function seed() {
  console.log('Starting seed...\n');

  // Clear existing data
  console.log('Clearing existing data...');
  await supabase.from('media').delete().not('id', 'is', null);
  await supabase.from('layers').delete().not('id', 'is', null);
  await supabase.from('projects').delete().not('id', 'is', null);
  console.log('  Done\n');

  // Create subdivision project
  console.log('Creating subdivision project...');
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      slug: 'los-alamos',
      name: 'Los Álamos',
      description: 'Desarrollo residencial con lotes en 3 zonas',
      type: 'subdivision',
      status: 'available',
      layer_labels: ['Zona', 'Manzana', 'Lote'],
      max_depth: 3,
      svg_path: '/svgs/mapa-principal.svg',
      city: 'Ciudad Ejemplo',
      state: 'Provincia Ejemplo',
      country: 'Argentina',
    })
    .select()
    .single();

  if (projectError) throw projectError;
  console.log(`  Created: ${project.name}\n`);

  // Zone config
  const zoneConfig = [
    { letter: 'A', blockCount: 4 },
    { letter: 'B', blockCount: 4 },
    { letter: 'C', blockCount: 6 },
  ];

  let totalLayers = 0;

  for (const { letter, blockCount } of zoneConfig) {
    const zoneSlug = `zona-${letter.toLowerCase()}`;

    // Create zone layer (depth 0)
    const { data: zoneLayer, error: zoneError } = await supabase
      .from('layers')
      .insert({
        project_id: project.id,
        parent_id: null,
        depth: 0,
        sort_order: letter.charCodeAt(0) - 65,
        slug: zoneSlug,
        name: `Zona ${letter}`,
        label: `Zona ${letter}`,
        svg_element_id: zoneSlug,
        status: 'available',
        svg_path: `/svgs/zonas/${zoneSlug}.svg`,
        properties: {},
      })
      .select()
      .single();

    if (zoneError) throw zoneError;
    totalLayers++;
    console.log(`  Zone: ${zoneSlug}`);

    // Create block layers (depth 1)
    for (let b = 1; b <= blockCount; b++) {
      const blockSlug = `${zoneSlug}-manzana-${b}`;
      const svgElementId = `manzana-${b}`;

      const { data: blockLayer, error: blockError } = await supabase
        .from('layers')
        .insert({
          project_id: project.id,
          parent_id: zoneLayer.id,
          depth: 1,
          sort_order: b - 1,
          slug: blockSlug,
          name: `Manzana ${b}`,
          label: `M${b}`,
          svg_element_id: svgElementId,
          status: 'available',
          svg_path: `/svgs/manzanas/${blockSlug}.svg`,
          properties: {},
        })
        .select()
        .single();

      if (blockError) throw blockError;
      totalLayers++;

      // Create lot layers (depth 2)
      const lotsToInsert = [];
      for (let l = 1; l <= 8; l++) {
        const lotNum = l.toString().padStart(2, '0');
        const lotSlug = `${blockSlug}-lote-${lotNum}`;
        const isCorner = l === 1 || l === 2 || l === 7 || l === 8;
        const status = getLotStatus(l);

        lotsToInsert.push({
          project_id: project.id,
          parent_id: blockLayer.id,
          depth: 2,
          sort_order: l - 1,
          slug: lotSlug,
          name: `Lote ${l}`,
          label: `L${l}`,
          svg_element_id: `lote-${lotNum}`,
          status,
          svg_path: null,
          properties: generateLotProperties(l, letter, isCorner),
        });
      }

      const { error: lotsError } = await supabase.from('layers').insert(lotsToInsert);
      if (lotsError) throw lotsError;
      totalLayers += lotsToInsert.length;

      console.log(`    Block: ${blockSlug} (${lotsToInsert.length} lots)`);
    }
  }

  console.log(`\nSeed complete!`);
  console.log(`  Project: ${project.name}`);
  console.log(`  Total layers: ${totalLayers}`);
  console.log(`    Zones: ${zoneConfig.length}`);
  console.log(`    Blocks: ${zoneConfig.reduce((sum, z) => sum + z.blockCount, 0)}`);
  console.log(`    Lots: ${zoneConfig.reduce((sum, z) => sum + z.blockCount * 8, 0)}`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
