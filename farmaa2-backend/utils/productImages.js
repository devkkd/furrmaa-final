/**
 * Normalize product images to an array of HTTPS URL strings (Cloudinary or any CDN).
 */
export function normalizeProductImageUrls(images) {
  if (images == null) return [];

  const list = Array.isArray(images) ? images : [images];

  return list
    .map((item) => {
      if (typeof item === 'string') {
        const trimmed = item.trim();
        return trimmed || null;
      }
      if (item && typeof item === 'object') {
        return (
          item.url ||
          item.secure_url ||
          item.secureUrl ||
          item.path ||
          null
        );
      }
      return null;
    })
    .filter((url) => typeof url === 'string' && url.length > 0);
}

export function normalizeProductPayload(body = {}) {
  const payload = { ...body };
  if (body.images !== undefined) {
    payload.images = normalizeProductImageUrls(body.images);
  }
  return payload;
}
