# Native Module Setup - react-native-image-picker

## ✅ Permissions Added

### Android Permissions (AndroidManifest.xml):
- ✅ `CAMERA` - For taking photos
- ✅ `READ_EXTERNAL_STORAGE` - For reading images
- ✅ `WRITE_EXTERNAL_STORAGE` - For saving images
- ✅ `READ_MEDIA_IMAGES` - For Android 13+ image access
- ✅ `READ_MEDIA_VIDEO` - For Android 13+ video access

### iOS Permissions (Info.plist):
- ✅ `NSCameraUsageDescription` - Camera access
- ✅ `NSPhotoLibraryUsageDescription` - Photo library access
- ✅ `NSPhotoLibraryAddUsageDescription` - Save to photo library

---

## 🔧 Setup Steps

### 1. Clean Build (Important!)

**Android:**
```bash
cd Farmaa/android
./gradlew clean
cd ..
```

**iOS:**
```bash
cd Farmaa/ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### 2. Rebuild the App

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

### 3. Restart Metro Bundler

Stop Metro bundler (Ctrl+C) and restart with cache clear:
```bash
npx react-native start --reset-cache
```

---

## ⚠️ Important Notes

1. **Auto-linking**: React Native 0.82.1 supports auto-linking, so no manual linking needed
2. **Rebuild Required**: After adding native modules, you MUST rebuild the app (not just reload)
3. **Permissions**: Permissions are now added, but users will be prompted at runtime

---

## 🧪 Testing

After rebuilding:
1. Open admin panel
2. Try uploading an image/video
3. Permissions prompt should appear
4. Select image/video from gallery or camera
5. Upload should work

---

**Status**: ✅ Permissions added. Now rebuild the app to complete setup.





