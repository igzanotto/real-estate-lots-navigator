import { Layer } from '@/types/hierarchy.types';

/**
 * Get the SVG element ID for a layer.
 * Uses the explicit svg_element_id if set, otherwise falls back to the slug.
 */
export function svgElementId(layer: Layer): string {
  return layer.svgElementId ?? layer.slug;
}
