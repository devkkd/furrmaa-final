# 🔌 API Integration Guide

## ✅ Base URL Configuration

Base URL ek jagah configure hai: `src/config/api.js`

### Emulator Ke Liye:

```javascript
return 'http://localhost:5000/api';
```

### Physical Device Ke Liye:

```javascript
// Apna computer IP address use karein
return 'http://192.168.1.100:5000/api';
```

**IP Address Kaise Pata Karein:**

- Windows: `ipconfig` command run karein
- Mac/Linux: `ifconfig` command run karein
- IPv4 address copy karein (usually 192.168.x.x)

---

## 🔧 API Client Setup

Sab API calls `api.CLIENT` se honge:

- Automatic base URL
- Automatic error handling
- Token management

**Example:**

```javascript
import api from '../config/api';

// GET request
const response = await api.CLIENT.get(api.ENDPOINTS.PRODUCTS);

// POST request
const response = await api.CLIENT.post(api.ENDPOINTS.AUTH.LOGIN, {
  email,
  password,
});
```

---

## ✅ Registration & Login Integration

### Backend Response Format:

```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@email.com",
    "role": "user"
  }
}
```

### Frontend Usage:

```javascript
import { useAuth } from '../context/AuthContext';

const { login, register } = useAuth();

// Login
await login(email, password);

// Register
await register(name, email, password, phone);
```

---

## 🐛 Common Issues & Fixes

### 1. Network Error / Connection Refused

**Problem:** Backend reachable nahi hai

**Fix:**

- Backend running hai? `npm run dev` in backend folder
- Physical device? IP address sahi hai?
- Same Wi-Fi network?

### 2. CORS Error

**Problem:** Backend CORS allow nahi kar raha

**Fix:**

- Backend me `cors()` middleware check karein
- Frontend URL whitelist karein

### 3. 401 Unauthorized

**Problem:** Token invalid ya missing

**Fix:**

- Token properly save ho raha hai?
- AsyncStorage me token check karein
- Token expiry check karein

### 4. 400 Bad Request

**Problem:** Request data invalid

**Fix:**

- Required fields fill karein
- Email format sahi hai?
- Password minimum length?

---

## 📱 Testing

### 1. Backend Test:

```bash
cd backend
npm run dev
# Should show: ✅ MongoDB Connected
```

### 2. Frontend Test:

```bash
cd Farmaa
npm start
npm run android
```

### 3. API Test (Postman/Thunder Client):

```
POST http://localhost:5000/api/auth/register
Body: {
  "name": "Test User",
  "email": "test@test.com",
  "password": "123456"
}
```

---

## ✅ Verification Checklist

- [ ] Backend running on port 5000
- [ ] MongoDB connected
- [ ] .env file properly configured
- [ ] Base URL sahi hai (emulator/device)
- [ ] Network connectivity
- [ ] CORS configured
- [ ] Token properly stored

---

## 🚀 Next Steps

1. All API calls use `api.CLIENT`
2. Error handling properly implemented
3. Token automatically added to requests
4. Base URL centralized in one place
