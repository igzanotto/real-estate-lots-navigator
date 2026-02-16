import { createAdminClient } from '@/lib/supabase/admin';
import { HierarchyData, Zone, Block, Lot } from '@/types/hierarchy.types';

/**
 * Fetch all zones with their blocks and lots using admin client
 * Used in generateStaticParams where cookies are not available
 */
export async function getHierarchyDataAdmin(): Promise<HierarchyData> {
  const supabase = createAdminClient();

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
            description: lot.description || undefined,
            frontMeters: lot.front_meters ? Number(lot.front_meters) : undefined,
            depthMeters: lot.depth_meters ? Number(lot.depth_meters) : undefined,
            orientation: lot.orientation || undefined,
            features: lot.features ? (typeof lot.features === 'string' ? JSON.parse(lot.features) : lot.features) : undefined,
            imageUrl: lot.image_url || undefined,
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
