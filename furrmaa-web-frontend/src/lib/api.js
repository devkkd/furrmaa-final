/**
 * Web API client – backend integration
 */
import { getApiBaseUrl } from '@/lib/apiBase';
import { withCache, clearApiCache, fetchWithTimeout, getCached, setCached } from '@/lib/apiCache';

export const getBaseUrl = () => getApiBaseUrl();

let authConfigCache = null;
let meCache = { user: null, at: 0 };
const ME_CACHE_MS = 90_000;
const AUTH_CONFIG_CACHE_MS = 600_000;

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || localStorage.getItem('authToken') || null;
}

export function setToken(token) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('token', token);
    meCache = { user: null, at: 0 };
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    meCache = { user: null, at: 0 };
  }
}

/** Backend auth UI flag — Firebase vs Auth0 social login (OTP APIs stay enabled either way). */
export async function fetchAuthPublicConfig() {
  if (authConfigCache && Date.now() - authConfigCache.at < AUTH_CONFIG_CACHE_MS) {
    return authConfigCache.value;
  }
  const base = getBaseUrl();
  try {
    const res = await fetchWithTimeout(`${base}/auth/public-config`, { cache: 'force-cache' }, 8_000);
    const data = await res.json().catch(() => ({}));
    const value = { useFirebaseAuth: data.useFirebaseAuth === true };
    authConfigCache = { value, at: Date.now() };
    return value;
  } catch {
    return {
      useFirebaseAuth: process.env.NEXT_PUBLIC_USE_FIREBASE_AUTH === 'true',
    };
  }
}

/** Send OTP to phone/email – backend (Mongo) OTP */
export async function sendOtp(identifier) {
  const base = getBaseUrl();
  const value = String(identifier || '').trim();
  const isEmail = value.includes('@');
  const body = isEmail
    ? { email: value.toLowerCase() }
    : { phone: value.replace(/\D/g, '').slice(-10) };
  try {
    const res = await fetchWithTimeout(`${base}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }, 15_000);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
    return data;
  } catch (e) {
    if (e?.name === 'AbortError') {
      throw new Error('Request timed out. Backend start karo ya dubara try karo.');
    }
    throw e;
  }
}

/** Login after Firebase client sign-in (Google / Apple / Phone). Backend verifies ID token and returns JWT. */
export async function loginWithFirebaseIdToken(firebaseToken, name) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firebaseToken,
      ...(name ? { name } : {}),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Firebase login failed');
  return data;
}

/** Verify OTP and login – returns { token, user } */
export async function verifyOtp(identifier, otp, name) {
  const base = getBaseUrl();
  const value = String(identifier || '').trim();
  const isEmail = value.includes('@');
  const body = {
    otp: otp.toString().trim(),
    name: name || undefined,
    ...(isEmail
      ? { email: value.toLowerCase() }
      : { phone: value.replace(/\D/g, '').slice(-10) }),
  };
  const res = await fetch(`${base}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Invalid OTP');
  return data;
}

/** Get current user (protected) – for /account and after refresh */
export async function fetchMe({ fresh = false } = {}) {
  if (!fresh && meCache.user && Date.now() - meCache.at < ME_CACHE_MS) {
    return meCache.user;
  }
  const base = getBaseUrl();
  const res = await fetchWithTimeout(`${base}/auth/me`, { headers: authHeaders() }, 10_000);
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    meCache = { user: null, at: 0 };
    return null;
  }
  if (!res.ok) throw new Error(data.message || 'Failed to load user');
  meCache = { user: data.user, at: Date.now() };
  return data.user;
}

/** Update user profile (name, email, phone) */
export async function updateProfile(body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/users/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(data.message || 'Failed to update profile');
  return data.user;
}

/** Upload profile/general image (protected) */
export async function uploadImage(file, folder = 'furmaa/users') {
  const base = getBaseUrl();
  const token = getToken();
  if (!token) throw new Error('Please login first');
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);
  const res = await fetch(`${base}/upload/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data.image?.url || data.url;
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Fetch products from backend */
export async function fetchProducts(params = {}) {
  const base = getBaseUrl();
  const q = new URLSearchParams();
  if (params.category) q.set('category', params.category);
  if (params.petType) q.set('petType', params.petType);
  if (params.age) q.set('age', params.age);
  if (params.size) q.set('size', params.size);
  if (params.dietary) q.set('dietary', params.dietary);
  if (params.search) q.set('search', params.search);
  if (params.sortBy) q.set('sortBy', params.sortBy);
  if (params.minRating != null) q.set('minRating', params.minRating);
  if (params.minPrice != null) q.set('minPrice', params.minPrice);
  if (params.maxPrice != null) q.set('maxPrice', params.maxPrice);
  if (params.limit != null) q.set('limit', String(params.limit));
  if (params.bestDeals) q.set('bestDeals', 'true');
  const url = `${base}/products${q.toString() ? `?${q}` : ''}`;
  const cacheKey = `products:${url}`;

  return withCache(cacheKey, 180_000, async () => {
    const res = await fetchWithTimeout(url, {}, 12_000);
    if (!res.ok) throw new Error('Products fetch failed');
    const data = await res.json();
    return data.products || [];
  });
}

/** Fetch single product by ID */
export async function fetchProductById(id) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/products/${id}`);
  if (!res.ok) throw new Error('Product not found');
  const data = await res.json();
  return data.product;
}

