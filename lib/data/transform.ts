import { HierarchyData, Zone, Block, Lot } from '@/types/hierarchy.types';

interface RawZone {
  id: string;
  slug: string;
  name: string;
  label: string;
  status: string;
  svg_path: string;
}

interface RawBlock {
  id: string;
  zone_id: string;
  slug: string;
  name: string;
  label: string;
  status: string;
  svg_path: string;
}

interface RawLot {
  slug: string;
  name: string;
  label: string;
  status: string;
  block_id: string;
  area: number;
  price: number | null;
  is_corner: boolean;
  description: string | null;
  front_meters: number | null;
  depth_meters: number | null;
  orientation: string | null;
  features: unknown;
  image_url: string | null;
}

function parseFeatures(features: unknown): string[] | undefined {
  if (!features) return undefined;
  if (typeof features === 'string') return JSON.parse(features);
  if (Array.isArray(features)) return features as string[];
  return undefined;
}

/**
 * Transform raw database rows into the application's HierarchyData structure.
 * Shared by both the server and admin repositories.
 */
export function transformToHierarchy(
  zones: RawZone[],
  blocks: RawBlock[],
  lots: RawLot[]
): HierarchyData {
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
            status: lot.status as Lot['status'],
            blockId: block.slug,
            zoneId: zone.slug,
            area: Number(lot.area),
            price: lot.price ? Number(lot.price) : undefined,
            isCorner: lot.is_corner,
            description: lot.description || undefined,
            frontMeters: lot.front_meters ? Number(lot.front_meters) : undefined,
            depthMeters: lot.depth_meters ? Number(lot.depth_meters) : undefined,
            orientation: lot.orientation || undefined,
            features: parseFeatures(lot.features),
            imageUrl: lot.image_url || undefined,
          }));

        const blockData: Block = {
          id: block.slug,
          slug: block.slug,
          name: block.name,
          label: block.label,
          status: block.status as Block['status'],
          zoneId: zone.slug,
          svgPath: block.svg_path,
          lots: blockLots,
        };

        return blockData;
      });

    return {
      id: zone.slug,
      slug: zone.slug,
      name: zone.name,
      label: zone.label,
      status: zone.status as Zone['status'],
      svgPath: zone.svg_path,
      blocks: zoneBlocks,
    } satisfies Zone;
  });

  return {
    mapSvgPath: '/svgs/mapa-principal.svg',
    zones: zonesData,
  };
}
