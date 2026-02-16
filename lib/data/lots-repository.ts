import { createClient } from '@/lib/supabase/server';
import { HierarchyData, Zone, Block, Lot } from '@/types/hierarchy.types';

/**
 * Fetch all zones with their blocks and lots from Supabase
 */
export async function getHierarchyData(): Promise<HierarchyData> {
  const supabase = await createClient();

  // Fetch all zones
  const { data: zones, error: zonesError } = await supabase
    .from('zones')
    .select('*')
    .order('slug');

  if (zonesError) throw zonesError;

  // Fetch all blocks
  const { data: blocks, error: blocksError } = await supabase
    .from('blocks')
    .select('*')
    .order('slug');

  if (blocksError) throw blocksError;

  // Fetch all lots
  const { data: lots, error: lotsError } = await supabase
    .from('lots')
    .select('*')
    .order('slug');

  if (lotsError) throw lotsError;

  // Transform database rows to application types
  const zonesData: Zone[] = zones.map((zone) => {
    const zoneBlocks = blocks
      .filter((block) => block.zone_id === zone.id)
      .map((block) => {
        const blockLots = lots
          .filter((lot) => lot.block_id === block.id)
          .map((lot): Lot => ({
            id: lot.slug,
            slug: lot.slug,
            name: lot.name,
            label: lot.label,
            status: lot.status,
            blockId: block.slug,
            zoneId: zone.slug,
            area: Number(lot.area),
            price: lot.price ? Number(lot.price) : undefined,
            isCorner: lot.is_corner,
          }));

        const blockData: Block = {
          id: block.slug,
          slug: block.slug,
          name: block.name,
          label: block.label,
          status: block.status,
          zoneId: zone.slug,
          svgPath: block.svg_path,
          lots: blockLots,
        };

        return blockData;
      });

    const zoneData: Zone = {
      id: zone.slug,
      slug: zone.slug,
      name: zone.name,
      label: zone.label,
      status: zone.status,
      svgPath: zone.svg_path,
      blocks: zoneBlocks,
    };

    return zoneData;
  });

  return {
    mapSvgPath: '/svgs/mapa-principal.svg',
    zones: zonesData,
  };
}

/**
 * Get zone by slug
 */
export async function getZoneBySlug(slug: string): Promise<Zone | null> {
  const data = await getHierarchyData();
  return data.zones.find((zone) => zone.slug === slug) || null;
}

/**
 * Get block by zone slug and block slug
 */
export async function getBlockBySlug(
  zoneSlug: string,
  blockSlug: string
): Promise<Block | null> {
  const zone = await getZoneBySlug(zoneSlug);
  if (!zone) return null;
  return zone.blocks.find((block) => block.slug === blockSlug) || null;
}

/**
 * Get lot by slug
 */
export async function getLotBySlug(
  zoneSlug: string,
  blockSlug: string,
  lotSlug: string
): Promise<Lot | null> {
  const block = await getBlockBySlug(zoneSlug, blockSlug);
  if (!block) return null;
  return block.lots.find((lot) => lot.slug === lotSlug) || null;
}

/**
 * Get all lots (flat array)
 */
export async function getAllLots(): Promise<Lot[]> {
  const data = await getHierarchyData();
  return data.zones.flatMap((zone) =>
    zone.blocks.flatMap((block) => block.lots)
  );
}

/**
 * Get statistics
 */
export async function getStatistics() {
  const allLots = await getAllLots();
  const available = allLots.filter((l) => l.status === 'available').length;
  const reserved = allLots.filter((l) => l.status === 'reserved').length;
  const sold = allLots.filter((l) => l.status === 'sold').length;
  const notAvailable = allLots.filter((l) => l.status === 'not_available').length;

  const data = await getHierarchyData();

  return {
    total: allLots.length,
    available,
    reserved,
    sold,
    notAvailable,
    zones: data.zones.length,
    blocks: data.zones.reduce((sum, z) => sum + z.blocks.length, 0),
  };
}
