import { HierarchyData, Zone, Block, Lot, EntityStatus } from '@/types/hierarchy.types';

/**
 * Generate 20 lots for a specific block
 */
function generateLots(zoneNum: number, blockNum: number): Lot[] {
  const lots: Lot[] = [];
  const zoneId = `zona-${zoneNum}`;
  const blockId = `zona-${zoneNum}-manzana-${blockNum}`;

  for (let i = 1; i <= 20; i++) {
    const lotNum = i.toString().padStart(2, '0');
    const lotId = `lote-${lotNum}`;

    // Simulate different statuses
    let status: EntityStatus = 'available';
    if (i % 7 === 0) status = 'sold';
    else if (i % 5 === 0) status = 'reserved';
    else if (i % 11 === 0) status = 'not_available';

    // Corner lots: first and last in each row (simplified logic)
    const isCorner = i === 1 || i === 20 || i === 10 || i === 11;

    // Base area: 250-400 m² with variation
    const baseArea = 300;
    const variation = (i % 10) * 10;
    const area = baseArea + variation;

    // Price: $50-80 per m² depending on status and corner
    const pricePerSqm = isCorner ? 80 : 60;
    const price = status === 'sold' ? undefined : area * pricePerSqm;

    lots.push({
      id: lotId,
      slug: lotId,
      name: `Lote ${i}`,
      label: `L${i}`,
      status,
      blockId,
      zoneId,
      area,
      price,
      isCorner,
    });
  }

  return lots;
}

/**
 * Generate all blocks for a zone
 */
function generateBlocks(zoneNum: number): Block[] {
  const blocks: Block[] = [];
  const zoneId = `zona-${zoneNum}`;

  for (let i = 1; i <= 4; i++) {
    const blockId = `zona-${zoneNum}-manzana-${i}`;
    const lots = generateLots(zoneNum, i);

    // Determine block status based on lots
    const soldCount = lots.filter(l => l.status === 'sold').length;
    let status: EntityStatus = 'available';
    if (soldCount === lots.length) status = 'sold';
    else if (soldCount > lots.length / 2) status = 'reserved';

    blocks.push({
      id: blockId,
      slug: blockId,
      name: `Manzana ${i}`,
      label: `M${i}`,
      status,
      zoneId,
      svgPath: `/svgs/manzanas/${blockId}.svg`,
      lots,
    });
  }

  return blocks;
}

/**
 * Generate all zones
 */
function generateZones(): Zone[] {
  const zoneNames = ['Zona Norte', 'Zona Centro', 'Zona Sur'];

  return zoneNames.map((name, index) => {
    const zoneNum = index + 1;
    const zoneId = `zona-${zoneNum}`;
    const blocks = generateBlocks(zoneNum);

    // Determine zone status based on blocks
    const soldCount = blocks.filter(b => b.status === 'sold').length;
    let status: EntityStatus = 'available';
    if (soldCount === blocks.length) status = 'sold';
    else if (soldCount > blocks.length / 2) status = 'reserved';

    return {
      id: zoneId,
      slug: zoneId,
      name,
      label: `Zona ${zoneNum}`,
      status,
      svgPath: `/svgs/zonas/${zoneId}.svg`,
      blocks,
    };
  });
}

/**
 * Main hierarchy data export
 */
export const hierarchyData: HierarchyData = {
  mapSvgPath: '/svgs/mapa-principal.svg',
  zones: generateZones(),
};

/**
 * Helper: Get zone by ID
 */
export function getZoneById(zoneId: string): Zone | undefined {
  return hierarchyData.zones.find(zone => zone.slug === zoneId);
}

/**
 * Helper: Get block by zone ID and block ID
 */
export function getBlockById(zoneId: string, blockId: string): Block | undefined {
  const zone = getZoneById(zoneId);
  return zone?.blocks.find(block => block.slug === blockId);
}

/**
 * Helper: Get lot by IDs
 */
export function getLotById(zoneId: string, blockId: string, lotId: string): Lot | undefined {
  const block = getBlockById(zoneId, blockId);
  return block?.lots.find(lot => lot.slug === lotId);
}

/**
 * Helper: Get all lots (flat array)
 */
export function getAllLots(): Lot[] {
  return hierarchyData.zones.flatMap(zone =>
    zone.blocks.flatMap(block => block.lots)
  );
}

/**
 * Helper: Get statistics
 */
export function getStatistics() {
  const allLots = getAllLots();
  const available = allLots.filter(l => l.status === 'available').length;
  const reserved = allLots.filter(l => l.status === 'reserved').length;
  const sold = allLots.filter(l => l.status === 'sold').length;
  const notAvailable = allLots.filter(l => l.status === 'not_available').length;

  return {
    total: allLots.length,
    available,
    reserved,
    sold,
    notAvailable,
    zones: hierarchyData.zones.length,
    blocks: hierarchyData.zones.reduce((sum, z) => sum + z.blocks.length, 0),
  };
}
