/**
 * Extract the SVG element ID from a full slug.
 *
 * Slugs follow the pattern: zona-{X}-manzana-{Y}-lote-{ZZ}
 * SVG IDs are the last meaningful segment: "lote-01", "manzana-1", "zona-a"
 */

/**
 * Extract lot SVG ID from a lot slug.
 * "zona-a-manzana-1-lote-01" → "lote-01"
 */
export function lotSvgId(slug: string): string {
  const match = slug.match(/(lote-\d+)$/);
  return match ? match[1] : slug;
}

/**
 * Extract block SVG ID from a block slug.
 * "zona-a-manzana-1" → "manzana-1"
 */
export function blockSvgId(slug: string): string {
  const match = slug.match(/(manzana-\d+)$/);
  return match ? match[1] : slug;
}
