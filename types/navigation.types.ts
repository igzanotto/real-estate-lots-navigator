export type NavigationLevel = 'map' | 'zone' | 'block';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface NavigationState {
  level: NavigationLevel;
  zoneId?: string;
  blockId?: string;
  breadcrumbs: BreadcrumbItem[];
}
