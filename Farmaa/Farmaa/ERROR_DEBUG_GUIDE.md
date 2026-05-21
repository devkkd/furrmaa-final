# 🔍 Error Debug Guide - Complete Fix

## ⚠️ Agar Abhi Bhi Error Aa Raha Hai:

### Step 1: Error Type Identify Karein

**Kaun sa error aa raha hai?**
1. ❌ Network Error (Backend connection failed)
2. ❌ Google Sign-in Error (DEVELOPER_ERROR)
3. ❌ OTP Test Number Error (Billing message)
4. ❌ Email OTP Error

---

## 🔧 Fix 1: Network Error (Backend Connection)

### Problem:
```
Network Error: {"readyState":4,"status":0}
Backend connection failed
```

### Solution:

**1. Backend Running Hai?**
```powershell
cd backend
npm start
```

**2. Backend URL Check Karein:**
- File: `Farmaa/src/config/api.js` (Line 23)
- Current: `http://192.168.31.190:5000/api`

**3. IP Address Update Karein (Agar Change Hua Hai):**
- Windows: `ipconfig` se new IP check karein
- `Farmaa/src/config/api.js` me update karein

**4. Network Error Handling:**
- ✅ Code me network error handling add ki hai
- ✅ Backend offline hone par Firebase auth se login ho jayega
- ✅ Error throw nahi hoga, Firebase auth use hoga

---

## 🔧 Fix 2: Google Sign-in Error (DEVELOPER_ERROR)

### Problem:
```
DEVELOPER_ERROR: Follow troubleshooting instructions
```

### Solution:

**1. Firebase Console se Web Client ID Copy Karein:**
- Firebase Console → Authentication → Sign-in method → Google
- **Web Client ID** copy karein (Web SDK configuration me)

**2. Code Me Update Karein:**
- File: `Farmaa/src/context/AuthContext.tsx` (Line 48)
- Current: `webClientId: '200582949604-xxxxx.apps.googleusercontent.com'`
- Update: `webClientId: 'YOUR_ACTUAL_WEB_CLIENT_ID_HERE'`

**3. App Rebuild Karein:**
```powershell
cd Farmaa
npx react-native run-android
```

---

## 🔧 Fix 3: OTP Test Number Error (Billing Message)

### Problem:
Test number add karne ke baad bhi billing ka message aa raha hai.

### Solution:

**1. Firebase Console Me Test Number Check Karein:**
- Phone: `+91 84292 05392` (with spaces)
- Code: `123456`

**2. App Me Exact Format Use Karein:**
- Phone: `+91 84292 05392` (exact format with spaces)
- OTP: `123456`

**3. Ya Phir New Test Number Add Karein:**
- Firebase Console: `+91 9876543210` (no spaces)
- App: `9876543210`
- OTP: `123456`

---

## 🔧 Fix 4: Email OTP Error

### Problem:
Email OTP se error aa raha hai.

### Solution:

**1. Firebase Console Me Email/Password Enabled Hai?**
- Authentication → Sign-in method → Email/Password
- Enable karein

**2. Deep Link Configured Hai?**
- ✅ AndroidManifest.xml me configured hai
- ✅ Deep link: `furmaa://email-action`

**3. Email Link Click Karein:**
- Email me link aayega
- Link click karein
- App open hoga

---

## 🧪 Complete Testing Steps:

### Test 1: Backend Connection
```powershell
# Backend start karein
cd backend
npm start

# Check karein ki backend running hai
# Browser me: http://192.168.31.190:5000/api/auth/me
```

### Test 2: OTP (Test Number)
1. Firebase Console me test number: `+91 84292 05392`, Code: `123456`
2. App me:
   - Phone: `+91 84292 05392` (exact format)
   - OTP: `123456`
   - Login ho jayega ✅

### Test 3: Google Sign-in
1. Firebase Console se Web Client ID copy karein
2. `AuthContext.tsx` me update karein (line 48)
3. App rebuild karein
4. Google button click karein
5. Login ho jayega ✅

### Test 4: Email OTP
1. App me: "Login with Email instead" click karein
2. Email enter karein
3. Email me link aayega
4. Link click karein
5. Login ho jayega ✅

---

## 📝 Important Notes:

### Backend Offline Mode:
- ✅ Agar backend offline hai, to Firebase auth se login ho jayega
- ✅ User data Firebase se save hoga
- ✅ Backend online hone par sync ho jayega

### Test Numbers:
- ✅ Billing NOT required
- ✅ OTP automatically `123456` aayega
- ✅ Format exactly match karega Firebase Console se

### Email OTP:
- ✅ Billing NOT required
- ✅ Free hai
- ✅ Email link click karein

---

## 🚀 Quick Fix Checklist:

- [ ] Backend running hai? (`cd backend && npm start`)
- [ ] Backend URL sahi hai? (`Farmaa/src/config/api.js`)
- [ ] Google Web Client ID update kiya? (`AuthContext.tsx` line 48)
- [ ] Test number format sahi hai? (`+91 84292 05392` with spaces)
- [ ] Email/Password enabled hai Firebase Console me?
- [ ] App rebuild kiya? (`npx react-native run-android`)

---

**Agar abhi bhi error aa raha hai, to exact error message share karein!** 🔍✅








