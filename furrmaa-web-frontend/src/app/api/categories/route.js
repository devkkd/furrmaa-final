/**
 * Proxy: home page categories – fetches from backend so client doesn't hit CORS/wrong URL.
 * GET /api/categories → backend GET /categories or /admin/categories
 */
import { getApiBaseUrl } from '@/lib/apiBase';

export async function GET() {
  try {
    const base = getApiBaseUrl();
    const urls = [`${base}/categories`, `${base}/admin/categories`];
    for (const url of urls) {
      const res = await fetch(url, { next: { revalidate: 600 } });
      if (res.ok) {
        const data = await res.json();
        const list = data?.categories ?? data?.data?.categories ?? (Array.isArray(data) ? data : []);
        return Response.json(
          { success: true, categories: Array.isArray(list) ? list : [] },
          { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=120' } }
        );
      }
    }
    return Response.json({ success: true, categories: [] });
  } catch (e) {
    return Response.json({ success: true, categories: [] });
  }
}