/** Normalize backend product to UI shape (ProductCard, detail page) */
export function normalizeProduct(p) {
  if (!p) return null;
  const price = p.discountPrice ?? p.price ?? 0;
  const oldPrice = p.discountPrice ? p.price : undefined;
  const petTypeArr = Array.isArray(p.petType) ? p.petType : [p.petType].filter(Boolean);
  return {
    ...p,
    id: p._id || p.id,
    _id: p._id,
    name: p.name || 'Product',
    price,
    oldPrice,
    image: (p.images && p.images[0]) || p.image || '/images/products/p1.png',
    images: p.images || [],
    petType: petTypeArr,
  };
}

/** Fetch vet service types (categories for filter) – public */
export async function fetchVetServiceTypes() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/vet-service-types`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.types || [];
}

/** Fetch veterinarians from backend (serviceType = filter by type set in Manage Veterinarians) */
export async function fetchVeterinarians(params = {}) {
  const base = getBaseUrl();
  const q = new URLSearchParams();
  if (params.category) q.set('category', params.category);
  if (params.location) q.set('location', params.location);
  if (params.city) q.set('city', params.city);
  if (params.specialization) q.set('specialization', params.specialization);
  if (params.serviceType && params.serviceType !== 'All') q.set('serviceType', params.serviceType);
  const url = `${base}/veterinarians${q.toString() ? `?${q}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Veterinarians fetch failed');
  const data = await res.json();
  return data.veterinarians || [];
}

/** Fetch service providers from backend */
export async function fetchServiceProviders(params = {}) {
  const base = getBaseUrl();
  const q = new URLSearchParams();
  if (params.serviceType) q.set('serviceType', params.serviceType);
  const url = `${base}/service-providers${q.toString() ? `?${q}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Service providers fetch failed');
  const data = await res.json();
  return data.providers || data.serviceProviders || [];
}

/** Fetch cremation centers from backend */
export async function fetchCremationCenters(params = {}) {
  const base = getBaseUrl();
  const q = new URLSearchParams();
  if (params.location) q.set('location', params.location);
  if (params.city) q.set('city', params.city);
  if (params.state) q.set('state', params.state);
  if (params.search) q.set('search', params.search);
  const url = `${base}/cremation/centers${q.toString() ? `?${q}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Cremation centers fetch failed');
  const data = await res.json();
  return data.centers || [];
}

/** Fetch training videos from backend */
export async function fetchTrainingVideos(params = {}) {
  const base = getBaseUrl();
  const q = new URLSearchParams();
  if (params.category) q.set('category', params.category);
  if (params.petType) q.set('petType', params.petType);
  if (params.level) q.set('level', params.level);
  const url = `${base}/training-videos${q.toString() ? `?${q}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Training videos fetch failed');
  const data = await res.json();
  return data.videos || [];
}

/** Get user's training progress (completed video IDs). Requires auth. */
export async function fetchTrainingProgress(params = {}) {
  if (!getToken()) return { completedVideoIds: [], byCategory: {} };
  const base = getBaseUrl();
  const q = new URLSearchParams();
  if (params.category) q.set('category', params.category);
  const url = `${base}/training-progress${q.toString() ? `?${q}` : ''}`;
  try {
    const res = await fetch(url, { headers: authHeaders() });
    if (res.status === 401) return { completedVideoIds: [], byCategory: {} };
    if (!res.ok) throw new Error('Progress fetch failed');
    const data = await res.json();
    return { completedVideoIds: data.completedVideoIds || [], byCategory: data.byCategory || {} };
  } catch {
    return { completedVideoIds: [], byCategory: {} };
  }
}

/** Mark a video as complete. Requires auth. */
export async function markTrainingProgressComplete({ videoId, category }) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/training-progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ videoId, category: category || 'basic' }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to mark complete');
  }
  return res.json();
}

/** Fetch single training video by ID */
export async function fetchTrainingVideoById(id) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/training-videos/${id}`);
  if (!res.ok) throw new Error('Training video not found');
  const data = await res.json();
  return data.video;
}

/** Fetch Hope posts (lost & found / adoption). */
export async function fetchHopePosts(params = {}) {
  const base = getBaseUrl();
  const q = new URLSearchParams();
  if (params.postType) q.set('postType', params.postType);
  if (params.petType) q.set('petType', params.petType);
  if (params.location) q.set('location', params.location);
  if (params.search) q.set('search', params.search);
  if (params.page != null) q.set('page', params.page);
  if (params.limit != null) q.set('limit', params.limit);
  const url = `${base}/hope/posts${q.toString() ? `?${q}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Hope posts fetch failed');
  const data = await res.json();
  return data.posts || [];
}

/** Get user subscription. Requires auth. */
export async function fetchSubscription() {
  if (!getToken()) return { subscription: null };
  const base = getBaseUrl();
  const res = await fetch(`${base}/subscription`, { headers: authHeaders() });
  if (res.status === 401) return { subscription: null };
  if (!res.ok) throw new Error('Subscription fetch failed');
  const data = await res.json();
  return { subscription: data.subscription };
}

/** Upgrade subscription plan. Requires auth. */
export async function upgradeSubscription(plan) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/subscription/upgrade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ plan: plan || 'free' }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Upgrade failed');
  }
  return res.json();
}

