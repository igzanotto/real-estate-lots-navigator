/**
 * Supabase Storage Image Helpers
 * Generate optimized image URLs from Supabase Storage
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Get public URL for an image in Supabase Storage
 *
 * @param path - Path within the bucket (e.g., "zona-a/manzana-1/lote-01.jpg")
 * @param bucket - Bucket name (default: "images")
 * @param options - Image transformation options
 *
 * @example
 * getStorageImageUrl("zona-a/manzana-1/lote-01.jpg")
 * // Returns: https://xxx.supabase.co/storage/v1/object/public/images/zona-a/manzana-1/lote-01.jpg
 *
 * getStorageImageUrl("zona-a/manzana-1/lote-01.jpg", "images", { width: 800, quality: 85 })
 * // Returns: https://xxx.supabase.co/storage/v1/render/image/public/images/zona-a/manzana-1/lote-01.jpg?width=800&quality=85
 */
export function getStorageImageUrl(
  path: string,
  bucket: string = 'images',
  options?: ImageTransformOptions
): string {
  // Base URL without transformations
  if (!options) {
    return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
  }

  // URL with transformations (requires Supabase Pro plan)
  const params = new URLSearchParams();
  if (options.width) params.set('width', options.width.toString());
  if (options.height) params.set('height', options.height.toString());
  if (options.quality) params.set('quality', options.quality.toString());
  if (options.format) params.set('format', options.format);

  return `${SUPABASE_URL}/storage/v1/render/image/public/${bucket}/${path}?${params.toString()}`;
}

/**
 * Get responsive image URLs (for srcset)
 */
export function getResponsiveImageUrls(path: string, bucket: string = 'images') {
  return {
    thumbnail: getStorageImageUrl(path, bucket, { width: 150, height: 150, quality: 70, format: 'webp' }),
    small: getStorageImageUrl(path, bucket, { width: 400, quality: 80, format: 'webp' }),
    medium: getStorageImageUrl(path, bucket, { width: 800, quality: 85, format: 'webp' }),
    large: getStorageImageUrl(path, bucket, { width: 1200, quality: 90, format: 'webp' }),
    original: getStorageImageUrl(path, bucket),
  };
}

/**
 * Generate storage path for a lot image
 *
 * @example
 * getLotImagePath("zona-a-manzana-1-lote-01", "main")
 * // Returns: "zona-a/manzana-1/lote-01-main.jpg"
 */
export function getLotImagePath(lotSlug: string, type: 'main' | 'gallery-1' | 'gallery-2' | 'gallery-3' = 'main'): string {
  const parts = lotSlug.split('-');
  // zona-a-manzana-1-lote-01 -> zona-a/manzana-1/lote-01-main.jpg
  const zone = parts.slice(0, 2).join('-'); // zona-a
  const block = parts.slice(2, 4).join('-'); // manzana-1
  const lot = parts.slice(4).join('-'); // lote-01

  return `${zone}/${block}/${lot}-${type}.jpg`;
}

/**
 * Check if an image exists in storage (client-side)
 */
export async function imageExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
