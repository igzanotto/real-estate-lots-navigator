export type EntityStatus = 'available' | 'reserved' | 'sold' | 'not_available';

export interface BaseEntity {
  id: string;
  slug: string;
  name: string;
  label: string;
  status: EntityStatus;
}

export interface Lot extends BaseEntity {
  blockId: string;
  zoneId: string;
  area: number;
  price?: number;
  isCorner: boolean;
  // Detailed information
  description?: string;
  frontMeters?: number;
  depthMeters?: number;
  orientation?: string;
  features?: string[];
  imageUrl?: string;
}

export interface Block extends BaseEntity {
  zoneId: string;
  lots: Lot[];
  svgPath: string;
}

export interface Zone extends BaseEntity {
  blocks: Block[];
  svgPath: string;
}

export interface HierarchyData {
  zones: Zone[];
  mapSvgPath: string;
}
