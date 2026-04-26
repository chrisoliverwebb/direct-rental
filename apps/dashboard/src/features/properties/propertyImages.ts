export const PROPERTY_IMAGE_FALLBACK_SRC = "/assets/properties/property-placeholder.svg";
export const PROPERTY_GALLERY_LIMIT = 15;
export const PROPERTY_HERO_ASPECT_CLASS = "aspect-[16/9]";
export const PROPERTY_GALLERY_ASPECT_CLASS = "aspect-[16/10]";
export const PROPERTY_THUMBNAIL_ASPECT_CLASS = "aspect-[4/3]";

export function getPropertyImageSrc(image: string | null | undefined) {
  return image && image.trim() ? image : PROPERTY_IMAGE_FALLBACK_SRC;
}

export function formatPropertyImageCount(count: number) {
  return `${count} image${count === 1 ? "" : "s"}`;
}
