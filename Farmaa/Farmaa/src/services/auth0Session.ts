import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import type { Credentials } from 'react-native-auth0';
import api from '../config/api';

export const LOGIN_METHOD_KEY = 'login_method';
export const ONBOARDING_COMPLETE_KEY = 'onboarding_completed';

const AUTH_STORAGE_KEYS = [
  'token',
  'user',
  LOGIN_METHOD_KEY,
  'firebase_otp_confirmation',
  'firebase_email_otp',
] as const;

/** App JWT / user — Auth0 browser logout ke bina */
export async function clearAuthStorage(): Promise<void> {
  await AsyncStorage.multiRemove([...AUTH_STORAGE_KEYS]);
}

type IdClaims = { email?: string; name?: string; picture?: string };

/**
 * Auth0 credentials ko backend JWT user flow jaisa store karta hai (web / Auth0ProviderWrapper jaisa).
 */
export async function applyAuth0Credentials(credentials: Credentials) {
  const accessToken = credentials.accessToken;
  await AsyncStorage.setItem('token', accessToken);
  await AsyncStorage.setItem(LOGIN_METHOD_KEY, 'auth0');
  api.CLIENT.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

  let email: string | undefined;
  let name: string | undefined;
  let picture: string | undefined;
  try {
    const payload = jwtDecode<IdClaims>(credentials.idToken);
    email = payload.email;
    name = payload.name;
    picture = payload.picture;
  } catch {
    // idToken optional edge cases
  }

  if (name || email || picture) {
    try {
      await api.CLIENT.patch('/auth/me', {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(picture ? { profileImage: picture } : {}),
      });
    } catch {
      // GET /auth/me se profile aa sakta hai
    }
  }

  const me = await api.CLIENT.get(api.ENDPOINTS.AUTH.ME);
  const u = me.data?.user;
  if (!u) {
    throw new Error('Could not load profile after Auth0 login');
  }

  const userObj = {
    id: String(u._id ?? u.id ?? ''),
    _id: u._id ?? u.id,
    name: u.name ?? name ?? 'User',
    email: u.email ?? email ?? '',
    phone: u.phone ?? null,
    role: u.role ?? 'user',
  };

  await AsyncStorage.setItem('user', JSON.stringify(userObj));
  return { user: userObj, accessToken };
}
