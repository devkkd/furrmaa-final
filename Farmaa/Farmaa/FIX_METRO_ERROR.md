# 🔧 Metro Bundler Error Fix

## ❌ Error: "Unable to load script"

Ye error Metro bundler connection issue hai. Neeche diye gaye steps follow karein:

---

## ✅ Solution 1: Metro Bundler Restart (Recommended)

### Step 1: Sab kuch stop karein

- Metro bundler stop karein (Ctrl+C)
- Emulator close karein

### Step 2: Clean Start

```bash
cd Farmaa

# Cache clear karein
npx react-native start --reset-cache
```

### Step 3: Naya Terminal - App Run Karein

```bash
cd Farmaa
npm run android
```

---

## ✅ Solution 2: ADB Reverse (Physical Device)

Agar physical device use kar rahe hain:

```bash
adb reverse tcp:8081 tcp:8081
```

Phir app restart karein.

---

## ✅ Solution 3: Complete Clean

```bash
cd Farmaa

# Metro cache clear
npx react-native start --reset-cache

# Android clean build
cd android
./gradlew clean
cd ..

# Node modules (agar zarurat ho)
rm -rf node_modules
npm install

# Phir run
npm run android
```

---

## ✅ Solution 4: Metro Port Check

Agar port 8081 busy hai:

```bash
# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8081 | xargs kill -9
```

Phir Metro restart karein.

---

## ✅ Solution 5: Emulator Network Settings

1. Emulator Settings > Network
2. Wi-Fi enable karein
3. Same network par ensure karein (computer aur emulator)

---

## 🎯 Quick Fix (Most Common)

```bash
# Terminal 1
cd Farmaa
npx react-native start --reset-cache

# Terminal 2 (Naya terminal)
cd Farmaa
npm run android
```

---

## ⚠️ Important Notes

1. **Metro bundler pehle start karein** - `npm start` ya `npx react-native start`
2. **Phir app run karein** - `npm run android`
3. **Physical device?** - `adb reverse tcp:8081 tcp:8081` run karein
4. **Same Wi-Fi network** - Computer aur device same network par hona chahiye

---

## 🔍 Debug Steps

1. Metro bundler running hai? - Browser me `http://localhost:8081` check karein
2. Port 8081 free hai? - `netstat` se check karein
3. Emulator network connected hai? - Settings me check karein

---

## ✅ Success Indicators

Agar sab sahi hai, to:

- Metro bundler me "Loading..." dikhega
- Emulator me app load hogi
- Koi red error nahi dikhega
