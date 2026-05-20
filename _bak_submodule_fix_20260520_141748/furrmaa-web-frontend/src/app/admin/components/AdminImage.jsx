'use client';

/**
 * Shows image with fallback (placeholder) on error – same behaviour as app.
 * Use for product, post, hope post, vet profile images in admin.
 */
const PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect fill="#e5e7eb" width="120" height="120"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-size="40">📦</text></svg>'
);

export function AdminImage({ src, alt = '', className = 'w-full h-full object-cover', placeholder }) {
  const fallback = placeholder || PLACEHOLDER;
  return (
    <img
      src={src || fallback}
      alt={alt}
      className={className}
      onError={(e) => {
        if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
      }}
    />
  );
}

export const ADMIN_IMG_PLACEHOLDER = PLACEHOLDER;
