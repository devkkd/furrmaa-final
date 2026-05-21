# 🚀 Furmaa App - Run Commands

## 📱 App Run Karne Ke Liye Commands

### Step 1: Metro Bundler Start Karein (Terminal 1)

```bash
cd Farmaa
npm start
```

Ya

```bash
npm run start
```

### Step 2: Android Emulator/Device Par Run Karein (Terminal 2 - Naya Terminal)

```bash
cd Farmaa
npm run android
```

### Step 3: iOS Simulator Par Run Karein (Mac Only)

```bash
cd Farmaa
npm run ios
```

---

## 🔧 Complete Setup Commands

### Pehli Baar Setup (Agar Dependencies Install Nahi Hain)

```bash
cd Farmaa
npm install
```

### Android Ke Liye (Pehli Baar)

```bash
# Android Studio install karein
# Emulator setup karein
npm run android
```

### iOS Ke Liye (Mac Only)

```bash
cd ios
pod install
cd ..
npm run ios
```

---

## 🎯 Quick Start (2 Terminals)

### Terminal 1 - Metro Bundler:

```bash
cd G:\Aman\pets\Farmaa
npm start
```

### Terminal 2 - Run App:

```bash
cd G:\Aman\pets\Farmaa
npm run android
```

---

## ⚠️ Important Notes

1. **Metro Bundler pehle start karein** - `npm start`
2. **Phir naya terminal kholkar** - `npm run android`
3. **Physical device use kar rahe hain?** - USB debugging enable karein
4. **Emulator slow hai?** - Android Studio me emulator pehle se start karein

---

## 🐛 Agar Error Aaye

### Port Already in Use:

```bash
npx react-native start --reset-cache
```

### Clean Build:

```bash
# Android
cd android
./gradlew clean
cd ..
npm run android

# iOS (Mac)
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

---

## 📝 Backend Start Karein (Alag Terminal)

```bash
cd G:\Aman\pets\backend
npm run dev
```

Backend `http://localhost:5000` par chalega.
