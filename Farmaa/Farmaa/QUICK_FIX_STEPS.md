# 🚀 Quick Fix Steps - Network & Google Sign-in Errors

## ⚠️ Errors:
1. ❌ Network Error (Backend connection failed)
2. ❌ Google Sign-in Error (DEVELOPER_ERROR)

---

## 🔧 Fix 1: Network Error (Backend Connection)

### Step 1: Backend Start Karein

**Terminal me:**
```powershell
cd backend
npm start
```

**Agar backend start nahi ho raha:**
1. MongoDB running hai? (Local MongoDB ya Atlas)
2. `.env` file me `MONGODB_URI` sahi hai?
3. Port 5000 available hai?

**Backend successfully start hone par ye message aayega:**
```
✅ MongoDB Connected: ...
🚀 Server is running on port 5000
```

### Step 2: Backend URL Check Karein

**File:** `Farmaa/src/config/api.js` (Line 23)

**Current:**
```javascript
const DEV_PHYSICAL_DEVICE_API_URL = 'http://192.168.31.190:5000/api';
```

**Agar IP change hua hai:**
1. Windows: `ipconfig` se new IP check karein
2. `Farmaa/src/config/api.js` me update karein

### Step 3: Network Error Handling (Already Fixed ✅)

- ✅ Code me network error handling add ki hai
- ✅ Backend offline hone par Firebase auth se login ho jayega
- ✅ Error throw nahi hoga, Firebase auth use hoga

---

## 🔧 Fix 2: Google Sign-in Error (DEVELOPER_ERROR)

### Step 1: Firebase Console se Web Client ID Copy Karein

1. **Firebase Console me jao:**
   - https://console.firebase.google.com
   - Project select karein: `furrmaa-45315`

2. **Authentication → Sign-in method → Google:**
   - Google provider enabled hai? ✅
   - **Web SDK configuration** me **Web Client ID** copy karein
   - Format: `200582949604-xxxxxxxxxxxxx.apps.googleusercontent.com`

### Step 2: Code Me Update Karein

**File:** `Farmaa/src/context/AuthContext.tsx` (Line 48)

**Current:**
```typescript
webClientId: '200582949604-xxxxx.apps.googleusercontent.com',
```

**Update Karein:**
```typescript
webClientId: 'YOUR_ACTUAL_WEB_CLIENT_ID_HERE',
```

**Example:**
```typescript
webClientId: '200582949604-abc123def456ghi789jkl012mno345pq.apps.googleusercontent.com',
```

### Step 3: App Rebuild Karein

```powershell
cd Farmaa
npx react-native run-android
```

---

## 🧪 Testing Steps:

### Test 1: Backend Connection
```powershell
# Backend start karein
cd backend
npm start

# Check karein ki backend running hai
# Browser me: http://192.168.31.190:5000/api/auth/me
```

### Test 2: Google Sign-in
1. Firebase Console se Web Client ID copy karein
2. `AuthContext.tsx` me update karein (line 48)
3. App rebuild karein
4. Google button click karein
5. Login ho jayega ✅

---

## 📝 Important Notes:

### Backend Offline Mode:
- ✅ Agar backend offline hai, to Firebase auth se login ho jayega
- ✅ User data Firebase se save hoga
- ✅ Backend online hone par sync ho jayega

### Google Sign-in:
- ✅ Web Client ID Firebase Console se copy karein
- ✅ Code me update karein
- ✅ App rebuild karein

---

## 🚀 Quick Fix Checklist:

- [ ] Backend start kiya? (`cd backend && npm start`)
- [ ] Backend URL sahi hai? (`Farmaa/src/config/api.js`)
- [ ] Google Web Client ID copy kiya? (Firebase Console)
- [ ] Google Web Client ID update kiya? (`AuthContext.tsx` line 48)
- [ ] App rebuild kiya? (`npx react-native run-android`)

---

**Donon errors fix ho jayenge!** ✅🚀








