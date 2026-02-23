import { Image } from '@/types';

/**
 * Insert Cloudinary transformations into a raw URL.
 * Works for both /image/upload/ and /video/upload/ paths.
 *
 * @param url - Raw Cloudinary URL from the API
 * @param transformations - Comma/slash separated transformation string
 * @returns Transformed URL, or original URL if invalid
 *
 * @example
 *   getOptimizedUrl(url, 'f_auto,q_auto,w_400')
 *   // => https://res.cloudinary.com/.../image/upload/f_auto,q_auto,w_400/v1234/...
 */
export function getOptimizedUrl(url: string, transformations: string): string {
  if (!url || !transformations) return url || '';
  return url.replace(
    /\/(image|video)\/upload\//,
    `/$1/upload/${transformations}/`
  );
}

/**
 * Product card thumbnail - 400×400 auto-cropped, optimized format & quality.
 */
export function getProductCardUrl(url: string): string {
  return getOptimizedUrl(url, 'f_auto,q_auto,w_400,h_400,c_fill,g_auto');
}

/**
 * Product detail main image - 800px wide, optimized.
 */
export function getProductDetailUrl(url: string): string {
  return getOptimizedUrl(url, 'f_auto,q_auto,w_800');
}

/**
 * Billboard / hero banner - 1280×720 auto-focused crop.
 */
export function getBillboardUrl(url: string): string {
  return getOptimizedUrl(url, 'f_auto,q_auto,w_1280,h_720,c_fill,g_auto');
}

/**
 * Category image - 300×300 square.
 */
export function getCategoryImageUrl(url: string): string {
  return getOptimizedUrl(url, 'f_auto,q_auto,w_300,h_300,c_fill');
}

/**
 * Gallery thumbnail - 100×100 square.
 */
export function getGalleryThumbUrl(url: string): string {
  return getOptimizedUrl(url, 'f_auto,q_auto,w_100,h_100,c_fill');
}

/**
 * Promotional banner - 1200px wide, optimized.
 */
export function getPromotionalBannerUrl(url: string): string {
  return getOptimizedUrl(url, 'f_auto,q_auto,w_1200');
}

/**
 * Order confirmation thumbnail - small 96×96 square.
 */
export function getOrderItemThumbUrl(url: string): string {
  return getOptimizedUrl(url, 'f_auto,q_auto,w_96,h_96,c_fill');
}

/**
 * Upcoming product card - same as product card.
 */
export function getUpcomingProductUrl(url: string): string {
  return getOptimizedUrl(url, 'f_auto,q_auto,w_400,h_400,c_fill,g_auto');
}

// -- Image helpers ------------------------------------------------------

/**
 * Sort images by position field (ascending), falling back to original order.
 */
export function sortImagesByPosition(images: Image[]): Image[] {
  return [...images].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

/**
 * Get the featured / hero image, falling back to the first image.
 */
export function getFeaturedImage(images: Image[]): Image | undefined {
  return images.find((img) => img.isFeatured) || images[0];
}

/**
 * Build accessible alt text with fallback.
 */
export function getAltText(image: Image, fallback: string): string {
  return image.altText || fallback;
}
