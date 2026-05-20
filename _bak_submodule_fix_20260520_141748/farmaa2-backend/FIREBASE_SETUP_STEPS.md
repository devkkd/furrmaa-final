# 🔥 Firebase OTP Setup - Step by Step

## ✅ Project Info

**Project Name:** Furrmaa  
**Project ID:** furrmaa-45315  
**Firebase Console:** https://console.firebase.google.com/project/furrmaa-45315

---

## 🔧 Backend Setup (Firebase Admin SDK)

### Step 1: Service Account Key Download

1. Firebase Console me jayein: https://console.firebase.google.com/project/furrmaa-45315/settings/serviceaccounts/adminsdk

2. "Generate new private key" button click karein

3. JSON file download hogi (jaise: `furrmaa-45315-firebase-adminsdk-xxxxx.json`)

4. JSON file khol kar ye values dekhein:
   - `project_id`: `furrmaa-45315`
   - `client_email`: `firebase-adminsdk-xxxxx@furrmaa-45315.iam.gserviceaccount.com`
   - `private_key`: `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n`

### Step 2: .env File Me Add Karein

Backend folder me `.env` file me ye add karein:

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=furrmaa-45315
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@furrmaa-45315.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\\n-----END PRIVATE KEY-----\\n"
```

**⚠️ IMPORTANT:** 
- `FIREBASE_PRIVATE_KEY` me har `\n` ko `\\n` se replace karein
- Private key ko double quotes me wrap karein
- Complete private key copy karein (-----BEGIN se -----END tak)

### Step 3: Server Restart

```bash
cd backend
npm run dev
```

**Expected Output:**
```
✅ Firebase Admin SDK initialized successfully
🚀 Server is running on port 5000
```

---

## 📱 Frontend Setup (React Native)

### Step 1: Firebase SDK Install

```bash
cd Farmaa
npm install @react-native-firebase/app @react-native-firebase/auth
```

### Step 2: Android Setup

1. Firebase Console > Project Settings > General
2. Android app check karein (ya add karein)
3. `google-services.json` download karein
4. `Farmaa/android/app/google-services.json` me copy karein

### Step 3: iOS Setup

1. Firebase Console > Project Settings > General  
2. iOS app check karein (ya add karein)
3. `GoogleService-Info.plist` download karein
4. `Farmaa/ios/GoogleService-Info.plist` me copy karein
5. Xcode me file add karein

### Step 4: Firebase Config File

Create: `Farmaa/src/config/firebase.config.js`

```javascript
// Firebase is auto-initialized with google-services.json / GoogleService-Info.plist
// No manual initialization needed for React Native
import auth from '@react-native-firebase/auth';

export { auth };
```

---

## 📧 Email OTP - Frontend Code

```javascript
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Send Email OTP Link
export const sendEmailOTP = async (email) => {
  try {
    const actionCodeSettings = {
      url: 'furrmaa://email-action', // Your app deep link
      handleCodeInApp: true,
      iOS: { bundleId: 'com.furrmaa.app' }, // Update bundle ID
      android: { 
        packageName: 'com.furrmaa', // Update package name
        installApp: true 
      },
    };
    
    await auth().sendSignInLinkToEmail(email, actionCodeSettings);
    await AsyncStorage.setItem('emailForSignIn', email);
    return { success: true, message: 'Email sent! Check your inbox.' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Verify Email Link
export const verifyEmailLink = async (email, link) => {
  try {
    const credential = await auth().signInWithEmailLink(email, link);
    const idToken = await credential.user.getIdToken();
    
    // Send to backend
    const response = await fetch('http://your-backend/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseToken: idToken })
    });
    
    return await response.json();
  } catch (error) {
    return { success: false, message: error.message };
  }
};
```

---

## 📱 Phone OTP - Frontend Code

```javascript
import auth from '@react-native-firebase/auth';

// Send Phone OTP
export const sendPhoneOTP = async (phoneNumber) => {
  try {
    // Format: +919876543210 (with country code)
    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+91${phoneNumber}`;
    
    const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
    return { 
      success: true, 
      confirmation,
      message: 'OTP sent to your phone!' 
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Verify Phone OTP
export const verifyPhoneOTP = async (confirmation, code) => {
  try {
    const credential = await confirmation.confirm(code);
    const idToken = await credential.user.getIdToken();
    
    // Send to backend
    const response = await fetch('http://your-backend/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseToken: idToken })
    });
    
    return await response.json();
  } catch (error) {
    return { success: false, message: 'Invalid OTP code' };
  }
};
```

---

## ✅ Testing

### Backend Test:

1. Server start karein
2. Check logs: `✅ Firebase Admin SDK initialized successfully`
3. Ready!

### Frontend Test:

1. Email OTP test karein
2. Phone OTP test karein
3. Backend login verify karein

---

## 🎯 Summary

- ✅ Backend: Firebase Admin SDK setup (service account key)
- ✅ Frontend: Firebase SDK install + config files
- ✅ Email OTP: Frontend implementation
- ✅ Phone OTP: Frontend implementation
- ✅ Backend: Already ready (login endpoint supports Firebase token)

**Setup karein, phir Firebase OTP kaam karega!** 🚀









