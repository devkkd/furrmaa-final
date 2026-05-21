# 🔥 Firebase OTP Complete Setup Guide

## ✅ Your Firebase Project Info

**Project Name:** Furrmaa  
**Project ID:** furrmaa-45315  
**Firebase Console:** https://console.firebase.google.com/project/furrmaa-45315

**Frontend Config (Already Provided):**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAjlH82LKTA7m0X2dpeJUPBxJ83Z4icobs",
  authDomain: "furrmaa-45315.firebaseapp.com",
  projectId: "furrmaa-45315",
  storageBucket: "furrmaa-45315.firebasestorage.app",
  messagingSenderId: "200582949604",
  appId: "1:200582949604:web:84b5a8658588a4fd8adaf1",
  measurementId: "G-KQ8E1MZS8H"
};
```

---

## 🔧 Backend Setup (Firebase Admin SDK)

### Step 1: Service Account Key Download

1. **Firebase Console me jayein:**
   - https://console.firebase.google.com/project/furrmaa-45315/settings/serviceaccounts/adminsdk

2. **"Generate new private key" button click karein**

3. **JSON file download hogi** (jaise: `furrmaa-45315-firebase-adminsdk-xxxxx.json`)

4. **JSON file open karein aur ye values copy karein:**
   - `project_id` → `furrmaa-45315`
   - `client_email` → `firebase-adminsdk-xxxxx@furrmaa-45315.iam.gserviceaccount.com`
   - `private_key` → `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n`

### Step 2: .env File Me Add Karein

Backend folder me `.env` file me ye add karein:

```env
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=furrmaa-45315
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@furrmaa-45315.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\\n-----END PRIVATE KEY-----\\n"
```

**⚠️ CRITICAL - Private Key Formatting:**
1. Private key ko double quotes me wrap karein
2. Har `\n` ko `\\n` se replace karein
3. Complete private key copy karein (-----BEGIN se -----END tak)
4. Example:
   ```
   Original: -----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n
   In .env: "-----BEGIN PRIVATE KEY-----\\nMIIEvQ...\\n-----END PRIVATE KEY-----\\n"
   ```

### Step 3: Server Restart

```bash
cd backend
npm run dev
```

**Expected Output:**
```
✅ Firebase Admin SDK initialized successfully
✅ MongoDB Connected: ...
🚀 Server is running on port 5000
```

---

## 📱 Frontend Setup (React Native)

### Step 1: Check Firebase SDK

Check karein ki Firebase SDK install hai ya nahi:

```bash
cd Farmaa
npm list @react-native-firebase/app @react-native-firebase/auth
```

Agar nahi hai, to install karein:

```bash
npm install @react-native-firebase/app @react-native-firebase/auth
```

### Step 2: Android Setup

1. **Firebase Console > Project Settings > General**
2. Android app check karein (ya add karein)
3. `google-services.json` download karein
4. File ko `Farmaa/android/app/google-services.json` me copy karein
5. `Farmaa/android/app/build.gradle` me verify karein:
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```

### Step 3: iOS Setup

1. **Firebase Console > Project Settings > General**
2. iOS app check karein (ya add karein)
3. `GoogleService-Info.plist` download karein
4. File ko `Farmaa/ios/GoogleService-Info.plist` me copy karein
5. Xcode me file add karein

### Step 4: Firebase Config Update

Update: `Farmaa/src/config/firebase.ts`

```typescript
import auth from '@react-native-firebase/auth';

// Firebase is auto-initialized with google-services.json / GoogleService-Info.plist
// No manual initialization needed for React Native

export { auth };
export default auth;
```

---

## 📧 Email OTP - Frontend Implementation

Create: `Farmaa/src/services/firebaseAuth.ts`