/** Purchase training subscription. Requires auth. */
export async function purchaseTrainingSubscription(paymentData = {}) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/subscription/create-payment-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      plan: paymentData.plan || 'training',
      amount: paymentData.amount || 999,
      currency: 'INR',
    }),
  });
  if (res.status === 401) throw new Error('Please login to purchase subscription');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to initiate training purchase');
  return data;
}

/** Pay for training subscription using wallet balance. Requires auth. */
export async function payTrainingSubscriptionWithWallet(amount = 999) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/subscription/pay-with-wallet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ plan: 'training', amount }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Wallet payment failed');
  return data;
}

/** Verify training subscription payment after Razorpay success */
export async function verifyTrainingSubscriptionPayment(payload) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/subscription/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Subscription payment verification failed');
  return data;
}

/** Fetch pet events (public). city optional. */
export async function fetchPetEvents(params = {}) {
  const base = getBaseUrl();
  const q = new URLSearchParams();
  if (params.location) q.set('location', params.location);
  if (params.city && params.city !== 'All') q.set('city', params.city);
  if (params.search) q.set('search', params.search);
  const url = `${base}/pet-events${q.toString() ? `?${q}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Pet events fetch failed');
  const data = await res.json();
  return data.events || [];
}

/** Register for a pet event (public). */
export async function registerPetEvent(eventId, { name, email, phone, notes }) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/pet-events/${eventId}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name?.trim(), email: email?.trim(), phone: phone?.trim(), notes: notes?.trim() || undefined }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
}

/** Fetch FAQs from backend */
export async function fetchFaqs(params = {}) {
  const base = getBaseUrl();
  const q = new URLSearchParams();
  if (params.category) q.set('category', params.category);
  const url = `${base}/faq${q.toString() ? `?${q}` : ''}`;
  return withCache(`faqs:${url}`, 300_000, async () => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('FAQs fetch failed');
    const data = await res.json();
    return data.faqs || [];
  });
}

/** Fetch public explore content (articles/videos/guides/news/events). */
export async function fetchExploreContent(params = {}) {
  const base = getBaseUrl();
  const q = new URLSearchParams();
  if (params.category) q.set('category', params.category);
  if (params.type) q.set('type', params.type);
  if (params.petType) q.set('petType', params.petType);
  if (params.featured != null) q.set('featured', params.featured ? 'true' : 'false');
  const url = `${base}/explore${q.toString() ? `?${q}` : ''}`;
  return withCache(`explore:${url}`, 120_000, async () => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Explore content fetch failed');
    const data = await res.json();
    return data.content || [];
  });
}
 
/** Fetch single Hope post by ID */
export async function fetchHopePostById(id) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/hope/posts/${id}`);
  if (!res.ok) throw new Error('Hope post not found');
  const data = await res.json();
  return data.post;
}

/** Fetch main categories for home page sections (Everyday Essentials, All Round Wellness) */
export async function fetchMainCategories(params = {}) {
  const base = getBaseUrl();
  const q = new URLSearchParams();
  if (params.section) q.set('section', params.section); // 'everyday' or 'wellness'
  if (params.petType) q.set('petType', params.petType);
  const url = `${base}/categories/main${q.toString() ? `?${q}` : ''}`;
  return withCache(`categories:main:${url}`, 300_000, async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return data.categories || [];
    } catch {
      return [];
    }
  });
}

/** Fetch all categories for shop/home (admin-managed; no auth required). Tries same-origin /api/categories first (proxy), then direct backend. */
export async function fetchAllCategories() {
  const base = getBaseUrl();
  const parse = (data) => data?.categories ?? data?.data?.categories ?? (Array.isArray(data) ? data : []);
  const tryUrl = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json().catch(() => ({}));
    return parse(data);
  };
  return withCache('categories:all', 300_000, async () => {
    try {
      const list =
        await tryUrl('/api/categories')
          .catch(() => tryUrl(`${base}/categories?section=all`))
          .catch(() => tryUrl(`${base}/admin/categories`));
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  });
}

/** Fetch product sizes for filter (admin-managed) */
export async function fetchSizes() {
  const base = getBaseUrl();
  return withCache('sizes:all', 300_000, async () => {
    try {
      const res = await fetch(`${base}/sizes`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.sizes || [];
    } catch {
      return [];
    }
  });
}

/** Fetch product dietary options for filter (admin-managed) */
export async function fetchDietary() {
  const base = getBaseUrl();
  return withCache('dietary:all', 300_000, async () => {
    try {
      const res = await fetch(`${base}/dietary`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.dietary || [];
    } catch {
      return [];
    }
  });
}

/** Fetch user orders (protected) */
export async function fetchOrders() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/orders/my-orders`, { headers: authHeaders() });
  if (res.status === 401) return [];
  if (!res.ok) throw new Error('Failed to fetch orders');
  const data = await res.json();
  return data.orders || [];
}

/** Fetch single order by ID (protected) */
export async function fetchOrderById(orderId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/orders/${orderId}`, { headers: authHeaders() });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error('Order not found');
  const data = await res.json();
  return data.order;
}

/** Fetch user addresses (protected) */
export async function fetchAddresses() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/addresses`, { headers: authHeaders() });
  if (res.status === 401) return [];
  if (!res.ok) throw new Error('Failed to fetch addresses');
  const data = await res.json();
  return data.addresses || [];
}

