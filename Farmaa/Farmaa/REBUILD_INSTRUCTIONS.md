# Rebuild Instructions - Fix Native Module Error

## ✅ What Was Fixed:

1. ✅ Added Android permissions to `AndroidManifest.xml`
2. ✅ Added iOS permissions to `Info.plist`
3. ✅ Package installed: `react-native-image-picker@^7.1.2`

---

## 🔧 Steps to Fix the Error:

### Step 1: Clean Build Folders

**For Android:**
```bash
cd Farmaa/android
./gradlew clean
cd ../..
```

**For iOS (if using iOS):**
```bash
cd Farmaa/ios
rm -rf Pods Podfile.lock
pod install
cd ../..
```

### Step 2: Clear Metro Cache

Stop Metro bundler (if running) and clear cache:
```bash
cd Farmaa
npx react-native start --reset-cache
```

### Step 3: Rebuild the App

**Android:**
```bash
cd Farmaa
npx react-native run-android
```

**iOS:**
```bash
cd Farmaa
npx react-native run-ios
```

---

## ⚠️ Important:

1. **Must Rebuild**: Native modules require a full rebuild, not just a reload
2. **Auto-linking**: React Native 0.82.1 auto-links, so no manual linking needed
3. **Permissions**: Permissions are added, users will be prompted at runtime

---

## 🧪 After Rebuild:

1. Open admin panel
2. Try uploading image/video
3. Permission prompt should appear
4. Select from gallery or camera
5. Upload should work with Cloudinary

---

**Note**: If error persists after rebuild, try:
```bash
cd Farmaa
rm -rf node_modules
npm install
npx react-native start --reset-cache
```

Then rebuild the app again.
