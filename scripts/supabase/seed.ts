import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

/**
 * Seed the database with the Torre Norte building project.
 * 2 towers, 4 floors each, 4 units per floor = 32 units.
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

function getUnitStatus(towerIdx: number, floorNum: number, unitIdx: number): Status {
  const hash = towerIdx * 100 + floorNum * 10 + unitIdx;
  if (hash % 7 === 0) return 'sold';
  if (hash % 5 === 0) return 'reserved';
  if (hash % 11 === 0) return 'not_available';
  return 'available';
}

function generateUnitProperties(
  towerName: string,
  floorNum: number,
  unitLetter: string,
  unitIdx: number,
): Record<string, unknown> {
  const isLarge = unitLetter === 'A' || unitLetter === 'C';
  const area = isLarge ? 85 + (floorNum % 3) * 5 : 55 + (floorNum % 3) * 5;
  const bedrooms = isLarge ? 3 : 2;
  const bathrooms = isLarge ? 2 : 1;
  const unitType = isLarge ? '3 Ambientes' : '2 Ambientes';

  const basePricePerSqm = 1800 + floorNum * 120;
  const status = getUnitStatus(towerName === 'A' ? 0 : 1, floorNum, unitIdx);
  const price = status === 'sold' ? null : area * basePricePerSqm;

  const orientations: Record<string, string> = {
    A: 'Norte', B: 'Este', C: 'Sur', D: 'Oeste',
  };

  const hasBalcony = unitLetter === 'A' || unitLetter === 'B';

  const baseFeatures = ['Aire acondicionado', 'Calefacción central', 'Portero eléctrico'];
  const premiumFeatures = ['Piso de porcelanato', 'Cocina equipada', 'Vestidor'];
  const features = isLarge
    ? [...baseFeatures, ...premiumFeatures]
    : [...baseFeatures, premiumFeatures[0]];

  return {
    area,
    price,
    bedrooms,
    bathrooms,
    unit_type: unitType,
    floor_number: floorNum,
    has_balcony: hasBalcony,
    orientation: orientations[unitLetter] ?? 'Norte',
    features,
    description: `Departamento ${unitType.toLowerCase()} en piso ${floorNum} de Torre ${towerName}. ${hasBalcony ? 'Con balcón.' : ''} Orientación ${orientations[unitLetter]?.toLowerCase() ?? 'norte'}.`,
  };
}

async function seed() {
  console.log('Starting seed...\n');

  // Clear existing data
  console.log('Clearing existing data...');
  await supabase.from('media').delete().not('id', 'is', null);
  await supabase.from('layers').delete().not('id', 'is', null);
  await supabase.from('projects').delete().not('id', 'is', null);
  console.log('  Done\n');

  // Create building project
  console.log('Creating building project...');
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      slug: 'torre-norte',
      name: 'Torre Norte',
      description: 'Complejo residencial de 2 torres con departamentos de 2 y 3 ambientes',
      type: 'building',
      status: 'available',
      layer_labels: ['Torre', 'Piso', 'Departamento'],
      max_depth: 3,
      svg_path: '/svgs/vista-torres.svg',
      city: 'Buenos Aires',
      state: 'CABA',
      country: 'Argentina',
    })
    .select()
    .single();

  if (projectError) throw projectError;
  console.log(`  Created: ${project.name}\n`);

  const towers = ['A', 'B'];
  const floorsPerTower = 4;
  const unitLetters = ['A', 'B', 'C', 'D'];
  let totalLayers = 0;

  for (let t = 0; t < towers.length; t++) {
    const towerName = towers[t];
    const towerSlug = `torre-${towerName.toLowerCase()}`;

    // Tower layer (depth 0)
    // SVG: /svgs/vista-torres.svg → element id="torre-a" / id="torre-b"
    // Children SVG: /svgs/torres/torre-a.svg (shows floors piso-1..piso-4)
    const { data: towerLayer, error: towerError } = await supabase
      .from('layers')
      .insert({
        project_id: project.id,
        parent_id: null,
        depth: 0,
        sort_order: t,
        slug: towerSlug,
        name: `Torre ${towerName}`,
        label: `Torre ${towerName}`,
        svg_element_id: towerSlug,
        status: 'available',
        svg_path: `/svgs/torres/${towerSlug}.svg`,
        properties: {},
      })
      .select()
      .single();

    if (towerError) throw towerError;
    totalLayers++;
    console.log(`  Tower: ${towerSlug}`);

    // Floor layers (depth 1)
    for (let f = 1; f <= floorsPerTower; f++) {
      const floorSlug = `${towerSlug}-piso-${f}`;

      // SVG: /svgs/torres/torre-a.svg → element id="piso-1" .. id="piso-4"
      // Children SVG: /svgs/pisos/torre-a-piso-1.svg (shows deptos depto-a..depto-d)
      const { data: floorLayer, error: floorError } = await supabase
        .from('layers')
        .insert({
          project_id: project.id,
          parent_id: towerLayer.id,
          depth: 1,
          sort_order: f - 1,
          slug: floorSlug,
          name: `Piso ${f}`,
          label: `P${f}`,
          svg_element_id: `piso-${f}`,
          status: 'available',
          svg_path: `/svgs/pisos/${floorSlug}.svg`,
          properties: {},
        })
        .select()
        .single();

      if (floorError) throw floorError;
      totalLayers++;

      // Unit layers (depth 2 — leaves, shown in detail panel)
      // SVG: /svgs/pisos/torre-a-piso-1.svg → element id="depto-a" .. id="depto-d"
      const unitsToInsert = unitLetters.map((letter, idx) => ({
        project_id: project.id,
        parent_id: floorLayer.id,
        depth: 2,
        sort_order: idx,
        slug: `${floorSlug}-depto-${letter.toLowerCase()}`,
        name: `Depto ${letter}`,
        label: `${letter}`,
        svg_element_id: `depto-${letter.toLowerCase()}`,
        status: getUnitStatus(t, f, idx),
        svg_path: null,
        properties: generateUnitProperties(towerName, f, letter, idx),
      }));

      const { error: unitsError } = await supabase.from('layers').insert(unitsToInsert);
      if (unitsError) throw unitsError;
      totalLayers += unitsToInsert.length;

      console.log(`    Floor: ${floorSlug} (${unitsToInsert.length} units)`);
    }
  }

  console.log(`\nSeed complete!`);
  console.log(`  Project: ${project.name}`);
  console.log(`  Total layers: ${totalLayers}`);
  console.log(`    Towers: ${towers.length}`);
  console.log(`    Floors: ${towers.length * floorsPerTower}`);
  console.log(`    Units: ${towers.length * floorsPerTower * unitLetters.length}`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