/** Place order (protected) */
export async function placeOrder(orderBody) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(orderBody),
  });
  if (res.status === 401) throw new Error('Please log in to place order.');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to place order.');
  return data;
}

/** Create Razorpay order for product checkout */
export async function createCheckoutPaymentOrder({ amount, receipt, notes }) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/orders/create-payment-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ amount, currency: 'INR', receipt, notes }),
  });
  if (res.status === 401) throw new Error('Please log in to continue payment.');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to create checkout payment order');
  return data;
}

/** Verify Razorpay checkout payment and create final order */
export async function verifyCheckoutPayment(payload) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/orders/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Payment verification failed');
  return data;
}

/** Load Razorpay script once on client */
export async function loadRazorpayScript() {
  if (typeof window === 'undefined') return false;
  if (window.Razorpay) return true;
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const SUBSCRIPTION_PLAN_AMOUNTS = {
  free: 0,
  basic: 299,
  premium: 599,
  premium_plus: 999,
  training: 999,
};

// ——— Server cart ———
export async function fetchServerCart() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/cart`, { headers: authHeaders() });
  if (res.status === 401) return { items: [] };
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to load cart');
  return data.cart || { items: [] };
}

export async function addToServerCart(productId, quantity = 1) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ productId, quantity }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to add to cart');
  return data.cart;
}

export async function updateServerCartItem(productId, quantity) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/cart/items/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ quantity }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to update cart');
  return data.cart;
}

export async function removeFromServerCart(productId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/cart/items/${productId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to remove item');
  return data.cart;
}

export async function clearServerCart() {
  const base = getBaseUrl();
  await fetch(`${base}/cart`, { method: 'DELETE', headers: authHeaders() });
}

// ——— Coupons ———
export async function validateCoupon(code, subtotal) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ code: String(code || '').trim(), subtotal }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Invalid coupon');
  return data.coupon;
}

// ——— Wallet ———
export async function fetchWallet() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/wallet`, { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new Error('Please log in');
  if (!res.ok) throw new Error(data.message || 'Failed to load wallet');
  return { balance: data.balance ?? 0, transactions: data.transactions || [] };
}

export async function fetchWalletBalance() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/wallet/balance`, { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) return 0;
  if (!res.ok) return 0;
  return data.balance ?? 0;
}

export async function createWalletPaymentOrder(amount) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/wallet/create-payment-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ amount, currency: 'INR' }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to start wallet recharge');
  return data;
}

export async function verifyWalletPayment(payload) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/wallet/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Wallet recharge verification failed');
  return data;
}

export async function withdrawFromWallet(amount, note) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/wallet/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ amount, note }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Withdraw failed');
  return data;
}

// ——— Wishlist ———
export async function fetchWishlist() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/wishlist`, { headers: authHeaders() });
  if (res.status === 401) return [];
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to load wishlist');
  return data.wishlist || [];
}

export async function checkWishlist(productId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/wishlist/check/${productId}`, { headers: authHeaders() });
  if (res.status === 401) return false;
  const data = await res.json().catch(() => ({}));
  return Boolean(data.inWishlist);
}

export async function addToWishlist(productId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/wishlist/${productId}`, {
    method: 'POST',
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to add to wishlist');
  return data;
}

export async function removeFromWishlist(productId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/wishlist/${productId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to remove from wishlist');
  return data;
}

// ——— Social feed ———
export async function fetchSocialPosts() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/social`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to load posts');
  return data.posts || [];
}

export async function createSocialPost(body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/social`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to create post');
  return data.post;
}

export async function toggleSocialLike(postId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/social/${postId}/like`, {
    method: 'PUT',
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to update like');
  return data.post;
}

export async function fetchSocialComments(postId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/social/${postId}/comments`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to load comments');
  return data.comments || [];
}

export async function addSocialComment(postId, text) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/social/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ text }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to add comment');
  return data;
}

// ——— Subscription (profile plans) ———
export async function updateSubscription(body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/subscription`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to update subscription');
  return data;
}

export async function purchaseSubscriptionPlan({ plan, amount }) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/subscription/create-payment-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ plan, amount, currency: 'INR' }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to initiate payment');
  return data;
}

export async function paySubscriptionWithWallet(plan, amount) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/subscription/pay-with-wallet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ plan, amount }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Wallet payment failed');
  return data;
}

/** Create new address (protected) */
export async function createAddress(addressData) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/addresses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(addressData),
  });
  if (res.status === 401) return null;
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to create address');
  }
  const data = await res.json();
  return data.address;
}

/** Update address (protected) */
export async function updateAddress(addressId, addressData) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/addresses/${addressId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(addressData),
  });
  if (res.status === 401) return null;
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to update address');
  }
  const data = await res.json();
  return data.address;
}

/** Delete address (protected) */
export async function deleteAddress(addressId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/addresses/${addressId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (res.status === 401) return false;
  if (!res.ok) throw new Error('Failed to delete address');
  return true;
}

/** Fetch user notifications (protected) */
export async function fetchNotifications() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/notifications`, { headers: authHeaders() });
  if (res.status === 401) return [];
  if (!res.ok) throw new Error('Failed to fetch notifications');
  const data = await res.json();
  return data.notifications || [];
}

