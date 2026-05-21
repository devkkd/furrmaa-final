# Firebase Authentication Setup Guide

## ✅ Integration Complete!

All three authentication methods have been integrated:
1. **Phone Number Login** (Firebase Phone Auth)
2. **Google Login** (Firebase Google Sign-In)
3. **Apple Login** (Firebase Apple Sign-In) - iOS only

## 📋 Setup Instructions

### Step 1: Get Firebase Web Client ID

1. Go to [Firebase Console](https://console.firebase.google.com/project/furmaa-app/settings/serviceaccounts/adminsdk)
2. Navigate to **Project Settings** (gear icon) > **General** tab
3. Scroll down to **Your apps** section
4. Find your **Web app** (or create one if it doesn't exist)
5. Copy the **Web client ID** (format: `123456789-xxxxx.apps.googleusercontent.com`)
6. Open `Farmaa/src/context/AuthContext.tsx`
7. Find line 48 and replace `YOUR_FIREBASE_WEB_CLIENT_ID_HERE.apps.googleusercontent.com` with your actual Web Client ID

### Step 2: Verify Firebase Authentication Methods

In Firebase Console, go to **Authentication** > **Sign-in method** and ensure:

1. **Phone** - Enabled ✅
2. **Google** - Enabled ✅
   - Add your SHA-1 certificate fingerprint for Android
   - Configure OAuth consent screen
3. **Apple** - Enabled ✅ (iOS only)
   - Configure Apple Sign-In settings

### Step 3: Add Test Phone Numbers (Optional - for development)

1. Go to **Authentication** > **Sign-in method** > **Phone**
2. Click **Phone numbers for testing**
3. Add test phone numbers (format: +91XXXXXXXXXX)
4. Add test OTP codes (6 digits)

### Step 4: Configure SHA-1 for Android (Google Sign-In)

1. Get your SHA-1 fingerprint:
   ```bash
   cd android
   ./gradlew signingReport
   ```
2. Copy the SHA-1 from the output
3. Go to Firebase Console > Project Settings > General
4. Scroll to **Your apps** > Android app
5. Click **Add fingerprint** and paste your SHA-1

### Step 5: iOS Configuration (Apple Sign-In)

1. In Xcode, enable **Sign in with Apple** capability
2. Configure your Apple Developer account
3. Add your bundle identifier in Firebase Console

## 📱 How to Use

### Login Screen
- **Email/Password**: Traditional login
- **Google Button**: Sign in with Google account
- **Apple Button**: Sign in with Apple (iOS only)
- **Phone Login**: Navigate to phone number login screen

### Mobile Login Screen
- Enter phone number
- Receive OTP via SMS
- Verify OTP to login
- Or use Google/Apple buttons

## 🔧 Files Modified

1. `src/context/AuthContext.tsx` - Added Firebase auth methods
2. `src/screens/auth/LoginScreen.tsx` - Added Google, Apple, and Phone login options
3. `src/screens/auth/MobileLoginScreen.tsx` - Already had all three methods ✅

## ⚠️ Important Notes

1. **Web Client ID**: Must be updated in `AuthContext.tsx` for Google Sign-In to work
2. **Phone Auth**: Requires Firebase Phone Authentication to be enabled
3. **Google Sign-In**: Requires SHA-1 fingerprint for Android
4. **Apple Sign-In**: Only works on iOS devices
5. **Backend Sync**: All methods sync with your backend API automatically

## 🐛 Troubleshooting

### Google Sign-In not working?
- Check Web Client ID is correct
- Verify SHA-1 fingerprint is added in Firebase Console
- Ensure Google Sign-In is enabled in Firebase Console

### Phone Auth not working?
- Verify Phone Authentication is enabled in Firebase Console
- Check phone number format (+91XXXXXXXXXX)
- For testing, add test numbers in Firebase Console

### Apple Sign-In not working?
- Only works on iOS devices
- Verify Apple Sign-In is enabled in Firebase Console
- Check iOS bundle identifier matches Firebase

## 📞 Support

If you face any issues, check:
1. Firebase Console logs
2. React Native logs (`npx react-native log-android` or `npx react-native log-ios`)
3. Backend API logs

---

**Status**: ✅ All three authentication methods integrated and ready to use!





