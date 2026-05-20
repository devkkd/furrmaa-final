import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';

export async function userHasDeliveredProduct(userId, productId) {
  const order = await Order.findOne({
    user: userId,
    orderStatus: 'delivered',
    'items.product': productId,
  }).select('_id');
  return Boolean(order);
}

export async function userAlreadyReviewed(product, userId) {
  return (product.reviews || []).some(
    (r) => r.user && r.user.toString() === userId.toString()
  );
}

export function recalculateProductRating(product) {
  const list = product.reviews || [];
  if (!list.length) {
    product.rating = 0;
    return;
  }
  const sum = list.reduce((s, r) => s + (r.rating || 0), 0);
  product.rating = Math.round((sum / list.length) * 10) / 10;
}

export async function addProductReview(productId, userId, rating, comment = '') {
  const r = Number(rating);
  if (!r || r < 1 || r > 5) {
    const err = new Error('Rating must be between 1 and 5');
    err.statusCode = 400;
    throw err;
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  const delivered = await userHasDeliveredProduct(userId, productId);
  if (!delivered) {
    const err = new Error('You can review this product after your order is delivered');
    err.statusCode = 403;
    throw err;
  }

  if (await userAlreadyReviewed(product, userId)) {
    const err = new Error('You have already reviewed this product');
    err.statusCode = 400;
    throw err;
  }

  product.reviews.push({
    user: userId,
    rating: r,
    comment: String(comment || '').trim(),
    date: new Date(),
  });
  recalculateProductRating(product);
  await product.save();
  await product.populate('reviews.user', 'name');

  return product;
}

export async function getReviewEligibility(userId, productId) {
  const product = await Product.findById(productId).select('reviews');
  if (!product) {
    return { allowed: false, alreadyReviewed: false, reason: 'Product not found' };
  }
  if (await userAlreadyReviewed(product, userId)) {
    return { allowed: false, alreadyReviewed: true, reason: 'Already reviewed' };
  }
  const delivered = await userHasDeliveredProduct(userId, productId);
  if (!delivered) {
    return {
      allowed: false,
      alreadyReviewed: false,
      reason: 'Purchase and receive this product to leave a review',
    };
  }
  return { allowed: true, alreadyReviewed: false, reason: null };
}
