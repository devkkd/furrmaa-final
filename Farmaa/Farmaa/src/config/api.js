import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * ================================
 * BASE URL CONFIGURATION (sirf app – backend change nahi)
 * - PC ka IPv4: cmd me `ipconfig` → jab WiFi/network badle yahan update karo
 * - Android Emulator: host machine = 10.0.2.2 (auto-detect)
 * - Asli phone same WiFi: niche wala LOCAL_HOST_IP
 * ================================
 */
const LOCAL_HOST_IP = '192.168.31.190';
const BACKEND_PORT = 5000;
/** AVD / emulator detect fail ho to manually true karo (sirf emulator pe) */
const FORCE_ANDROID_EMULATOR_HOST = false;
/**
 * USB pe phone: WiFi IP ki zaroorat nahi — PC pe `adb reverse tcp:5000 tcp:5000` chalao, phir true karo.
 */
const USE_ANDROID_ADB_REVERSE_LOCALHOST = false;

function isLikelyAndroidEmulator() {
  if (Platform.OS !== 'android') return false;
  const c = Platform.constants || {};
  const fp = String(c.Fingerprint || '').toLowerCase();
  const model = String(c.Model || '').toLowerCase();
  const brand = String(c.Brand || '').toLowerCase();
  return (
    FORCE_ANDROID_EMULATOR_HOST ||
    fp.includes('generic') ||
    fp.includes('unknown') ||
    fp.includes('test-keys') ||
    fp.includes('ranchu') ||
    fp.includes('emulator') ||
    model.includes('emulator') ||
    (model.includes('sdk') && model.includes('gphone')) ||
    (brand === 'google' && model.includes('sdk'))
  );
}

const getBaseURL = () => {
  if (__DEV__) {
    const EMULATOR_IOS = `http://localhost:${BACKEND_PORT}/api`;
    if (Platform.OS === 'android') {
      if (USE_ANDROID_ADB_REVERSE_LOCALHOST) {
        return `http://127.0.0.1:${BACKEND_PORT}/api`;
      }
      const host = isLikelyAndroidEmulator() ? '10.0.2.2' : LOCAL_HOST_IP;
      return `http://${host}:${BACKEND_PORT}/api`;
    }
    if (Platform.OS === 'ios') return EMULATOR_IOS;
    return `http://${LOCAL_HOST_IP}:${BACKEND_PORT}/api`;
  }
  return 'https://furmma-backend-new.onrender.com/api';
};

const API_BASE_URL = getBaseURL();
if (__DEV__) {
  console.log('[api] BASE_URL →', API_BASE_URL);
}

/**
 * ================================
 * AXIOS INSTANCE
 * ================================
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * ================================
 * REQUEST INTERCEPTOR
 * 🔐 JWT ONLY FOR ADMIN ROUTES
 * ================================
 */
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    const method = (config.method || 'get').toLowerCase();
    const url = config.url || '';

    // Public auth – body login / OTP (Auth0 token mat bhejo)
    const skipBearer =
      method === 'post' &&
      (url.startsWith('/auth/send-otp') ||
        url.startsWith('/auth/verify-otp') ||
        url.startsWith('/auth/login') ||
        url.startsWith('/auth/register'));

    if (token && !skipBearer) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


/**
 * ================================
 * RESPONSE INTERCEPTOR
 * ================================
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const msg = data?.message || data?.error;

      // 400 validation (e.g. email already exists) – expected, log as warn
      if (status === 400 && msg) {
        console.warn('API (validation):', msg);
      } else {
        console.error('API ERROR:', status, data);
      }

      // 🔐 Agar admin token invalid / expired
      if (status === 401) {
        await AsyncStorage.multiRemove([
          'token',
          'user',
          'login_method',
          'firebase_otp_confirmation',
          'firebase_email_otp',
        ]);
      }
    } else if (error.request) {
      console.error('NETWORK ERROR:', error.request);
    } else {
      console.error('ERROR:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * ================================
 * EXPORT
 * ================================
 */
