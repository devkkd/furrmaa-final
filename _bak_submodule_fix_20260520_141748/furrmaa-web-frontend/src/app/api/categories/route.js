/**
 * Proxy: home page categories – fetches from backend so client doesn't hit CORS/wrong URL.
 * GET /api/categories → backend GET /categories or /admin/categories
 */
import { API_BASE_URL } from '@/lib/apiBase';

export async function GET() {
  try {
    const urls = [`${API_BASE_URL}/categories`, `${API_BASE_URL}/admin/categories`];
    for (const url of urls) {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const list = data?.categories ?? data?.data?.categories ?? (Array.isArray(data) ? data : []);
        return Response.json({ success: true, categories: Array.isArray(list) ? list : [] });
      }
    }
    return Response.json({ success: true, categories: [] });
  } catch (e) {
    return Response.json({ success: true, categories: [] });
  }
}
