/**
 * Proxy: home page categories – fetches from backend so client doesn't hit CORS/wrong URL.
 * GET /api/categories → backend GET /categories or /admin/categories
 */
import { getApiBaseUrl } from '@/lib/apiBase';

const CATEGORY_NAMES = {
  food: 'Food',
  toys: 'Toys',
  accessories: 'Accessories',
  grooming: 'Grooming',
  health: 'Medicine',
  medicine: 'Medicine',
  supplements: 'Supplements',
  bedding: 'Bedding',
  feeders: 'Feeders',
  other: 'Other',
};

export async function GET() {
  try {
    const base = getApiBaseUrl();
    const urls = [`${base}/categories`, `${base}/admin/categories`];
    for (const url of urls) {
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (res.ok) {
        const data = await res.json();
        const rawList = data?.categories ?? data?.data?.categories ?? (Array.isArray(data) ? data : []);
        const list = (Array.isArray(rawList) ? rawList : []).map((cat) => {
          const rawName = String(cat.name || cat.title || '').trim();
          if (!rawName || /^\d+$/.test(rawName)) {
            const properName = CATEGORY_NAMES[cat.slug?.toLowerCase()] || (cat.slug ? cat.slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Category');
            return { ...cat, name: properName };
          }
          return cat;
        });
        return Response.json(
          { success: true, categories: list },
          { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60' } }
        );
      }
    }
    return Response.json({ success: true, categories: [] });
  } catch (e) {
    return Response.json({ success: true, categories: [] });
  }
}