```typescript
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';

// Send Email OTP Link
export const sendEmailOTP = async (email: string) => {
  try {
    const actionCodeSettings = {
      url: 'furrmaa://email-action', // Your app deep link scheme
      handleCodeInApp: true,
      iOS: { bundleId: 'com.furrmaa.app' }, // Update with your bundle ID
      android: { 
        packageName: 'com.furrmaa', // Update with your package name
        installApp: true 
      },
    };
    
    await auth().sendSignInLinkToEmail(email, actionCodeSettings);
    await AsyncStorage.setItem('emailForSignIn', email);
    
    return { 
      success: true, 
      message: 'Email sent! Check your inbox and click the link.' 
    };
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to send email' 
    };
  }
};

// Verify Email Link (when user clicks email link)
export const verifyEmailLink = async (email: string, link: string) => {
  try {
    if (auth().isSignInWithEmailLink(link)) {
      const credential = await auth().signInWithEmailLink(email, link);
      const idToken = await credential.user.getIdToken();
      
      // Send to backend
      const response = await fetch('http://your-backend/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseToken: idToken })
      });
      
      const data = await response.json();
      return data;
    } else {
      return { success: false, message: 'Invalid email link' };
    }
  } catch (error: any) {
    console.error('❌ Error verifying email link:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to verify email link' 
    };
  }
};

// Handle Deep Links (for email OTP)
export const setupEmailLinkHandler = (callback: (data: any) => void) => {
  const handleDeepLink = async (url: string) => {
    if (auth().isSignInWithEmailLink(url)) {
      const email = await AsyncStorage.getItem('emailForSignIn');
      if (email) {
        const result = await verifyEmailLink(email, url);
        callback(result);
      }
    }
  };
  
  // Listen for deep links
  Linking.addEventListener('url', (event) => {
    handleDeepLink(event.url);
  });
  
  // Check if app was opened via deep link
  Linking.getInitialURL().then(url => {
    if (url) handleDeepLink(url);
  });
};
```

---

## 📱 Phone OTP - Frontend Implementation

Add to: `Farmaa/src/services/firebaseAuth.ts`

```typescript
import auth from '@react-native-firebase/auth';

// Send Phone OTP
export const sendPhoneOTP = async (phoneNumber: string) => {
  try {
    // Format: +919876543210 (with country code, no spaces)
    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber.replace(/\s/g, '') 
      : `+91${phoneNumber.replace(/\s/g, '')}`;
    
    const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
    
    return { 
      success: true, 
      confirmation, // Save this for verification
      message: 'OTP sent to your phone!' 
    };
  } catch (error: any) {
    console.error('❌ Error sending SMS:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to send OTP' 
    };
  }
};

// Verify Phone OTP
export const verifyPhoneOTP = async (confirmation: any, code: string) => {
  try {
    const credential = await confirmation.confirm(code);
    const idToken = await credential.user.getIdToken();
    
    // Send to backend
    const response = await fetch('http://your-backend/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseToken: idToken })
    });
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('❌ Error verifying SMS code:', error);
    return { 
      success: false, 
      message: error.message || 'Invalid OTP code' 
    };
  }
};
```

---

## 🔌 Backend API (Already Ready!)

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "firebaseToken": "firebase_id_token_from_frontend"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Firebase authentication successful",
  "token": "backend_jwt_token",
  "user": {
    "id": "...",
    "name": "User Name",
    "email": "user@example.com",
    "phone": "+919876543210",
    "role": "user",
    "firebaseUid": "firebase_uid"
  }
}
```

---

## ✅ Setup Checklist

### Backend:
- [ ] Firebase Console se Service Account Key download karein
- [ ] JSON file se values extract karein
- [ ] `.env` file me Firebase credentials add karein (FIREBASE_PRIVATE_KEY me `\n` ko `\\n` se replace)
- [ ] Server restart karein
- [ ] Check logs: "✅ Firebase Admin SDK initialized successfully"

### Frontend:
- [ ] Firebase SDK install karein (`@react-native-firebase/app`, `@react-native-firebase/auth`)
- [ ] `google-services.json` (Android) download aur add karein
- [ ] `GoogleService-Info.plist` (iOS) download aur add karein
- [ ] Firebase config file update karein
- [ ] Email OTP service create karein
- [ ] Phone OTP service create karein
- [ ] Deep link handler setup karein (email OTP ke liye)
- [ ] Backend login integrate karein

---

## 🎯 Quick Start

1. **Backend:** Service account key download → `.env` me add → Server restart
2. **Frontend:** Firebase SDK install → Config files add → Services implement
3. **Test:** Email OTP aur Phone OTP test karein

---

## 📝 Important Notes

- **Email OTP:** Firebase se email link jayega (passwordless sign-in)
- **Phone OTP:** Firebase se SMS jayega (free tier: 10 SMS/day)
- **Backend:** Firebase ID token verify karega aur JWT token generate karega
- **Private Key:** `.env` me `\n` ko `\\n` se replace karna zaroori hai

---

**Complete setup ready! Follow the steps aur Firebase OTP kaam karega!** 🚀