/** Mark notification as read (protected) */
export async function markNotificationRead(notificationId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: authHeaders(),
  });
  if (res.status === 401) return false;
  if (!res.ok) throw new Error('Failed to mark notification as read');
  return true;
}

/** Submit feedback (public or protected) */
export async function submitFeedback(feedbackData) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(feedbackData),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to submit feedback');
  }
  return res.json();
}

/** Submit contact form (public) - uses feedback endpoint */
export async function submitContact(contactData) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'contact',
      name: contactData.fullName,
      email: contactData.email,
      phone: contactData.mobileNumber,
      userType: contactData.userType,
      message: contactData.message,
      subject: `Contact from ${contactData.userType}`,
    }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to submit contact form');
  }
  return res.json();
}

/** Submit support/chat request (protected) */
export async function submitSupportRequest(supportData) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/support`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(supportData),
  });
  if (res.status === 401) throw new Error('Please login to submit support request');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to submit support request');
  }
  return res.json();
}

/** Submit cremation request (login optional on backend) */
export async function submitCremationRequest(cremationData) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/cremation/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(cremationData),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to submit cremation request');
  }
  return res.json();
}

/** My cremation requests (auth required) */
export async function fetchMyCremationRequests() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/cremation/requests/me`, { headers: authHeaders() });
  if (res.status === 401) throw new Error('Please login to view cremation requests');
  if (!res.ok) throw new Error('Failed to load cremation requests');
  const data = await res.json();
  return data.requests || [];
}

// ========== PETS ==========
export async function fetchMyPets() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/pets`, { headers: authHeaders() });
  if (res.status === 401) throw new Error('Please login');
  if (!res.ok) throw new Error('Failed to load pets');
  const data = await res.json();
  return data.pets || [];
}

export async function createPet(body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/pets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new Error('Please login');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to add pet');
  return data.pet;
}

export async function updatePet(id, body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/pets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new Error('Please login');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to update pet');
  return data.pet;
}

export async function deletePet(id) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/pets/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (res.status === 401) throw new Error('Please login');
  if (!res.ok) throw new Error('Failed to delete pet');
  return res.json();
}

// ========== REMINDERS ==========
export async function fetchReminders(params = {}) {
  const base = getBaseUrl();
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${base}/reminders${q ? `?${q}` : ''}`, { headers: authHeaders() });
  if (res.status === 401) throw new Error('Please login');
  if (!res.ok) throw new Error('Failed to load reminders');
  const data = await res.json();
  return data.reminders || [];
}

export async function createReminder(body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/reminders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new Error('Please login');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to create reminder');
  return data.reminder;
}

export async function updateReminder(id, body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/reminders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new Error('Please login');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to update reminder');
  return data.reminder;
}

export async function deleteReminder(id) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/reminders/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (res.status === 401) throw new Error('Please login');
  if (!res.ok) throw new Error('Failed to delete reminder');
  return res.json();
}

// ========== BOOKINGS ==========
export async function fetchMyBookings() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/bookings/my-bookings`, { headers: authHeaders() });
  if (res.status === 401) throw new Error('Please login');
  if (!res.ok) throw new Error('Failed to load bookings');
  const data = await res.json();
  return data.bookings || [];
}

export async function createBooking(body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new Error('Please login');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to create booking');
  return data.booking;
}

// ========== HEALTHCARE ==========
export async function fetchMedicalHistory(petId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/healthcare/pet/${petId}/history`, { headers: authHeaders() });
  if (res.status === 401) throw new Error('Please login');
  if (!res.ok) throw new Error('Failed to load medical history');
  const data = await res.json();
  return data.medicalHistory || [];
}

export async function addMedicalRecord(petId, body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/healthcare/pet/${petId}/record`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new Error('Please login');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to add record');
  return data;
}

// ========== EMERGENCY ==========
export async function submitEmergency(body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/emergency`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new Error('Please login to report emergency');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to submit emergency');
  return data;
}

// ========== SETTINGS ==========
export async function fetchSettings() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/settings`, { headers: authHeaders() });
  if (res.status === 401) throw new Error('Please login');
  if (!res.ok) throw new Error('Failed to load settings');
  const data = await res.json();
  return data.settings || data;
}

export async function updateSettings(body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new Error('Please login');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to update settings');
  return data.settings || data;
}

// ========== HOPE CHATS ==========
export async function fetchHopeChats() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/hope/chats`, { headers: authHeaders() });
  if (res.status === 401) throw new Error('Please login');
  if (!res.ok) throw new Error('Failed to load chats');
  const data = await res.json();
  return data.chats || [];
}

export async function startHopeChat(postId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/hope/chats/${postId}/start`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (res.status === 401) throw new Error('Please login to chat');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to start chat');
  return data.chat;
}

export async function fetchHopeChat(chatId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/hope/chats/${chatId}`, { headers: authHeaders() });
  if (res.status === 401) throw new Error('Please login');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to load chat');
  return data.chat;
}

export async function sendHopeChatMessage(chatId, content) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/hope/chats/${chatId}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ content }),
  });
  if (res.status === 401) throw new Error('Please login');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to send message');
  return data.chat;
}

