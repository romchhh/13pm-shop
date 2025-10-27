/**
 * Gets the first photo from a product's media array
 * @param media - Array of media items with url and type properties
 * @returns URL of the first photo, or empty string if no photos found
 */
export function getFirstProductImage(
  media: { url: string; type: string }[] | undefined
): string {
  if (!media || media.length === 0) {
    return "";
  }

  // Find the first item with type "photo" (media is now ordered by id from DB)
  const firstPhoto = media.find((m) => m.type === "photo");
  
  // If no photo found, return the first media item (could be video)
  return firstPhoto?.url || media[0]?.url || "";
}

/**
 * Gets the complete image source path for a product
 * @param media - Array of media items OR single first_media object
 * @param fallback - Optional fallback URL if no image found
 * @returns Complete path to image or fallback
 */
export function getProductImageSrc(
  media: { url: string; type: string }[] | { url: string; type: string } | undefined | null,
  fallback = "https://placehold.co/400x600/cccccc/666666?text=No+Image"
): string {
  // Handle new optimized format (single first_media object)
  if (media && !Array.isArray(media) && 'url' in media) {
    return `/api/images/${media.url}`;
  }
  
  // Handle old format (array of media)
  const imageUrl = getFirstProductImage(media as { url: string; type: string }[] | undefined);
  
  if (!imageUrl) {
    return fallback;
  }
  
  return `/api/images/${imageUrl}`;
}

/**
 * Gets the first media (photo or video) from a product's media array
 * @param media - Array of media items
 * @returns First media item or null if no media found
 */
export function getFirstMedia(
  media: { url: string; type: string }[] | { url: string; type: string } | undefined | null
): { url: string; type: string } | null {
  if (!media) return null;
  
  // Handle single media object (first_media format)
  if (!Array.isArray(media) && 'url' in media) {
    return media;
  }
  
  // Handle array of media
  if (Array.isArray(media) && media.length > 0) {
    // Return first item if it exists
    return media[0];
  }
  
  return null;
}

