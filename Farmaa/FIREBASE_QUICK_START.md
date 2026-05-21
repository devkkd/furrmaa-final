# 🔥 Firebase Quick Start - OTP, Google & Apple Sign-In

## ✅ Kya Kya Ho Gaya

1. ✅ Firebase config update ho gaya
2. ✅ Google Sign-In packages install ho gaye
3. ✅ Apple Sign-In packages install ho gaye
4. ✅ AuthContext me Google & Apple Sign-In methods add ho gaye
5. ✅ MobileLoginScreen me Google & Apple buttons working

## 📋 Ab Aapko Kya Karna Hai

### Step 1: Firebase Console Setup (5 minutes)

1. **Firebase Console** me jayein: https://console.firebase.google.com/
2. Project select karein: **furrmaa-45315**
3. **Authentication** > **Get Started**
4. **Sign-in method** tab me jayein

**Enable Karein:**

- ✅ **Email/Password** - Enable
- ✅ **Phone** - Enable (OTP ke liye)
- ✅ **Google** - Enable
- ✅ **Apple** - Enable (iOS ke liye)

### Step 2: Android Setup (10 minutes)

#### 2.1 Download google-services.json

1. Firebase Console > **Project Settings** (⚙️ icon)
2. **Your apps** section me **Android** app add karein (agar nahi hai)
3. Package name: `com.furmaa` (ya apna package name)
4. **google-services.json** download karein
5. File ko `Farmaa/android/app/` folder me copy karein

#### 2.2 SHA-1 Fingerprint Add Karein

```bash
cd Farmaa/android
./gradlew signingReport
```

SHA-1 fingerprint copy karke Firebase Console > Project Settings > Your apps > Android > SHA certificate fingerprints me add karein.

#### 2.3 Google Sign-In Web Client ID

1. Firebase Console > Project Settings > **Your apps** > **Web app**
2. **Web Client ID** copy karein (format: `xxxxx.apps.googleusercontent.com`)
3. `Farmaa/src/context/AuthContext.tsx` me line 33 pe update karein:

```typescript
GoogleSignin.configure({
  webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com", // Yahan paste karein
  offlineAccess: true,
});
```

### Step 3: iOS Setup (10 minutes)

#### 3.1 Download GoogleService-Info.plist

1. Firebase Console > **Project Settings** (⚙️ icon)
2. **Your apps** section me **iOS** app add karein (agar nahi hai)
3. Bundle ID enter karein
4. **GoogleService-Info.plist** download karein
5. File ko `Farmaa/ios/` folder me copy karein

#### 3.2 Xcode Setup

1. Xcode me project open karein: `Farmaa/ios/Farmaa.xcworkspace`
2. **GoogleService-Info.plist** file ko Xcode project me drag & drop karein
3. **Signing & Capabilities** tab me jayein
4. **+ Capability** click karein
5. **Sign in with Apple** select karein

#### 3.3 Pods Install

```bash
cd Farmaa/ios
pod install
cd ..
```

### Step 4: Build & Test

#### Android

```bash
cd Farmaa
npm run android
```

#### iOS

```bash
cd Farmaa
npm run ios
```

## 🎯 Testing

### Test OTP (Firebase)

1. App start karein
2. Mobile login screen me jayein
3. **"Using Firebase OTP"** toggle ON karein
4. Phone number enter karein (with country code: +91)
5. OTP SMS me aayega
6. OTP verify karein

### Test Google Sign-In

1. Mobile login screen me jayein
2. **Google** button click karein
3. Google account select karein
4. Login successful!

### Test Apple Sign-In (iOS only)

1. iOS device/simulator me app run karein
2. Mobile login screen me jayein
3. **Apple** button click karein
4. Apple ID se sign in karein
5. Login successful!

## ⚠️ Important Notes

### OTP SMS Cost

- **Free Tier**: Firebase free tier me limited SMS (10 SMS/day)
- **Production**: Billing enable karna padega
- **Cost**: ~₹0.50-1 per SMS (India)

### Google Sign-In

- ✅ **Free**: Unlimited use
- ✅ **No Cost**: Koi charges nahi

### Apple Sign-In

- ✅ **Free**: Unlimited use
- ✅ **iOS Only**: Sirf iOS devices par available

## 🐛 Common Issues

### OTP Not Sending

1. Firebase Console me Phone Authentication enable hai ya nahi
2. Billing enable hai ya nahi (production ke liye)
3. `google-services.json` sahi jagah hai ya nahi

### Google Sign-In Error

1. SHA-1 fingerprint Firebase Console me add hai ya nahi
2. Web Client ID sahi hai ya nahi
3. Google provider enable hai ya nahi

### Build Errors

**Android:**

```bash
cd Farmaa/android
./gradlew clean
cd ..
npm run android
```

**iOS:**

```bash
cd Farmaa/ios
pod deintegrate
pod install
cd ..
npm run ios
```

## 📝 Checklist

- [ ] Firebase Authentication enabled
- [ ] Email/Password enabled
- [ ] Phone enabled
- [ ] Google enabled
- [ ] Apple enabled (iOS)
- [ ] google-services.json added (Android)
- [ ] GoogleService-Info.plist added (iOS)
- [ ] SHA-1 fingerprint added (Android)
- [ ] Web Client ID configured
- [ ] Pods installed (iOS)
- [ ] OTP tested
- [ ] Google Sign-In tested
- [ ] Apple Sign-In tested (iOS)

## 🎉 Success!

Agar sab kuch sahi se setup ho gaya hai:

1. ✅ OTP SMS me aayega
2. ✅ Google Sign-In kaam karega
3. ✅ Apple Sign-In kaam karega (iOS)
4. ✅ Sab kuch Firebase se sync hoga
5. ✅ Backend me user create/update hoga

---

**Detailed Guide**: `FIREBASE_SETUP_GUIDE.md` me dekhein
**Status**: ✅ Code Complete - Ab Setup Karein!