/** Submit return order request (protected) */
export async function submitReturnRequest(orderId, returnData) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/orders/${orderId}/return`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(returnData),
  });
  if (res.status === 401) throw new Error('Please login to submit return request');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to submit return request');
  }
  return res.json();
}

/** Delete user account (protected) */
export async function deleteAccount() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/users/account`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (res.status === 401) throw new Error('Please login to delete account');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to delete account. Please contact support.');
  }
  return res.json();
}

// ========== ADMIN APIs (same as app – token required) ==========
const getAuthHeaders = () => {
  const token = getToken();
  if (!token) throw new Error('Admin login required');
  return { Authorization: `Bearer ${token}` };
};

const adminFetch = async (path, options = {}) => {
  const base = getBaseUrl();
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new Error('Session expired. Please login again.');
  if (res.status === 403) throw new Error('Admin access required.');
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

/** Upload image (same as app) – POST /upload/image with FormData, returns { url } */
export async function adminUploadImage(file, folder = 'furmaa/products') {
  const base = getBaseUrl();
  const token = getToken();
  if (!token) throw new Error('Admin login required');
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);
  const res = await fetch(`${base}/upload/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  const url = data.image?.url || data.url;
  if (!url) throw new Error('No image URL in response');
  return { url, public_id: data.image?.public_id };
}

export async function adminGetDashboard() {
  return adminFetch('/admin/dashboard');
}

export async function adminGetProducts() {
  const d = await adminFetch('/admin/products');
  return d.products || [];
}

export async function adminGetProductById(id) {
  const d = await adminFetch(`/admin/products/${id}`);
  return d.product;
}

export async function adminCreateProduct(body) {
  const res = await adminFetch('/admin/products', { method: 'POST', body: JSON.stringify(body) });
  clearApiCache('products:');
  return res;
}

export async function adminUpdateProduct(id, body) {
  const res = await adminFetch(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  clearApiCache('products:');
  return res;
}

export async function adminDeleteProduct(id) {
  const res = await adminFetch(`/admin/products/${id}`, { method: 'DELETE' });
  clearApiCache('products:');
  return res;
}

export async function adminGetOrders(params = {}) {
  const q = new URLSearchParams(params).toString();
  const d = await adminFetch(`/admin/orders${q ? `?${q}` : ''}`);
  return d.orders || [];
}

export async function adminGetOrderById(id) {
  const d = await adminFetch(`/admin/orders/${id}`);
  return d.order;
}

export async function adminUpdateOrderStatus(id, body) {
  return adminFetch(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(body) });
}

export async function adminUpdateOrderShipping(id, body) {
  return adminFetch(`/admin/orders/${id}/shipping`, { method: 'PUT', body: JSON.stringify(body) });
}

export async function adminSyncOrderZohoShipping(id) {
  return adminFetch(`/admin/orders/${id}/zoho-sync`, { method: 'POST' });
}

export async function adminGetVeterinarians() {
  const d = await adminFetch('/admin/veterinarians');
  return d.veterinarians || [];
}

export async function adminCreateVeterinarian(body) {
  return adminFetch('/admin/veterinarians', { method: 'POST', body: JSON.stringify(body) });
}

export async function adminUpdateVeterinarian(id, body) {
  return adminFetch(`/admin/veterinarians/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}

export async function adminDeleteVeterinarian(id) {
  return adminFetch(`/admin/veterinarians/${id}`, { method: 'DELETE' });
}

export async function adminGetVetServiceTypes() {
  const d = await adminFetch('/admin/vet-service-types');
  return d.types || [];
}

export async function adminCreateVetServiceType(body) {
  return adminFetch('/admin/vet-service-types', { method: 'POST', body: JSON.stringify(body) });
}

export async function adminUpdateVetServiceType(id, body) {
  return adminFetch(`/admin/vet-service-types/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}

export async function adminDeleteVetServiceType(id) {
  return adminFetch(`/admin/vet-service-types/${id}`, { method: 'DELETE' });
}

export async function adminGetPosts() {
  const d = await adminFetch('/admin/posts');
  return d.posts || [];
}

export async function adminCreatePost(body) {
  return adminFetch('/admin/posts', { method: 'POST', body: JSON.stringify(body) });
}

export async function adminUpdatePost(id, body) {
  return adminFetch(`/admin/posts/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}

export async function adminDeletePost(id) {
  return adminFetch(`/admin/posts/${id}`, { method: 'DELETE' });
}

export async function adminGetFaqs() {
  const d = await adminFetch('/admin/faq');
  return d.faqs || [];
}

export async function adminCreateFaq(body) {
  return adminFetch('/admin/faq', { method: 'POST', body: JSON.stringify(body) });
}

export async function adminUpdateFaq(id, body) {
  return adminFetch(`/admin/faq/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}

export async function adminDeleteFaq(id) {
  return adminFetch(`/admin/faq/${id}`, { method: 'DELETE' });
}

export async function adminGetFeedback(params = {}) {
  const q = new URLSearchParams(params).toString();
  const d = await adminFetch(`/admin/feedback${q ? `?${q}` : ''}`);
  return d.feedbacks || d.feedback || [];
}

export async function adminRespondFeedback(id, response) {
  return adminFetch(`/admin/feedback/${id}/respond`, { method: 'PUT', body: JSON.stringify({ adminResponse: response }) });
}

export async function adminCreateFeedback(body) {
  const d = await adminFetch('/admin/feedback', { method: 'POST', body: JSON.stringify(body) });
  clearApiCache('feedback:');
  return d.feedback;
}

export async function adminDeleteFeedback(id) {
  const res = await adminFetch(`/admin/feedback/${id}`, { method: 'DELETE' });
  clearApiCache('feedback:');
  return res;
}

export async function adminSetFeedbackFeatured(id, featured) {
  const d = await adminFetch(`/admin/feedback/${id}/featured`, {
    method: 'PATCH',
    body: JSON.stringify({ featured }),
  });
  clearApiCache('feedback:');
  return d.feedback;
}

/** Homepage testimonials (public) */
export async function fetchFeaturedFeedback(limit = 8) {
  const base = getBaseUrl();
  return withCache(`feedback:featured:${limit}`, 120_000, async () => {
    const res = await fetch(`${base}/feedback/featured?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to load feedback');
    const data = await res.json();
    return data.feedbacks || [];
  });
}

/** Why Pet Parents Choose Furrmaa – homepage features (public) */
export async function fetchWhyChooseFeatures() {
  const base = getBaseUrl();
  const cacheKey = 'why-choose:homepage';
  const cached = getCached(cacheKey);
  if (cached != null && Array.isArray(cached.features) && cached.features.length > 0) {
    return cached;
  }
  const res = await fetchWithTimeout(`${base}/why-choose`, { cache: 'no-store' }, 12_000);
  if (!res.ok) throw new Error('Failed to load why-choose section');
  const data = await res.json();
  const result = {
    tagline: data.tagline || '',
    features: data.features || [],
  };
  if (result.features.length > 0) {
    setCached(cacheKey, result, 120_000);
  } else {
    clearApiCache('why-choose:');
  }
  return result;
}

export async function adminGetWhyChoose() {
  return adminFetch('/admin/why-choose');
}

export async function adminSaveWhyChooseTagline(tagline) {
  const d = await adminFetch('/admin/why-choose/settings', {
    method: 'PUT',
    body: JSON.stringify({ tagline }),
  });
  clearApiCache('why-choose:');
  return d.settings;
}

export async function adminCreateWhyChooseFeature(body) {
  const d = await adminFetch('/admin/why-choose', { method: 'POST', body: JSON.stringify(body) });
  clearApiCache('why-choose:');
  return d.feature;
}

export async function adminUpdateWhyChooseFeature(id, body) {
  const d = await adminFetch(`/admin/why-choose/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
  clearApiCache('why-choose:');
  return d.feature;
}

export async function adminDeleteWhyChooseFeature(id) {
  const res = await adminFetch(`/admin/why-choose/${id}`, { method: 'DELETE' });
  clearApiCache('why-choose:');
  return res;
}

export async function adminGetSupport() {
  const d = await adminFetch('/admin/support');
  return d.chats || [];
}

export async function adminGetSupportById(id) {
  const d = await adminFetch(`/admin/support/${id}`);
  return d.chat;
}

export async function adminSendSupportMessage(id, body) {
  const d = await adminFetch(`/admin/support/${id}/message`, { method: 'POST', body: JSON.stringify(body) });
  return d.chat;
}

export async function adminUpdateSupportStatus(id, status) {
  const d = await adminFetch(`/admin/support/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  return d.chat;
}

export async function adminGetUsers(params = {}) {
  const q = new URLSearchParams(params).toString();
  const d = await adminFetch(`/admin/users${q ? `?${q}` : ''}`);
  return d.users || [];
}

export async function adminUpdateUser(id, body) {
  const d = await adminFetch(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  return d.user;
}

export async function adminDeactivateUser(id) {
  return adminFetch(`/admin/users/${id}`, { method: 'DELETE' });
}

export async function adminGetTrainingVideos() {
  const d = await adminFetch('/admin/training-videos');
  return d.videos || [];
}

export async function adminCreateTrainingVideo(body) {
  return adminFetch('/admin/training-videos', { method: 'POST', body: JSON.stringify(body) });
}

export async function adminUpdateTrainingVideo(id, body) {
  return adminFetch(`/admin/training-videos/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}

export async function adminDeleteTrainingVideo(id) {
  return adminFetch(`/admin/training-videos/${id}`, { method: 'DELETE' });
}

export async function adminGetPetEvents(params = {}) {
  const q = new URLSearchParams(params).toString();
  const d = await adminFetch(`/admin/pet-events${q ? `?${q}` : ''}`);
  return d.events || [];
}

export async function adminCreatePetEvent(body) {
  return adminFetch('/admin/pet-events', { method: 'POST', body: JSON.stringify(body) });
}

export async function adminUpdatePetEvent(id, body) {
  return adminFetch(`/admin/pet-events/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}

export async function adminDeletePetEvent(id) {
  return adminFetch(`/admin/pet-events/${id}`, { method: 'DELETE' });
}

export async function adminGetHopePosts(params = {}) {
  const q = new URLSearchParams(params).toString();
  const d = await adminFetch(`/admin/hope-posts${q ? `?${q}` : ''}`);
  return d.posts || [];
}

export async function adminUpdateHopePostStatus(id, status) {
  return adminFetch(`/admin/hope-posts/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
}

export async function adminDeleteHopePost(id) {
  return adminFetch(`/admin/hope-posts/${id}`, { method: 'DELETE' });
}

export async function adminGetCategories() {
  const d = await adminFetch('/admin/categories');
  return d.categories || [];
}

export async function adminGetSizes() {
  const d = await adminFetch('/admin/sizes');
  return d.sizes || [];
}

export async function adminGetDietary() {
  const d = await adminFetch('/admin/dietary');
  return d.dietary || [];
}

export async function adminCreateCategory(body) {
  const res = await adminFetch('/admin/categories', { method: 'POST', body: JSON.stringify(body) });
  clearApiCache('categories:');
  return res;
}

/** Update category (e.g. image) – PATCH /admin/categories/:id */
export async function adminUpdateCategory(id, body) {
  const d = await adminFetch(`/admin/categories/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
  clearApiCache('categories:');
  return d.category;
}

export async function adminDeleteCategory(id) {
  const res = await adminFetch(`/admin/categories/${id}`, { method: 'DELETE' });
  clearApiCache('categories:');
  return res;
}

export async function adminCreateSize(body) {
  return adminFetch('/admin/sizes', { method: 'POST', body: JSON.stringify(body) });
}

export async function adminCreateDietary(body) {
  return adminFetch('/admin/dietary', { method: 'POST', body: JSON.stringify(body) });
}

// --- Cremation Centers ---
export async function adminGetCremationCenters(params = {}) {
  const q = new URLSearchParams(params).toString();
  const d = await adminFetch(`/admin/cremation-centers${q ? `?${q}` : ''}`);
  return d.centers || [];
}

export async function adminCreateCremationCenter(body) {
  const d = await adminFetch('/admin/cremation-centers', { method: 'POST', body: JSON.stringify(body) });
  return d.center;
}

export async function adminUpdateCremationCenter(id, body) {
  const d = await adminFetch(`/admin/cremation-centers/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  return d.center;
}

export async function adminDeleteCremationCenter(id) {
  return adminFetch(`/admin/cremation-centers/${id}`, { method: 'DELETE' });
}

// --- Cremation Requests ---
export async function adminGetCremationRequests(params = {}) {
  const q = new URLSearchParams(params).toString();
  const d = await adminFetch(`/admin/cremation-requests${q ? `?${q}` : ''}`);
  return d.requests || [];
}

export async function adminUpdateCremationRequestStatus(id, status) {
  const d = await adminFetch(`/admin/cremation-requests/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  return d.request;
}

// --- Explore Content ---
export async function adminGetExploreContent(params = {}) {
  const q = new URLSearchParams(params).toString();
  const d = await adminFetch(`/admin/explore-content${q ? `?${q}` : ''}`);
  return d.content || [];
}

export async function adminCreateExploreContent(body) {
  const d = await adminFetch('/admin/explore-content', { method: 'POST', body: JSON.stringify(body) });
  return d.content;
}

export async function adminUpdateExploreContent(id, body) {
  const d = await adminFetch(`/admin/explore-content/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  return d.content;
}

export async function adminDeleteExploreContent(id) {
  return adminFetch(`/admin/explore-content/${id}`, { method: 'DELETE' });
}

// --- Service Providers ---
export async function adminGetServiceProviders() {
  const d = await adminFetch('/admin/service-providers');
  return d.providers || [];
}

export async function adminUpdateServiceProvider(id, body) {
  const d = await adminFetch(`/admin/service-providers/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  return d.provider;
}

// --- Bookings ---
export async function adminGetBookings(params = {}) {
  const q = new URLSearchParams(params).toString();
  const d = await adminFetch(`/admin/bookings${q ? `?${q}` : ''}`);
  return d.bookings || [];
}

export async function adminUpdateBookingStatus(id, body) {
  const d = await adminFetch(`/admin/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify(body) });
  return d.booking;
}

// --- Coupons ---
export async function adminGetCoupons() {
  const d = await adminFetch('/admin/coupons');
  return d.coupons || [];
}

export async function adminCreateCoupon(body) {
  const d = await adminFetch('/admin/coupons', { method: 'POST', body: JSON.stringify(body) });
  return d.coupon;
}

export async function adminUpdateCoupon(id, body) {
  const d = await adminFetch(`/admin/coupons/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  return d.coupon;
}

export async function adminDeleteCoupon(id) {
  return adminFetch(`/admin/coupons/${id}`, { method: 'DELETE' });
}

// --- Pet AI Chat (OpenAI via backend /api/ai-chat) ---

async function aiChatFetch(path, options = {}) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/ai-chat${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new Error('Please login to use Pet AI Chat.');
  if (!res.ok) throw new Error(data.message || 'AI chat request failed');
  return data;
}

export async function aiCreateSession(title, petContext) {
  return aiChatFetch('/sessions', {
    method: 'POST',
    body: JSON.stringify({ title, petContext }),
  });
}

export async function aiListSessions() {
  const data = await aiChatFetch('/sessions');
  return data.chats || [];
}

export async function aiGetSession(sessionId) {
  return aiChatFetch(`/sessions/${encodeURIComponent(sessionId)}`);
}

export async function aiSendMessage(sessionId, message, petContext) {
  return aiChatFetch(`/sessions/${encodeURIComponent(sessionId)}/message`, {
    method: 'POST',
    body: JSON.stringify({ message, petContext }),
  });
}

export async function aiDeleteSession(sessionId) {
  return aiChatFetch(`/sessions/${encodeURIComponent(sessionId)}`, { method: 'DELETE' });
}