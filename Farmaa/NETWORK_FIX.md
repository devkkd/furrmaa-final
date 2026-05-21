# Network Error Fix - Physical Device

## ✅ Fix Applied

API URL update kar diya hai physical device ke liye:

- **Your Computer IP:** `192.168.31.190`
- **API URL:** `http://192.168.31.190:5000/api`

## 🔧 Important Steps

### 1. Backend Server Start Karein

```bash
cd backend
npm run dev
```

Server `http://localhost:5000` par chalega.

### 2. Check Network Connection

- **Computer aur Phone same WiFi network par hone chahiye**
- Dono devices same router se connect hone chahiye

### 3. Firewall Check

Windows Firewall backend server ko block kar sakta hai:

- Windows Security → Firewall → Allow an app
- Node.js ko allow karein
- Ya temporarily firewall disable karein (development ke liye)

### 4. App Restart

```bash
# Metro bundler restart karein
cd Farmaa
npm start -- --reset-cache
```

### 5. Test Connection

Browser me ye URL open karein:

```
http://192.168.31.190:5000/api/health
```

Agar "OK" dikhe, to server accessible hai.

## 🐛 Agar Phir Bhi Error Aaye

### Check 1: Backend Running Hai?

```bash
# Backend folder me
npm run dev
```

### Check 2: IP Address Sahi Hai?

```bash
# Windows
ipconfig

# Look for IPv4 Address (Wireless LAN adapter)
```

### Check 3: Phone Same Network Par Hai?

- Phone WiFi settings check karein
- Computer aur phone same WiFi se connect hone chahiye

### Check 4: Firewall Blocking?

- Windows Firewall temporarily disable karein
- Ya Node.js ko allow karein

## 📱 Quick Test

1. Backend start: `cd backend && npm run dev`
2. Browser me test: `http://192.168.31.190:5000/api/health`
3. App restart: `npm start -- --reset-cache`
4. Login try karein

## ✅ Success Indicators

- Backend console me: `🚀 Server is running on port 5000`
- Browser me health check: `{"status":"OK","message":"Furmaa API is running"}`
- App me login successful