export default {
  BASE_URL: API_BASE_URL,
  CLIENT: apiClient,

  ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      SEND_OTP: '/auth/send-otp',
      VERIFY_OTP: '/auth/verify-otp',
      ME: '/auth/me',
    },

    // ===== USER / PUBLIC ROUTES (NO TOKEN) =====
    PRODUCTS: '/products',
    CART: '/cart',
    COUPONS: '/coupons',
    ORDERS: '/orders',
    ORDERS_CREATE_PAYMENT: '/orders/create-payment-order',
    ORDERS_VERIFY_PAYMENT: '/orders/verify-payment',
    MY_ORDERS: '/orders/my-orders',
    ADDRESSES: '/addresses',
    BOOKINGS: '/bookings',
    MY_BOOKINGS: '/bookings/my-bookings',

    ADOPTION: '/adoption',
    ADOPTION_PETS: '/adoption/pets',

    EMERGENCY: '/emergency',
    ACTIVE_EMERGENCIES: '/emergency/active',

    SOCIAL: '/social',
    SOCIAL_COMMENTS: '/social/:id/comments',
    SOCIAL_LIKE: '/social/:id/like',

    HEALTHCARE: '/healthcare',
    TRAINING: '/training',
    TRAINING_MY: '/training/my-trainings',
    ADOPTION_PET: '/adoption/pets',
    TRAINING_VIDEOS: '/training-videos',
    TRAINING_PROGRESS: '/training-progress',

    USERS: '/users',
    USER_PROFILE: '/users/profile',
    USER_PETS: '/pets',

    REMINDERS: '/reminders',
    SERVICE_PROVIDERS: '/service-providers',
    VETERINARIANS: '/veterinarians',
    VET_SERVICE_TYPES: '/vet-service-types',

    EXPLORE: '/explore',
    HOPE: '/hope',
    HOPE_CHATS: '/hope/chats',
    PET_EVENTS: '/pet-events',
    CREMATION: '/cremation',
    CREMATION_CENTERS: '/cremation/centers',

    // ===== ADMIN ROUTES (TOKEN REQUIRED) =====
    ADMIN: {
      DASHBOARD: '/admin/dashboard',

      PRODUCTS: '/admin/products',
      PRODUCTS_BULK_UPLOAD: '/admin/products/bulk-upload',
      PRODUCTS_TEMPLATE: '/admin/products/template',

      ORDERS: '/admin/orders',
      ORDER_STATS: '/admin/orders/stats',
      ORDER_STATUS: '/admin/orders/:id/status',

      USERS: '/admin/users',
      ADDRESSES: '/admin/addresses',

      FAQ: '/admin/faq',
      FEEDBACK: '/admin/feedback',
      FEEDBACK_RESPOND: '/admin/feedback/:id/respond',

      SUPPORT: '/admin/support',
      SUPPORT_MESSAGE: '/admin/support/:id/message',
      SUPPORT_STATUS: '/admin/support/:id/status',

      NOTIFICATIONS: '/admin/notifications',
      NOTIFICATIONS_SEND: '/admin/notifications/send',
      NOTIFICATIONS_BROADCAST: '/admin/notifications/broadcast',

      TRAINING_VIDEOS: '/admin/training-videos',
      EXPLORE_CONTENT: '/admin/explore-content',
      POSTS: '/admin/posts',

      VETERINARIANS: '/admin/veterinarians',
      VET_SERVICE_TYPES: '/admin/vet-service-types',
      PETS: '/admin/pets',

      ADOPTIONS: '/admin/adoptions',
      ADOPTION_STATUS: '/admin/adoptions/:id/status',

      SERVICE_PROVIDERS: '/admin/service-providers',
      PET_EVENTS: '/admin/pet-events',

      CREMATION_CENTERS: '/admin/cremation-centers',
      CREMATION_REQUESTS: '/admin/cremation-requests',
      CREMATION_REQUEST_STATUS:
        '/admin/cremation-requests/:id/status',

      HOPE_POSTS: '/admin/hope-posts',
      HOPE_POST_STATUS: '/admin/hope-posts/:id/status',

      BOOKINGS: '/admin/bookings',
      BOOKING_STATUS: '/admin/bookings/:id/status',

      EMERGENCIES: '/admin/emergencies',
      EMERGENCY_STATUS: '/admin/emergencies/:id/status',

      TRAININGS: '/admin/trainings',
      TRAINING_STATUS: '/admin/trainings/:id/status',

      AI_CHATS: '/admin/ai-chats',
      AI_CHATS_STATS: '/admin/ai-chats/stats',

      WALLETS: '/admin/wallets',
      WALLETS_STATS: '/admin/wallets/stats',
      WALLETS_USER: '/admin/wallets/user',

      CATEGORIES: '/admin/categories',
      SIZES: '/admin/sizes',
      DIETARY: '/admin/dietary',
    },

    // ===== OTHER ROUTES =====
    NOTIFICATIONS: '/notifications',
    NOTIFICATIONS_UNREAD_COUNT: '/notifications/unread-count',

    SETTINGS: '/settings',
    FEEDBACK: '/feedback',
    MY_FEEDBACK: '/feedback/my-feedback',

    FAQ: '/faq',
    FAQ_CATEGORY: '/faq/category',

    CATEGORIES: '/categories',
    SIZES: '/sizes',
    DIETARY: '/dietary',

    SUPPORT: '/support',
    SUBSCRIPTION: '/subscription',
    SUBSCRIPTION_PAY_WALLET: '/subscription/pay-with-wallet',

    WISHLIST: '/wishlist',
    WISHLIST_CHECK: '/wishlist/check',

    WALLET: '/wallet',
    WALLET_WITHDRAW: '/wallet/withdraw',
    WALLET_BALANCE: '/wallet/balance',
    WALLET_RECHARGE: '/wallet/recharge',
    WALLET_CREATE_PAYMENT: '/wallet/create-payment-order',
    WALLET_VERIFY_PAYMENT: '/wallet/verify-payment',

    UPLOAD: {
      IMAGE: '/upload/image',
      IMAGES: '/upload/images',
      VIDEO: '/upload/video',
    },

    AI_CHAT: {
      SESSIONS: '/ai-chat/sessions',
      SESSION: '/ai-chat/sessions/:sessionId',
      MESSAGE: '/ai-chat/sessions/:sessionId/message',
      TITLE: '/ai-chat/sessions/:sessionId/title',
    },
  },
};
