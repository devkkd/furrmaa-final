/**
 * Resolve product image URL from API shapes (string[] or Cloudinary object[]).
 */
export function getProductImageUri(product: any): string | null {
  if (!product) return null;

  const fromList = normalizeUrlList(product.images);
  if (fromList.length > 0) return fromList[0];

  if (typeof product.image === 'string' && product.image.trim()) {
    return product.image.trim();
  }

  if (product.image && typeof product.image === 'object') {
    return (
      product.image.url ||
      product.image.secure_url ||
      product.image.secureUrl ||
      null
    );
  }

  return null;
}

export function normalizeUrlList(images: unknown): string[] {
  if (images == null) return [];
  const list = Array.isArray(images) ? images : [images];
  return list
    .map((item) => {
      if (typeof item === 'string') {
        const t = item.trim();
        return t || null;
      }
      if (item && typeof item === 'object') {
        const o = item as Record<string, string>;
        return o.url || o.secure_url || o.secureUrl || o.path || null;
      }
      return null;
    })
    .filter((u): u is string => typeof u === 'string' && u.length > 0);
}
