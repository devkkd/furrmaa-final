# 🔥 Firebase OTP Complete Setup Guide

## 📋 Overview

Firebase Authentication ke through Email aur Phone OTP setup karein.

---

## ✅ What You Have

**Frontend Firebase Config:**
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

**Backend Status:**
- ✅ Firebase Admin SDK configured
- ✅ Login endpoint supports Firebase token
- ✅ Firebase token verification implemented

---

## 🔧 Backend Setup (Firebase Admin SDK)

### Step 1: Firebase Service Account Key Download

1. **Firebase Console me jayein:**
   - https://console.firebase.google.com
   - Project "Furrmaa" select karein

2. **Service Account Key generate karein:**
   - Project Settings (gear icon) > Service Accounts tab
   - "Generate new private key" button click karein
   - JSON file download hogi

3. **Environment Variables me dal dein:**

**Option A: Individual Environment Variables (Recommended)**

JSON file se ye values extract karein:
- `project_id` → `FIREBASE_PROJECT_ID`
- `client_email` → `FIREBASE_CLIENT_EMAIL`
- `private_key` → `FIREBASE_PRIVATE_KEY` (important: `\n` ko `\\n` se replace karein)

**Option B: JSON File Path**

Service account JSON file ko backend folder me save karein aur path dal dein.

---

### Step 2: .env File Update

```env
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=furrmaa-45315
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@furrmaa-45315.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
# Note: FIREBASE_PRIVATE_KEY me \n ko \\n se replace karein

# Or use JSON file path:
# FIREBASE_SERVICE_ACCOUNT_PATH=./path/to/serviceAccountKey.json
```

**Important:** `FIREBASE_PRIVATE_KEY` me `\n` characters ko `\\n` se replace karein!

---

## 📱 Frontend Setup (React Native)

### Step 1: Install Firebase SDK

```bash
cd Farmaa
npm install @react-native-firebase/app @react-native-firebase/auth
```

### Step 2: Firebase Configuration

**For Android:**
1. Firebase Console > Project Settings > General
2. Android app select karein (ya add karein)
3. `google-services.json` download karein
4. `Farmaa/android/app/` folder me copy karein

**For iOS:**
1. Firebase Console > Project Settings > General
2. iOS app select karein (ya add karein)
3. `GoogleService-Info.plist` download karein
4. `Farmaa/ios/` folder me copy karein
5. Xcode me add karein

### Step 3: Firebase Config File

Create: `Farmaa/src/config/firebase.config.js`

```javascript
import { initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAjlH82LKTA7m0X2dpeJUPBxJ83Z4icobs",
  authDomain: "furrmaa-45315.firebaseapp.com",
  projectId: "furrmaa-45315",
  storageBucket: "furrmaa-45315.firebasestorage.app",
  messagingSenderId: "200582949604",
  appId: "1:200582949604:web:84b5a8658588a4fd8adaf1",
  measurementId: "G-KQ8E1MZS8H"
};

// Firebase automatically initializes with google-services.json / GoogleService-Info.plist
// No need to call initializeApp for React Native

export { auth };
export default firebaseConfig;
```

---

## 📧 Email OTP Implementation (Frontend)

```javascript
import auth from '@react-native-firebase/auth';
import { Linking } from 'react-native';

// Send Email OTP Link
const sendEmailOTPLink = async (email) => {
  try {
    const actionCodeSettings = {
      url: 'furrmaa://email-action', // Your app deep link
      handleCodeInApp: true,
      iOS: { bundleId: 'com.furrmaa.app' }, // Replace with your bundle ID
      android: { 
        packageName: 'com.furrmaa', // Replace with your package name
        installApp: true 
      },
    };
    
    await auth().sendSignInLinkToEmail(email, actionCodeSettings);
    console.log('✅ Email sent successfully');
    
    // Save email for later use
    await AsyncStorage.setItem('emailForSignIn', email);
    
    return { success: true, message: 'Email sent! Check your inbox.' };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, message: error.message };
  }
};

// Handle Email Link (when user clicks email link)
const handleEmailLink = async (email, code) => {
  try {
    // Verify the email link
    const credential = await auth().signInWithEmailLink(email, code);
    const idToken = await credential.user.getIdToken();
    
    // Send to backend
    const response = await fetch('http://your-backend/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseToken: idToken })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error verifying email link:', error);
    return { success: false, message: error.message };
  }
};

// Listen for deep links
useEffect(() => {
  const handleDeepLink = (url) => {
    if (auth().isSignInWithEmailLink(url)) {
      const email = await AsyncStorage.getItem('emailForSignIn');
      if (email) {
        handleEmailLink(email, url);
      }
    }
  };
  
  Linking.addEventListener('url', handleDeepLink);
  Linking.getInitialURL().then(url => {
    if (url) handleDeepLink(url);
  });
  
  return () => {
    Linking.removeEventListener('url', handleDeepLink);
  };
}, []);
```

---

## 📱 Phone OTP Implementation (Frontend)

```javascript
import auth from '@react-native-firebase/auth';

// Send Phone OTP
const sendPhoneOTP = async (phoneNumber) => {
  try {
    // Phone number format: +919876543210 (with country code)
    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+91${phoneNumber}`; // Adjust country code
    
    const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
    
    // Save confirmation for verification
    return { 
      success: true, 
      confirmation,
      message: 'OTP sent to your phone!' 
    };
  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    return { success: false, message: error.message };
  }
};

// Verify Phone OTP
const verifyPhoneOTP = async (confirmation, code) => {
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
  } catch (error) {
    console.error('❌ Error verifying SMS code:', error);
    return { success: false, message: 'Invalid OTP code' };
  }
};
```

---

## 🔌 Backend API (Already Ready!)

### Login with Firebase Token

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
- [ ] `.env` file me Firebase credentials add karein
- [ ] Server restart karein
- [ ] Test karein

### Frontend:
- [ ] Firebase SDK install karein
- [ ] `google-services.json` (Android) add karein
- [ ] `GoogleService-Info.plist` (iOS) add karein
- [ ] Firebase config file create karein
- [ ] Email OTP implementation
- [ ] Phone OTP implementation
- [ ] Backend login integration

---

## 🎯 Quick Start

1. **Backend `.env` me Firebase credentials add karein**
2. **Frontend me Firebase SDK install karein**
3. **Email/Phone OTP implement karein**
4. **Backend login integrate karein**

**Complete implementation ready hai! Setup karein aur use karein!** 🚀









