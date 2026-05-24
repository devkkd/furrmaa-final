import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';
import { Platform } from 'react-native';
import api from '../config/api';
import { GOOGLE_WEB_CLIENT_ID } from '../config/googleSignIn';
import { AUTH0_AUDIENCE, isAuth0Configured } from '../config/auth0';
import { getAuth0Client } from '../config/auth0Client';
import {
  applyAuth0Credentials,
  clearAuthStorage,
  LOGIN_METHOD_KEY,
} from '../services/auth0Session';
import { resetToLoginScreen } from '../navigation/navigationRef';

/** Axios 4xx/5xx par bhi `error.request` hota hai — asli "offline" tab jab response na mile */
function isAxiosNetworkOnlyFailure(err: any): boolean {
  if (err?.response) return false;
  const code = err?.code;
  return (
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'ETIMEDOUT' ||
    (typeof err?.message === 'string' && err.message.includes('Network Error')) ||
    (typeof err?.message === 'string' && err.message.toLowerCase().includes('timeout'))
  );
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  profileImage?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithFirebase: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  registerWithFirebase: (name: string, email: string, password: string) => Promise<void>;
  sendOTP: (phone: string) => Promise<string>;
  sendEmailOTP: (email: string) => Promise<string>;
  sendOTPWithFirebase: (phone: string) => Promise<string>;
  sendEmailOTPWithFirebase: (email: string) => Promise<void>;
  verifyOTP: (identifier: string, otp: string, type?: 'phone' | 'email') => Promise<void>;
  verifyOTPWithFirebase: (phone: string, otp: string) => Promise<void>;
  verifyEmailOTPWithFirebase: (email: string, otp: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  /** Web jaisa Auth0 + Apple connection */
  loginWithAuth0Apple: () => Promise<void>;
  /** Web jaisa Auth0 + Google connection */
  loginWithAuth0Google: () => Promise<void>;
  /** useFirebaseAuth=true → Firebase; warna Auth0 (agar configured); warna Firebase */
  loginSocialGoogle: () => Promise<void>;
  loginSocialApple: () => Promise<void>;
  auth0SocialLoginEnabled: boolean;
  /** Backend GET /auth/public-config — phone OTP via Firebase SMS */
  useFirebaseAuth: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [useFirebaseAuth, setUseFirebaseAuth] = useState(false);

  useEffect(() => {
    loadStoredAuth();

    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });

    (async () => {
      try {
        const res = await api.CLIENT.get(api.ENDPOINTS.AUTH.PUBLIC_CONFIG);
        if (res.data?.useFirebaseAuth === true) {
          setUseFirebaseAuth(true);
        }
      } catch (_) {
        // backend offline — Firebase OTP off until config loads
      }
    })();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          console.log('📱 Loaded user from storage:', userData);
          console.log('👤 User role:', userData.role);
          
          setToken(storedToken);
          setUser(userData);
          // Set token in axios instance
          api.CLIENT.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
          
          // Refresh user data from server to get latest role (non-blocking)
          // Don't wait for this - let it happen in background
          api.CLIENT.get(api.ENDPOINTS.AUTH.ME)
            .then((response) => {
              const u = response?.data?.user;
              if (u) {
                const freshUser = {
                  id: u._id ?? u.id ?? '',
                  _id: u._id ?? u.id ?? '',
                  name: u.name ?? userData.name ?? '',
                  email: u.email ?? userData.email ?? '',
                  phone: u.phone ?? userData.phone ?? null,
                  role: u.role ?? userData.role ?? 'user',
                  profileImage: u.profileImage ?? userData.profileImage ?? undefined,
                };
                console.log('🔄 Fresh user data from server:', freshUser);
                setUser(freshUser);
                AsyncStorage.setItem('user', JSON.stringify(freshUser));
              }
            })
            .catch(async (err: any) => {
              if (err?.response?.status === 401) {
                console.log('⚠️ Stored session expired — clearing auth');
                setToken(null);
                setUser(null);
                delete api.CLIENT.defaults.headers.common.Authorization;
                await clearAuthStorage();
                return;
              }
              console.log('⚠️ Could not refresh user data, using stored data', err?.message);
            });
        } catch (parseError) {
          console.error('Error parsing stored user data:', parseError);
          // Clear corrupted data
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      // Always set loading to false, even if there's an error
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', email);
      console.log('🌐 API URL:', api.BASE_URL + api.ENDPOINTS.AUTH.LOGIN);
      
      const response = await api.CLIENT.post(api.ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      console.log('✅ Login response:', response.data);

      const { token: newToken, user: userData } = response.data;
      
      if (!newToken || !userData) {
        console.error('❌ Invalid response structure:', response.data);
        throw new Error('Invalid response from server');
      }
      
      setToken(newToken);
      setUser(userData);
      
      await AsyncStorage.setItem('token', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      // Set token in axios instance for future requests
      api.CLIENT.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      
      console.log('✅ Login successful, token stored');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      console.error('❌ Login error:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        networkError: !error.response && error.message,
      });
      throw new Error(errorMessage);
    }
  };

  // Firebase Email/Password Login - Uses Firebase ID Token
  const loginWithFirebase = async (email: string, password: string) => {
    try {
      console.log('🔥 Firebase: Attempting login for:', email);
      
      // Sign in with Firebase
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;
      
      console.log('✅ Firebase login successful, UID:', firebaseUser.uid);
      
      // Get Firebase ID Token
      const firebaseToken = await firebaseUser.getIdToken();
      
      // Sync with backend using Firebase ID Token
      try {
        const response = await api.CLIENT.post(api.ENDPOINTS.AUTH.LOGIN, {
          firebaseToken: firebaseToken,
        });
        
        const { token: newToken, user: userData } = response.data;
        
        if (newToken && userData) {
          const userWithFirebase = {
            ...userData,
            firebaseUid: firebaseUser.uid,
          };
          
          setToken(newToken);
          setUser(userWithFirebase);
          
          await AsyncStorage.setItem('token', newToken);
          await AsyncStorage.setItem('user', JSON.stringify(userWithFirebase));
          
          api.CLIENT.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          
          console.log('✅ Firebase login successful, synced with backend');
        }
      } catch (backendError: any) {
        // If backend login fails, try to create user or use Firebase auth only
        console.warn('⚠️ Backend sync failed, using Firebase auth only:', backendError.message);
        
        const firebaseUserData = {
          id: firebaseUser.uid,
          _id: firebaseUser.uid,
          name: firebaseUser.displayName || email.split('@')[0],
          email: firebaseUser.email || email,
          role: 'user',
          firebaseUid: firebaseUser.uid,
        };
        
        setUser(firebaseUserData);
        await AsyncStorage.setItem('user', JSON.stringify(firebaseUserData));
      }
    } catch (error: any) {
      console.error('❌ Firebase Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      console.log('📝 Attempting registration for:', email);
      console.log('🌐 API URL:', api.BASE_URL + api.ENDPOINTS.AUTH.REGISTER);
      
      const response = await api.CLIENT.post(api.ENDPOINTS.AUTH.REGISTER, {
        name,
        email,
        password,
        phone,
      });

      console.log('✅ Registration response:', response.data);

      const { token: newToken, user: userData } = response.data;
      
      if (!newToken || !userData) {
        console.error('❌ Invalid response structure:', response.data);
        throw new Error('Invalid response from server');
      }
      
      setToken(newToken);
      setUser(userData);
      
      await AsyncStorage.setItem('token', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      // Set token in axios instance for future requests
      api.CLIENT.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      
      console.log('✅ Registration successful, token stored');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      console.error('❌ Registration error:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        networkError: !error.response && error.message,
      });
      throw new Error(errorMessage);
    }
  };

  // Firebase Email/Password Registration
  const registerWithFirebase = async (name: string, email: string, password: string) => {
    try {
      console.log('🔥 Firebase: Attempting registration for:', email);
      
      // Create user with Firebase
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;
      
      // Update profile with name
      await firebaseUser.updateProfile({ displayName: name });
      
      console.log('✅ Firebase registration successful, UID:', firebaseUser.uid);
      
      // Sync with backend
      try {
        const response = await api.CLIENT.post(api.ENDPOINTS.AUTH.REGISTER, {
          name,
          email,
          password,
          firebaseUid: firebaseUser.uid,
        });
        
        const { token: newToken, user: userData } = response.data;
        
        if (newToken && userData) {
          const userWithFirebase = {
            ...userData,
            firebaseUid: firebaseUser.uid,
          };
          
          setToken(newToken);
          setUser(userWithFirebase);
          
          await AsyncStorage.setItem('token', newToken);
          await AsyncStorage.setItem('user', JSON.stringify(userWithFirebase));
          
          api.CLIENT.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          
          console.log('✅ Firebase registration successful, synced with backend');
        }
      } catch (backendError: any) {
        // If backend sync fails, use Firebase auth only
        console.warn('⚠️ Backend sync failed, using Firebase auth only:', backendError.message);
        
        const firebaseUserData = {
          id: firebaseUser.uid,
          _id: firebaseUser.uid,
          name: name,
          email: email,
          role: 'user',
          firebaseUid: firebaseUser.uid,
        };
        
        setUser(firebaseUserData);
        await AsyncStorage.setItem('user', JSON.stringify(firebaseUserData));
      }
    } catch (error: any) {
      console.error('❌ Firebase Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  };

  const sendOTP = async (phone: string) => {
    if (useFirebaseAuth) {
      await sendOTPWithFirebase(phone);
      return '';
    }

    try {
      console.log('📱 Sending OTP to:', phone);

      // Always call backend so OTP is stored in DB (required for verifyOTP)
      const response = await api.CLIENT.post(api.ENDPOINTS.AUTH.SEND_OTP, {
        phone,
      });

      console.log('✅ OTP sent:', response.data);

      // In development backend returns otp in response for testing
      return response.data.otp || '';
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send OTP';
      console.error('❌ Send OTP error:', errorMessage);
      throw new Error(errorMessage);
    }
  };

  const sendEmailOTP = async (email: string) => {
    try {
      const trimmed = email.trim().toLowerCase();
      console.log('📧 Sending OTP to email:', trimmed);

      const response = await api.CLIENT.post(api.ENDPOINTS.AUTH.SEND_OTP, {
        email: trimmed,
      });

      console.log('✅ Email OTP sent:', response.data);
      return response.data.otp || '';
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send OTP';
      console.error('❌ Send email OTP error:', errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Firebase OTP - Phone Authentication
  const sendOTPWithFirebase = async (phone: string) => {
    try {
      console.log('🔥 Firebase: Sending OTP to:', phone);
      
      // Format phone number for Firebase
      // Preserve spaces if present (for test numbers)
      let formattedPhone = phone.trim();
      
      // If phone starts with +91, keep it as is (might have spaces for test numbers)
      if (formattedPhone.startsWith('+91')) {
        // Keep the format as is (spaces preserved for test numbers)
        formattedPhone = formattedPhone;
      } else if (formattedPhone.startsWith('91')) {
        // Add + prefix
        formattedPhone = `+${formattedPhone}`;
      } else {
        // Remove all non-digits, then add +91
        const cleanPhone = phone.replace(/\D/g, '');
        formattedPhone = `+91${cleanPhone}`;
      }
      
      console.log('📱 Formatted phone:', formattedPhone);
      console.log('📱 Original phone:', phone);
      
      // Send OTP via Firebase
      const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
      
      // Store confirmation in AsyncStorage for verification
      await AsyncStorage.setItem('firebase_otp_confirmation', JSON.stringify({
        phone: formattedPhone,
        confirmationId: confirmation.verificationId,
        type: 'phone',
      }));
      
      console.log('✅ Firebase Phone OTP sent successfully');
      return 'OTP sent via Firebase';
    } catch (error: any) {
      console.error('❌ Firebase Send Phone OTP error:', error);
      
      // Better error messages
      let errorMessage = error.message || 'Failed to send OTP via Firebase';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format. Please use format: 9876543210';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/billing-not' || error.message?.includes('BILLING_NOT_ENABLED')) {
        errorMessage = 'Phone OTP requires Firebase Blaze plan. Enable billing in Firebase Console → Project Settings → Usage and billing → Modify plan.';
      } else if (error.message?.includes('API') || error.message?.includes('api')) {
        errorMessage = 'Firebase API error. Please check:\n1. Phone Authentication enabled in Firebase Console\n2. google-services.json is from project furrmaa-45315\n3. Test numbers added in Firebase Console';
      }
      
      throw new Error(errorMessage);
    }
  };

  // Firebase Email OTP - Email Link Authentication
  const sendEmailOTPWithFirebase = async (email: string) => {
    try {
      console.log('🔥 Firebase: Sending Email OTP to:', email);
      
      // Firebase Email Link Authentication
      const actionCodeSettings = {
        url: 'furmaa://email-action',
        handleCodeInApp: true,
        iOS: { bundleId: 'com.furmaa' },
        android: { 
          packageName: 'com.furmaa', 
          installApp: true,
          minimumVersion: '1',
        },
      };
      
      // Send sign-in link to email
      await auth().sendSignInLinkToEmail(email, actionCodeSettings);
      
      // Store email for verification
      await AsyncStorage.setItem('firebase_email_otp', JSON.stringify({
        email: email,
        type: 'email',
      }));
      
      console.log('✅ Firebase Email OTP sent successfully');
    } catch (error: any) {
      console.error('❌ Firebase Send Email OTP error:', error);
      throw new Error(error.message || 'Failed to send Email OTP via Firebase');
    }
  };

  // Firebase Email OTP Verification
  const verifyEmailOTPWithFirebase = async (email: string, otp: string) => {
    try {
      console.log('🔥 Firebase: Verifying Email OTP for:', email);
      
      // Check if email link was clicked (in production, this would be handled via deep link)
      // For now, we'll use email/password as fallback or check if user clicked the link
      // Note: Firebase Email Link auth requires the user to click the link in their email
      // This is a simplified version - in production, handle the deep link properly
      
      // Try to get the current user (if they clicked the email link)
      const currentUser = auth().currentUser;
      
      if (currentUser && currentUser.email === email) {
        // User has already authenticated via email link
        const firebaseToken = await currentUser.getIdToken();
        
        // Sync with backend
        try {
          const response = await api.CLIENT.post(api.ENDPOINTS.AUTH.LOGIN, {
            firebaseToken: firebaseToken,
          });
          
          const { token: newToken, user: userData } = response.data;
          
          if (newToken && userData) {
            const userWithRole = {
              ...userData,
              role: userData.role || 'user',
              email: userData.email || email,
              firebaseUid: currentUser.uid,
            };
            
            setToken(newToken);
            setUser(userWithRole);
            
            await AsyncStorage.setItem('token', newToken);
            await AsyncStorage.setItem('user', JSON.stringify(userWithRole));
            await AsyncStorage.removeItem('firebase_email_otp');
            
            api.CLIENT.defaults.headers.common.Authorization = `Bearer ${newToken}`;
            
            console.log('✅ Firebase Email OTP verification successful');
          }
        } catch (backendError: any) {
          if (isAxiosNetworkOnlyFailure(backendError)) {
            console.warn('⚠️ Backend not reachable. Using Firebase auth only.');
            console.warn('⚠️ Make sure backend is running on:', api.BASE_URL);

            const firebaseUserData = {
              id: currentUser.uid,
              _id: currentUser.uid,
              name: currentUser.displayName || email.split('@')[0] || 'User',
              email: email,
              phone: currentUser.phoneNumber || null,
              role: 'user',
              firebaseUid: currentUser.uid,
            };

            setUser(firebaseUserData);
            await AsyncStorage.setItem('user', JSON.stringify(firebaseUserData));
            await AsyncStorage.removeItem('firebase_email_otp');

            console.log('✅ Firebase Email OTP verified (backend offline, using Firebase auth only)');
            return;
          }
          throw backendError;
        }
      } else {
        throw new Error('Please click the link in your email to verify');
      }
    } catch (error: any) {
      console.error('❌ Firebase Verify Email OTP error:', error);
      throw new Error(error.message || 'Email OTP verification failed');
    }
  };

  const verifyOTP = async (identifier: string, otp: string, type: 'phone' | 'email' = 'phone') => {
    if (useFirebaseAuth && type === 'phone') {
      return verifyOTPWithFirebase(identifier, otp);
    }

    try {
      console.log('🔐 Verifying OTP for:', identifier, `(${type})`);
      console.log('🌐 API URL:', api.BASE_URL + api.ENDPOINTS.AUTH.VERIFY_OTP);

      const body =
        type === 'email'
          ? { email: identifier.trim().toLowerCase(), otp }
          : { phone: identifier, otp };
      
      const response = await api.CLIENT.post(api.ENDPOINTS.AUTH.VERIFY_OTP, body);

      console.log('✅ OTP verified:', response.data);
      console.log('👤 User role from server:', response.data?.user?.role);

      const { token: newToken, user: userData } = response.data;
      
      if (!newToken || !userData) {
        throw new Error('Invalid response from server');
      }
      
      // Ensure role is included
      const userWithRole = {
        ...userData,
        role: userData.role || 'user',
        phone: userData.phone || (type === 'phone' ? identifier : undefined),
        email: userData.email || (type === 'email' ? identifier.trim().toLowerCase() : undefined),
      };
      
      console.log('👤 Final user data:', userWithRole);
      
      setToken(newToken);
      setUser(userWithRole);
      
      await AsyncStorage.setItem('token', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(userWithRole));
      
      api.CLIENT.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      
      console.log('✅ OTP verification successful, token stored');
    } catch (error: any) {
      console.error('❌ Verify OTP error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
        request: error.request ? 'Request sent but no response' : null,
      });

      // Better error messages for network issues
      let errorMessage = 'OTP verification failed';
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
        errorMessage = 'Network error: Please check your internet connection and ensure backend server is running';
      } else if (error.request && !error.response) {
        errorMessage = 'Network error: Could not reach server. Please check if backend is running on ' + api.BASE_URL;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('❌ Verify OTP error:', errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Firebase OTP Verification - Uses Firebase ID Token
  const verifyOTPWithFirebase = async (phone: string, otp: string) => {
    try {
      console.log('🔥 Firebase: Verifying OTP for:', phone);
      
      // Get stored confirmation
      const stored = await AsyncStorage.getItem('firebase_otp_confirmation');
      if (!stored) {
        throw new Error('OTP session expired. Please request OTP again.');
      }
      
      const { confirmationId } = JSON.parse(stored);
      
      // Create credential using FirebaseAuthTypes.PhoneAuthCredential
      const credential = auth.PhoneAuthProvider.credential(confirmationId, otp);
      
      // Sign in with credential
      const userCredential = await auth().signInWithCredential(credential);
      const firebaseUser = userCredential.user;
      
      console.log('✅ Firebase OTP verified, Firebase UID:', firebaseUser.uid);
      
      // Get Firebase ID Token
      const firebaseToken = await firebaseUser.getIdToken();
      
      // Now sync with backend using Firebase ID Token
      try {
        const response = await api.CLIENT.post(api.ENDPOINTS.AUTH.LOGIN, {
          firebaseToken: firebaseToken,
        });
        
        const { token: newToken, user: userData } = response.data;
        
        if (newToken && userData) {
          const userWithRole = {
            ...userData,
            role: userData.role || 'user',
            phone: userData.phone || phone,
            firebaseUid: firebaseUser.uid,
          };
          
          setToken(newToken);
          setUser(userWithRole);
          
          await AsyncStorage.setItem('token', newToken);
          await AsyncStorage.setItem('user', JSON.stringify(userWithRole));
          await AsyncStorage.removeItem('firebase_otp_confirmation');
          
          api.CLIENT.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          
          console.log('✅ Firebase OTP verification successful, synced with backend');
        }
      } catch (backendError: any) {
        if (isAxiosNetworkOnlyFailure(backendError)) {
          console.warn('⚠️ Backend not reachable. Using Firebase auth only.');
          console.warn('⚠️ Make sure backend is running on:', api.BASE_URL);

          const firebaseUserData = {
            id: firebaseUser.uid,
            _id: firebaseUser.uid,
            name: firebaseUser.displayName || `User ${phone.slice(-4)}`,
            email: firebaseUser.email || `${phone}@furmaa.com`,
            phone: phone,
            role: 'user',
            firebaseUid: firebaseUser.uid,
          };

          setUser(firebaseUserData);
          await AsyncStorage.setItem('user', JSON.stringify(firebaseUserData));
          await AsyncStorage.removeItem('firebase_otp_confirmation');

          console.log('✅ Firebase OTP verified (backend offline, using Firebase auth only)');
          return;
        }

        console.warn('⚠️ Backend sync failed:', backendError.message);

        const firebaseUserData = {
          id: firebaseUser.uid,
          _id: firebaseUser.uid,
          name: firebaseUser.displayName || `User ${phone.slice(-4)}`,
          email: firebaseUser.email || `${phone}@furmaa.com`,
          phone: phone,
          role: 'user',
          firebaseUid: firebaseUser.uid,
        };

        setUser(firebaseUserData);
        await AsyncStorage.setItem('user', JSON.stringify(firebaseUserData));
        await AsyncStorage.removeItem('firebase_otp_confirmation');

        console.log('✅ Firebase OTP verified (backend sync skipped)');
      }
    } catch (error: any) {
      console.error('❌ Firebase Verify OTP error:', error);
      throw new Error(error.message || 'OTP verification failed');
    }
  };

  // Google Sign-In
  const loginWithGoogle = async () => {
    try {
      console.log('🔵 Google Sign-In: Starting...');
      
      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Get user info from Google (v16: response is { type, data } where data has idToken & user)
      const signInResult = await GoogleSignin.signIn();
      
      if (signInResult.type !== 'success' || !signInResult.data?.idToken) {
        throw new Error('Google Sign-In failed: No ID token');
      }
      
      const userInfo = signInResult.data;
      console.log('✅ Google Sign-In: Got user info', userInfo.user?.email);
      
      // Create Firebase credential
      const googleCredential = auth.GoogleAuthProvider.credential(userInfo.idToken);
      
      // Sign in to Firebase with Google credential
      const firebaseUserCredential = await auth().signInWithCredential(googleCredential);
      const firebaseUser = firebaseUserCredential.user;
      
      console.log('✅ Google Sign-In: Firebase authenticated', firebaseUser.uid);
      
      // Get Firebase ID Token
      const firebaseToken = await firebaseUser.getIdToken();
      
      // Sync with backend using Firebase ID Token
      try {
        const response = await api.CLIENT.post(api.ENDPOINTS.AUTH.LOGIN, {
          firebaseToken: firebaseToken,
        });
        
        const { token: newToken, user: userData } = response.data;
        
        if (newToken && userData) {
          const userWithFirebase = {
            ...userData,
            firebaseUid: firebaseUser.uid,
          };
          
          setToken(newToken);
          setUser(userWithFirebase);
          
          await AsyncStorage.setItem('token', newToken);
          await AsyncStorage.setItem('user', JSON.stringify(userWithFirebase));
          
          api.CLIENT.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          
          console.log('✅ Google Sign-In: Synced with backend');
        }
      } catch (backendError: any) {
        const status = backendError.response?.status;
        const apiMsg = String(backendError.response?.data?.message || '');
        if (
          status === 401 &&
          apiMsg.includes('Firebase Admin')
        ) {
          throw new Error(
            'Server Firebase token verify nahi kar pa raha (Firebase Admin .env khali). Isliye Google → backend login band hai. Chalane ke 2 raaste (backend code change nahi): (1) Web jaisa — `src/config/auth0.ts` bharo, tab Google Auth0 se khulega; (2) Ya server par sirf FIREBASE_* env set karo. Phone OTP backend se alag chal sakta hai.'
          );
        }

        if (isAxiosNetworkOnlyFailure(backendError)) {
          console.warn('⚠️ Backend not reachable. Using Firebase auth only.');
          console.warn('⚠️ Make sure backend is running on:', api.BASE_URL);

          const firebaseUserData = {
            id: firebaseUser.uid,
            _id: firebaseUser.uid,
            name: (firebaseUser.displayName || userInfo.user?.name) ?? 'Google User',
            email: (firebaseUser.email || userInfo.user?.email) ?? '',
            phone: firebaseUser.phoneNumber || null,
            role: 'user',
            firebaseUid: firebaseUser.uid,
          };

          setUser(firebaseUserData);
          await AsyncStorage.setItem('user', JSON.stringify(firebaseUserData));

          console.log('✅ Google Sign-In successful (backend offline, using Firebase auth only)');
          return;
        }

        console.warn('⚠️ Backend sync failed:', backendError.message);

        const firebaseUserData = {
          id: firebaseUser.uid,
          _id: firebaseUser.uid,
          name: (firebaseUser.displayName || userInfo.user?.name) ?? 'Google User',
          email: (firebaseUser.email || userInfo.user?.email) ?? '',
          phone: firebaseUser.phoneNumber || null,
          role: 'user',
          firebaseUid: firebaseUser.uid,
        };

        setUser(firebaseUserData);
        await AsyncStorage.setItem('user', JSON.stringify(firebaseUserData));

        console.log('✅ Google Sign-In successful (backend sync skipped)');
      }
    } catch (error: any) {
      console.error('❌ Google Sign-In error:', error);
      throw new Error(error.message || 'Google Sign-In failed');
    }
  };

  const loginWithAuth0Apple = async () => {
    const client = getAuth0Client();
    if (!client) {
      throw new Error('Auth0 is not configured. Fill src/config/auth0.ts');
    }
    const credentials = await client.webAuth.authorize({
      scope: 'openid profile email offline_access',
      audience: AUTH0_AUDIENCE.trim(),
      connection: 'apple',
    });
    const { user: u, accessToken } = await applyAuth0Credentials(credentials);
    setToken(accessToken);
    setUser(u);
  };

  const loginWithAuth0Google = async () => {
    const client = getAuth0Client();
    if (!client) {
      throw new Error('Auth0 is not configured. Fill src/config/auth0.ts');
    }
    const credentials = await client.webAuth.authorize({
      scope: 'openid profile email offline_access',
      audience: AUTH0_AUDIENCE.trim(),
      connection: 'google-oauth2',
    });
    const { user: u, accessToken } = await applyAuth0Credentials(credentials);
    setToken(accessToken);
    setUser(u);
  };

  // Apple Sign-In (iOS only)
  const loginWithApple = async () => {
    try {
      if (Platform.OS !== 'ios') {
        throw new Error('Apple Sign-In is only available on iOS');
      }
      
      console.log('🍎 Apple Sign-In: Starting...');
      
      // Start Apple Sign-In
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });
      
      if (!appleAuthRequestResponse.identityToken) {
        throw new Error('Apple Sign-In failed: No identity token');
      }
      
      const { identityToken, nonce } = appleAuthRequestResponse;
      
      // Create Firebase credential
      const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
      
      // Sign in to Firebase with Apple credential
      const firebaseUserCredential = await auth().signInWithCredential(appleCredential);
      const firebaseUser = firebaseUserCredential.user;
      
      console.log('✅ Apple Sign-In: Firebase authenticated', firebaseUser.uid);
      
      // Get user name from Apple response
      const fullName = appleAuthRequestResponse.fullName;
      const displayName = fullName 
        ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim()
        : 'Apple User';
      
      // Sync with backend
      try {
        const response = await api.CLIENT.post(api.ENDPOINTS.AUTH.REGISTER, {
          name: displayName,
          email: firebaseUser.email || appleAuthRequestResponse.email || `${firebaseUser.uid}@apple.com`,
          password: Math.random().toString(36).slice(-12), // Random password for Apple users
          firebaseUid: firebaseUser.uid,
        });
        
        const { token: newToken, user: userData } = response.data;
        
        if (newToken && userData) {
          const userWithFirebase = {
            ...userData,
            firebaseUid: firebaseUser.uid,
          };
          
          setToken(newToken);
          setUser(userWithFirebase);
          
          await AsyncStorage.setItem('token', newToken);
          await AsyncStorage.setItem('user', JSON.stringify(userWithFirebase));
          
          api.CLIENT.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          
          console.log('✅ Apple Sign-In: Synced with backend');
        }
      } catch (backendError: any) {
        // If user already exists, try login
        if (backendError.response?.status === 400) {
          try {
            const loginResponse = await api.CLIENT.post(api.ENDPOINTS.AUTH.LOGIN, {
              email: firebaseUser.email || `${firebaseUser.uid}@apple.com`,
              firebaseUid: firebaseUser.uid,
            });
            
            const { token: newToken, user: userData } = loginResponse.data;
            
            if (newToken && userData) {
              const userWithFirebase = {
                ...userData,
                firebaseUid: firebaseUser.uid,
              };
              
              setToken(newToken);
              setUser(userWithFirebase);
              
              await AsyncStorage.setItem('token', newToken);
              await AsyncStorage.setItem('user', JSON.stringify(userWithFirebase));
              
              api.CLIENT.defaults.headers.common.Authorization = `Bearer ${newToken}`;
              
              console.log('✅ Apple Sign-In: Logged in via backend');
            }
          } catch (loginError) {
            console.warn('⚠️ Backend sync failed, using Firebase auth only:', loginError);
            
            // Use Firebase auth only
            const firebaseUserData = {
              id: firebaseUser.uid,
              _id: firebaseUser.uid,
              name: displayName,
              email: firebaseUser.email || `${firebaseUser.uid}@apple.com`,
              role: 'user',
              firebaseUid: firebaseUser.uid,
            };
            
            setUser(firebaseUserData);
            await AsyncStorage.setItem('user', JSON.stringify(firebaseUserData));
          }
        } else {
          throw backendError;
        }
      }
    } catch (error: any) {
      console.error('❌ Apple Sign-In error:', error);
      throw new Error(error.message || 'Apple Sign-In failed');
    }
  };

  const logout = async () => {
    try {
      // Pehle local session — Auth0 browser (clearSession) mat kholo
      setToken(null);
      setUser(null);
      delete api.CLIENT.defaults.headers.common.Authorization;
      await clearAuthStorage();

      const client = getAuth0Client();
      if (client) {
        try {
          await client.credentialsManager.clearCredentials();
        } catch (auth0Err) {
          console.warn('Auth0 clearCredentials:', auth0Err);
        }
      }

      try {
        await auth().signOut();
      } catch (firebaseError) {
        console.log('⚠️ Firebase sign out:', firebaseError);
      }

      try {
        if (GoogleSignin.hasPreviousSignIn()) {
          await GoogleSignin.signOut();
        }
      } catch (googleError) {
        console.log('⚠️ Google sign out:', googleError);
      }

      resetToLoginScreen();
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('Error logging out:', error);
      setToken(null);
      setUser(null);
      await clearAuthStorage().catch(() => {});
      resetToLoginScreen();
      throw error;
    }
  };

  const refreshUser = useCallback(async () => {
    const storedToken = await AsyncStorage.getItem('token');
    if (!storedToken) return;
    try {
      const response = await api.CLIENT.get(api.ENDPOINTS.AUTH.ME);
      const u = response?.data?.user;
      if (!u) return;
      const freshUser: User = {
        id: u._id ?? u.id ?? '',
        name: u.name ?? '',
        email: u.email ?? '',
        role: u.role || 'user',
        profileImage: u.profileImage ?? undefined,
        phone: u.phone ?? undefined,
      };
      setUser(freshUser);
      await AsyncStorage.setItem('user', JSON.stringify(freshUser));
    } catch (_) {
      // keep existing user
    }
  }, []);

  /** Web login page jaisa: Firebase mode me social bhi Firebase se */
  const loginSocialGoogle = async () => {
    if (useFirebaseAuth) return loginWithGoogle();
    if (isAuth0Configured()) return loginWithAuth0Google();
    return loginWithGoogle();
  };

  const loginSocialApple = async () => {
    if (useFirebaseAuth) {
      if (Platform.OS !== 'ios') {
        throw new Error('Apple Sign-In on iOS only with Firebase. Use Google or phone OTP.');
      }
      return loginWithApple();
    }
    if (isAuth0Configured()) return loginWithAuth0Apple();
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Sign-In is only available on iOS devices');
    }
    return loginWithApple();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginWithFirebase,
        register,
        registerWithFirebase,
        sendOTP,
        sendEmailOTP,
        sendOTPWithFirebase,
        sendEmailOTPWithFirebase,
        verifyOTP,
        verifyOTPWithFirebase,
        verifyEmailOTPWithFirebase,
        loginWithGoogle,
        loginWithApple,
        loginWithAuth0Apple,
        loginWithAuth0Google,
        loginSocialGoogle,
        loginSocialApple,
        auth0SocialLoginEnabled: isAuth0Configured(),
        useFirebaseAuth,
        logout,
        refreshUser,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
