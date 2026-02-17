import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

/**
 * Migration script: zones/blocks/lots → projects/layers/media
 *
 * Reads existing data from the old tables and inserts into the new schema.
 * Run this AFTER creating the new tables (SETUP_SCHEMA_V2.sql).
 *
 * Usage: npx tsx scripts/supabase/migrate-data.ts
 */

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrate() {
  console.log('Starting migration: zones/blocks/lots → projects/layers/media\n');

  // 1. Read existing data
  console.log('Reading existing data...');
  const [zonesRes, blocksRes, lotsRes] = await Promise.all([
    supabase.from('zones').select('*').order('slug'),
    supabase.from('blocks').select('*').order('slug'),
    supabase.from('lots').select('*').order('slug'),
  ]);

  if (zonesRes.error) throw zonesRes.error;
  if (blocksRes.error) throw blocksRes.error;
  if (lotsRes.error) throw lotsRes.error;

  const zones = zonesRes.data;
  const blocks = blocksRes.data;
  const lots = lotsRes.data;

  console.log(`  Found: ${zones.length} zones, ${blocks.length} blocks, ${lots.length} lots\n`);

  // 2. Create the project
  console.log('Creating project...');
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
      country: 'Argentina',
    })
    .select()
    .single();

  if (projectError) throw projectError;
  console.log(`  Created project: ${project.name} (${project.id})\n`);

  // 3. Migrate zones → layers (depth 0)
  console.log('Migrating zones to layers (depth 0)...');
  const zoneIdMap = new Map<string, string>(); // old zone.id → new layer.id

  for (let i = 0; i < zones.length; i++) {
    const zone = zones[i];
    const { data: layer, error } = await supabase
      .from('layers')
      .insert({
        project_id: project.id,
        parent_id: null,
        depth: 0,
        sort_order: i,
        slug: zone.slug,
        name: zone.name,
        label: zone.label,
        svg_element_id: zone.slug, // SVG ID matches the slug
        status: zone.status,
        svg_path: zone.svg_path,
        properties: {},
      })
      .select()
      .single();

    if (error) throw error;
    zoneIdMap.set(zone.id, layer.id);
    console.log(`  ${zone.name} → layer ${layer.id}`);
  }
  console.log();

  // 4. Migrate blocks → layers (depth 1)
  console.log('Migrating blocks to layers (depth 1)...');
  const blockIdMap = new Map<string, string>(); // old block.id → new layer.id

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const parentLayerId = zoneIdMap.get(block.zone_id);
    if (!parentLayerId) {
      console.error(`  Skipping block ${block.slug}: parent zone not found`);
      continue;
    }

    // Extract SVG element ID: "zona-a-manzana-1" → "manzana-1"
    const svgId = block.slug.match(/(manzana-\d+)$/)?.[1] ?? block.slug;

    const { data: layer, error } = await supabase
      .from('layers')
      .insert({
        project_id: project.id,
        parent_id: parentLayerId,
        depth: 1,
        sort_order: i,
        slug: block.slug,
        name: block.name,
        label: block.label,
        svg_element_id: svgId,
        status: block.status,
        svg_path: block.svg_path,
        properties: {},
      })
      .select()
      .single();

    if (error) throw error;
    blockIdMap.set(block.id, layer.id);
    console.log(`  ${block.slug} → layer ${layer.id}`);
  }
  console.log();

  // 5. Migrate lots → layers (depth 2) + media
  console.log('Migrating lots to layers (depth 2)...');
  let mediaCount = 0;

  for (let i = 0; i < lots.length; i++) {
    const lot = lots[i];
    const parentLayerId = blockIdMap.get(lot.block_id);
    if (!parentLayerId) {
      console.error(`  Skipping lot ${lot.slug}: parent block not found`);
      continue;
    }

    // Extract SVG element ID: "zona-a-manzana-1-lote-01" → "lote-01"
    const svgId = lot.slug.match(/(lote-\d+)$/)?.[1] ?? lot.slug;

    // Pack lot-specific fields into properties JSONB
    const properties: Record<string, unknown> = {};
    if (lot.area != null) properties.area = Number(lot.area);
    if (lot.price != null) properties.price = Number(lot.price);
    if (lot.is_corner != null) properties.is_corner = lot.is_corner;
    if (lot.front_meters != null) properties.front_meters = Number(lot.front_meters);
    if (lot.depth_meters != null) properties.depth_meters = Number(lot.depth_meters);
    if (lot.orientation) properties.orientation = lot.orientation;
    if (lot.description) properties.description = lot.description;

    // Parse features
    let features: string[] | undefined;
    if (lot.features) {
      if (typeof lot.features === 'string') {
        try { features = JSON.parse(lot.features); } catch { /* ignore */ }
      } else if (Array.isArray(lot.features)) {
        features = lot.features;
      }
    }
    if (features) properties.features = features;

    const { data: layer, error } = await supabase
      .from('layers')
      .insert({
        project_id: project.id,
        parent_id: parentLayerId,
        depth: 2,
        sort_order: i,
        slug: lot.slug,
        name: lot.name,
        label: lot.label,
        svg_element_id: svgId,
        status: lot.status,
        svg_path: null,
        properties,
        buyer_name: lot.buyer_name || null,
        buyer_email: lot.buyer_email || null,
        buyer_phone: lot.buyer_phone || null,
        buyer_notes: lot.buyer_notes || null,
        reserved_at: lot.reserved_at || null,
        sold_at: lot.sold_at || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Migrate image_url to media table
    if (lot.image_url) {
      const { error: mediaError } = await supabase.from('media').insert({
        project_id: project.id,
        layer_id: layer.id,
        type: 'image',
        purpose: 'gallery',
        storage_path: lot.image_url,
        url: lot.image_url,
        title: `${lot.name} - Imagen`,
        sort_order: 0,
        metadata: {},
      });
      if (mediaError) {
        console.error(`  Warning: failed to migrate image for ${lot.slug}:`, mediaError.message);
      } else {
        mediaCount++;
      }
    }
  }
  console.log(`  Migrated ${lots.length} lots and ${mediaCount} images\n`);

  // Summary
  console.log('Migration complete!');
  console.log(`  Project: ${project.name}`);
  console.log(`  Layers: ${zones.length + blocks.length + lots.length}`);
  console.log(`    Depth 0 (zones): ${zones.length}`);
  console.log(`    Depth 1 (blocks): ${blocks.length}`);
  console.log(`    Depth 2 (lots): ${lots.length}`);
  console.log(`  Media: ${mediaCount}`);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
