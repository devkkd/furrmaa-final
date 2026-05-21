import api from '../config/api';

export type ProductReview = {
  _id?: string;
  rating: number;
  comment: string;
  text?: string;
  date?: string;
  user?: { name?: string; email?: string };
};

export function mapProductReviews(reviews: unknown): ProductReview[] {
  if (!Array.isArray(reviews)) return [];
  return reviews
    .filter((r) => r && typeof r === 'object')
    .map((r: any) => ({
      _id: r._id,
      rating: Number(r.rating) || 0,
      comment: (r.comment || r.text || '').trim(),
      date: r.date,
      user: r.user,
    }))
    .filter((r) => r.rating >= 1);
}

export function formatReviewAuthor(review: ProductReview): string {
  const name = review.user?.name || 'Customer';
  const d = review.date ? new Date(review.date) : null;
  const when = d
    ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';
  return when ? `${name} · ${when}` : name;
}

export function starsForRating(rating: number): string {
  const n = Math.round(Math.min(5, Math.max(0, rating)));
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

export function userReviewedProduct(reviews: unknown, userId?: string): boolean {
  if (!userId || !Array.isArray(reviews)) return false;
  return reviews.some((r: any) => {
    const uid = r?.user?._id ?? r?.user;
    return uid != null && String(uid) === String(userId);
  });
}

export async function submitProductReview(
  productId: string,
  rating: number,
  comment: string
) {
  const res = await api.CLIENT.post(`${api.ENDPOINTS.PRODUCTS}/${productId}/reviews`, {
    rating,
    comment,
  });
  return res.data;
}

export async function fetchCanReviewProduct(productId: string) {
  const res = await api.CLIENT.get(`${api.ENDPOINTS.PRODUCTS}/${productId}/can-review`);
  return res.data as {
    allowed?: boolean;
    alreadyReviewed?: boolean;
    reason?: string;
  };
}
