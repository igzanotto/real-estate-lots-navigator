// ============================================================
// Enums
// ============================================================

export type EntityStatus = 'available' | 'reserved' | 'sold' | 'not_available';
export type ProjectType = 'subdivision' | 'building';
export type MediaType = 'image' | 'video';
export type MediaPurpose = 'cover' | 'gallery' | 'exploration' | 'transition' | 'thumbnail' | 'floor_plan';

// ============================================================
// Core entities
// ============================================================

export interface Project {
  id: string;
  slug: string;
  name: string;
  description?: string;
  type: ProjectType;
  status: EntityStatus;
  layerLabels: string[];
  maxDepth: number;
  svgPath?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  coordinates?: { lat: number; lng: number };
  settings: Record<string, unknown>;
}

export interface Layer {
  id: string;
  projectId: string;
  parentId: string | null;
  depth: number;
  sortOrder: number;
  slug: string;
  name: string;
  label: string;
  svgElementId?: string;
  status: EntityStatus;
  svgPath?: string;
  properties: Record<string, unknown>;
  // Buyer info (leaf layers)
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerNotes?: string;
  reservedAt?: string;
  soldAt?: string;
  // Populated by data layer
  children?: Layer[];
}

export interface Media {
  id: string;
  projectId: string;
  layerId?: string;
  type: MediaType;
  purpose: MediaPurpose;
  storagePath: string;
  url?: string;
  title?: string;
  description?: string;
  altText?: string;
  sortOrder: number;
  metadata: Record<string, unknown>;
}

// ============================================================
// Page data (what views receive)
// ============================================================

export interface ExplorerPageData {
  project: Project;
  currentLayer: Layer | null;     // null = project root
  children: Layer[];              // children of currentLayer (or root layers)
  media: Media[];                 // media for currentLayer (or project)
  childrenMedia: Record<string, Media[]>;  // layerId → media[]
  breadcrumbs: import('./navigation.types').BreadcrumbItem[];
  isLeafLevel: boolean;           // true if children have no further children
  currentPath: string[];          // layer slugs leading to current position
}

// ============================================================
// Subdivision-specific property helpers
// ============================================================

export interface SubdivisionLotProperties {
  area?: number;
  price?: number;
  is_corner?: boolean;
  front_meters?: number;
  depth_meters?: number;
  orientation?: string;
  features?: string[];
  description?: string;
}

// ============================================================
// Building-specific property helpers
// ============================================================

export interface BuildingUnitProperties {
  area?: number;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor_number?: number;
  unit_type?: string;
  has_balcony?: boolean;
  orientation?: string;
  features?: string[];
  description?: string;
}
