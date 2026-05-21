# 🔧 Registration & Login Troubleshooting

## ✅ Integration Status

**Base URL:** Ek jagah configure hai - `src/config/api.js`
**API Client:** Centralized axios instance - `api.CLIENT`
**Auth Context:** Properly integrated with API client

---

## 🐛 Common Errors & Solutions

### 1. "Network Error" / "Connection Refused"

**Problem:** Backend reachable nahi hai

**Solutions:**

```bash
# Backend check karein
cd backend
npm run dev
# Should show: ✅ MongoDB Connected & 🚀 Server is running on port 5000
```

**Physical Device Use Kar Rahe Hain?**

- `src/config/api.js` me IP address update karein
- Line 14: `return 'http://YOUR_IP:5000/api';`
- IP address: `ipconfig` (Windows) ya `ifconfig` (Mac/Linux)

**Emulator Use Kar Rahe Hain?**

- `localhost:5000` kaam karega
- Metro bundler running hai?

---

### 2. "Registration Failed" / "Login Failed"

**Check Karne Ki Baatein:**

1. **Backend Running Hai?**

   ```bash
   cd backend
   npm run dev
   ```

2. **MongoDB Connected Hai?**

   - `.env` file me `MONGODB_URI` sahi hai?
   - MongoDB service running hai?

3. **Console Logs Check Karein:**

   - React Native debugger me console dekhein
   - `🔐 Attempting login` message dikhna chahiye
   - `✅ Login response` message dikhna chahiye

4. **Backend Logs Check Karein:**
   - Backend terminal me request dikhni chahiye
   - Error messages check karein

---

### 3. "Invalid credentials"

**Possible Causes:**

- Email/password sahi nahi hai
- User already exists (registration me)
- Password hash issue

**Fix:**

- Email format check karein
- Password minimum 6 characters
- Registration me unique email use karein

---

### 4. "User already exists"

**Problem:** Same email se pehle register ho chuka hai

**Fix:**

- Different email use karein
- Ya backend me user delete karein

---

## 🔍 Debug Steps

### Step 1: Backend Test

```bash
# Postman/Thunder Client me test karein
POST http://localhost:5000/api/auth/register
Body: {
  "name": "Test User",
  "email": "test@test.com",
  "password": "123456"
}
```

### Step 2: Frontend Console

- React Native Debugger open karein
- Console me logs check karein
- Network requests dekhein

### Step 3: Network Check

```javascript
// src/config/api.js me console.log add karein
console.log('API Base URL:', API_BASE_URL);
```

---

## ✅ Verification Checklist

- [ ] Backend running on port 5000
- [ ] MongoDB connected
- [ ] `.env` file properly configured
- [ ] Base URL sahi hai (check `src/config/api.js`)
- [ ] Network connectivity (same Wi-Fi)
- [ ] CORS configured (backend me `cors()` middleware)
- [ ] Console logs check kiye

---

## 🚀 Quick Fix

1. **Backend Restart:**

   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend Restart:**

   ```bash
   cd Farmaa
   npm start --reset-cache
   npm run android
   ```

3. **Clear App Data:**
   - Emulator me app uninstall karein
   - Phir reinstall karein

---

## 📱 Testing

### Test Registration:

```
Email: test@test.com
Password: 123456
Name: Test User
```

### Test Login:

```
Email: test@test.com
Password: 123456
```

---

## 💡 Tips

1. **Console logs enable karein** - Debugging ke liye helpful
2. **Network tab check karein** - Request/Response dekhein
3. **Backend logs dekhein** - Server side errors check karein
4. **Physical device?** - IP address zaroor update karein

---

Agar abhi bhi issue ho, to exact error message share karein! 🐛
