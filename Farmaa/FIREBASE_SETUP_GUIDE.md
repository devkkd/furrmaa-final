# 🔥 Firebase Complete Setup Guide - Step by Step

## 📋 Prerequisites

1. Firebase project already created: `furrmaa-45315`
2. Firebase config already provided
3. React Native app ready

## 🔥 Step 1: Firebase Console Setup

### 1.1 Authentication Enable Karein

1. [Firebase Console](https://console.firebase.google.com/) me jayein
2. Project select karein: `furrmaa-45315`
3. Left sidebar me **Authentication** click karein
4. **Get Started** click karein
5. **Sign-in method** tab me jayein

### 1.2 Sign-in Methods Enable Karein

**Email/Password:**

1. **Email/Password** provider click karein
2. **Enable** toggle ON karein
3. **Save** click karein

**Phone:**

1. **Phone** provider click karein
2. **Enable** toggle ON karein
3. **Save** click karein

**Google:**

1. **Google** provider click karein
2. **Enable** toggle ON karein
3. **Project support email** select karein
4. **Save** click karein

**Apple (iOS only):**

1. **Apple** provider click karein
2. **Enable** toggle ON karein
3. **Save** click karein

## 📱 Step 2: Android Setup

### 2.1 Download google-services.json

1. Firebase Console > Project Settings (⚙️ icon)
2. **Your apps** section me **Android** app select karein (ya add karein)
3. Package name: `com.furmaa` (ya apna package name)
4. **google-services.json** file download karein

### 2.2 Add google-services.json

1. Download ki hui file ko `Farmaa/android/app/` folder me copy karein
2. File name exactly `google-services.json` honi chahiye

### 2.3 Update android/build.gradle

`Farmaa/android/build.gradle` file me check karein:

```gradle
buildscript {
    dependencies {
        // ... existing code ...
        classpath 'com.google.gms:google-services:4.4.0'  // Add this line
    }
}
```

### 2.4 Update android/app/build.gradle

`Farmaa/android/app/build.gradle` file ke end me add karein:

```gradle
apply plugin: 'com.google.gms.google-services'
```

### 2.5 Google Sign-In Setup (Android)

1. Firebase Console > Project Settings > Your apps > Android
2. **SHA-1 certificate fingerprint** add karein:

**Debug ke liye:**

```bash
cd Farmaa/android
./gradlew signingReport
```

SHA-1 fingerprint copy karke Firebase Console me add karein.

**Production ke liye:**
Production keystore ka SHA-1 bhi add karna hoga.

## 🍎 Step 3: iOS Setup

### 3.1 Download GoogleService-Info.plist

1. Firebase Console > Project Settings (⚙️ icon)
2. **Your apps** section me **iOS** app select karein (ya add karein)
3. Bundle ID enter karein (e.g., `com.furmaa`)
4. **GoogleService-Info.plist** file download karein

### 3.2 Add GoogleService-Info.plist

1. Download ki hui file ko `Farmaa/ios/` folder me copy karein
2. Xcode me project open karein
3. File ko Xcode project me drag & drop karein
4. **Copy items if needed** check karein
5. **Add to targets** me app select karein

### 3.3 Update Podfile

`Farmaa/ios/Podfile` me check karein ki Firebase pods hain:

```ruby
pod 'Firebase/Auth'
pod 'GoogleSignIn'
```

### 3.4 Install Pods

```bash
cd Farmaa/ios
pod install
cd ..
```

### 3.5 Apple Sign-In Setup (iOS)

1. Xcode me project open karein
2. **Signing & Capabilities** tab me jayein
3. **+ Capability** click karein
4. **Sign in with Apple** select karein
5. Firebase Console me Apple provider enable karein (Step 1.2 me)

## 🔑 Step 4: Google Sign-In Configuration

### 4.1 Get Web Client ID

1. Firebase Console > Project Settings > Your apps > Web app
2. **Web Client ID** copy karein (format: `xxxxx.apps.googleusercontent.com`)

### 4.2 Update AuthContext.tsx

`Farmaa/src/context/AuthContext.tsx` me line 33 pe:

```typescript
GoogleSignin.configure({
  webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com", // Firebase Web Client ID yahan add karein
  offlineAccess: true,
});
```

**Note:** Web Client ID Firebase Console se copy karein.

## 📝 Step 5: Environment Variables (Optional)

Production me Firebase config environment variables me store karein:

### 5.1 Create .env file

`Farmaa/.env` file create karein:

```env
FIREBASE_WEB_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

### 5.2 Install react-native-config

```bash
cd Farmaa
npm install react-native-config
```

## ✅ Step 6: Testing

### 6.1 Test Firebase OTP

1. Mobile app start karein
2. Mobile login screen me jayein
3. "Using Firebase OTP" toggle ON karein
4. Phone number enter karein
5. OTP receive karein (SMS me)
6. OTP verify karein

### 6.2 Test Google Sign-In

1. Mobile login screen me jayein
2. **Google** button click karein
3. Google account select karein
4. Login successful hona chahiye

### 6.3 Test Apple Sign-In (iOS only)

1. iOS device/simulator me app run karein
2. Mobile login screen me jayein
3. **Apple** button click karein
4. Apple ID se sign in karein
5. Login successful hona chahiye

## 🐛 Troubleshooting

### OTP Not Sending

1. Firebase Console me Phone Authentication enable hai ya nahi check karein
2. `google-services.json` (Android) ya `GoogleService-Info.plist` (iOS) sahi jagah hai ya nahi
3. Firebase project me billing enable hai ya nahi (Phone auth ke liye required)

### Google Sign-In Not Working

1. SHA-1 fingerprint Firebase Console me add hai ya nahi check karein
2. Web Client ID sahi hai ya nahi check karein
3. Google Sign-In provider Firebase Console me enable hai ya nahi

### Apple Sign-In Not Working (iOS)

1. Xcode me "Sign in with Apple" capability add hai ya nahi
2. Apple provider Firebase Console me enable hai ya nahi
3. iOS device me Apple ID logged in hai ya nahi

### Build Errors

1. **Android:**

   ```bash
   cd Farmaa/android
   ./gradlew clean
   cd ..
   npm run android
   ```

2. **iOS:**
   ```bash
   cd Farmaa/ios
   pod deintegrate
   pod install
   cd ..
   npm run ios
   ```

## 📋 Checklist

- [ ] Firebase Authentication enabled
- [ ] Email/Password provider enabled
- [ ] Phone provider enabled
- [ ] Google provider enabled
- [ ] Apple provider enabled (iOS)
- [ ] google-services.json added (Android)
- [ ] GoogleService-Info.plist added (iOS)
- [ ] SHA-1 fingerprint added (Android)
- [ ] Web Client ID configured
- [ ] Pods installed (iOS)
- [ ] OTP working
- [ ] Google Sign-In working
- [ ] Apple Sign-In working (iOS)

## 🎯 Important Notes

1. **OTP SMS Cost**: Firebase Phone Authentication free tier me limited hai. Production me SMS charges lagenge.

2. **Google Sign-In**: Free hai, unlimited use kar sakte hain.

3. **Apple Sign-In**: Free hai, iOS devices par available hai.

4. **Billing**: Phone Authentication ke liye Firebase billing enable karna padega (free tier me limited SMS).

## 📞 Support

Agar koi issue aaye:

1. Firebase Console me errors check karein
2. Console logs check karein
3. Build logs check karein
4. Firebase documentation: https://firebase.google.com/docs

---

**Status**: ✅ Setup Complete
**Next**: Test all authentication methods


