import { HierarchyData, Zone, Block, Lot, EntityStatus } from '@/types/hierarchy.types';

/**
 * Generate 8 lots for a specific block (4 rows × 2 columns)
 */
function generateLots(zoneLetter: string, blockNum: number): Lot[] {
  const lots: Lot[] = [];
  const zoneId = `zona-${zoneLetter.toLowerCase()}`;
  const blockId = `zona-${zoneLetter.toLowerCase()}-manzana-${blockNum}`;

  for (let i = 1; i <= 8; i++) {
    const lotNum = i.toString().padStart(2, '0');
    const lotId = `lote-${lotNum}`;

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
function generateBlocks(zoneLetter: string, blockCount: number): Block[] {
  const blocks: Block[] = [];
  const zoneId = `zona-${zoneLetter.toLowerCase()}`;

  for (let i = 1; i <= blockCount; i++) {
    const blockId = `zona-${zoneLetter.toLowerCase()}-manzana-${i}`;
    const lots = generateLots(zoneLetter, i);

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
  const zoneConfig = [
    { letter: 'A', name: 'Zona A', blockCount: 4 },
    { letter: 'B', name: 'Zona B', blockCount: 4 },
    { letter: 'C', name: 'Zona C', blockCount: 6 },
  ];

  return zoneConfig.map(({ letter, name, blockCount }) => {
    const zoneId = `zona-${letter.toLowerCase()}`;
    const blocks = generateBlocks(letter, blockCount);

    // Determine zone status based on blocks
    const soldCount = blocks.filter(b => b.status === 'sold').length;
    let status: EntityStatus = 'available';
    if (soldCount === blocks.length) status = 'sold';
    else if (soldCount > blocks.length / 2) status = 'reserved';

    return {
      id: zoneId,
      slug: zoneId,
      name,
      label: name,
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
