# 🔐 Environment Variables Setup Guide

## 📝 .env File Setup

Backend folder me `.env` file create karein aur neeche diye gaye variables add karein.

---

## ✅ Required Variables (Zaroori)

### 1. **Server Configuration**

```env
PORT=5000
NODE_ENV=development
```

- `PORT`: Server ka port number (default: 5000)
- `NODE_ENV`: Environment type (development/production)

### 2. **MongoDB Configuration** ⚠️ ZAROORI

```env
# Local MongoDB (agar local install hai)
MONGODB_URI=mongodb://localhost:27017/furmaa

# Ya MongoDB Atlas (Cloud - Recommended)
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/furmaa
```

**MongoDB Atlas Setup:**

1. https://www.mongodb.com/cloud/atlas par account banayein
2. Free cluster create karein
3. Database Access me user create karein
4. Network Access me IP add karein (0.0.0.0/0 for all)
5. Connect button se connection string copy karein
6. Username aur password replace karein

### 3. **JWT Secret** ⚠️ ZAROORI

```env
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_EXPIRE=7d
```

- `JWT_SECRET`: Strong random string (minimum 32 characters)
- `JWT_EXPIRE`: Token expiration time (7d = 7 days)

**JWT Secret Generate Karne Ke Liye:**

```bash
# Terminal me run karein
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🔧 Optional Variables

### 4. **Email Configuration** (Email OTP ke liye zaroori)

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**Gmail App Password Setup:**

1. Google Account Settings > Security
2. 2-Step Verification enable karein (agar nahi hai)
3. App Passwords section me jayein
4. "Select app" me "Mail" choose karein
5. "Select device" me "Other" choose karein aur "Furmaa" type karein
6. Generate button click karein
7. Generated 16-character password ko `EMAIL_PASS` me dal dein

**Note:** Email OTP functionality ke liye ye configuration zaroori hai.

### 5. **Firebase Admin SDK Configuration** (Optional - Email OTP ke liye)

```env
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
```

Ya service account JSON file path:
```env
FIREBASE_SERVICE_ACCOUNT_PATH=./path/to/serviceAccountKey.json
```

**Firebase Setup:**
1. Firebase Console me project me jayein
2. Project Settings > Service Accounts
3. "Generate new private key" click karein
4. JSON file download karein ya environment variables me values dal dein

**Note:** `FIREBASE_PRIVATE_KEY` me `\n` ko `\\n` se replace karein.

### 5. **File Upload** (Optional)

```env
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

- `UPLOAD_PATH`: Uploaded files ka folder
- `MAX_FILE_SIZE`: Max file size in bytes (5MB = 5242880)

### 6. **Payment Gateway** (Optional)

```env
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

- Stripe account se keys lein (agar payment integration chahiye)

### 7. **Frontend URL** (CORS)

```env
FRONTEND_URL=http://localhost:3000
```

- React Native app ke liye mobile device IP use karein

---

## 🚀 Quick Setup

### Minimum Required Setup:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/furmaa
JWT_SECRET=change_this_to_a_strong_random_secret_key_min_32_chars
JWT_EXPIRE=7d
```

### Production Setup:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/furmaa
JWT_SECRET=very_strong_production_secret_key_use_crypto_random
JWT_EXPIRE=7d
FRONTEND_URL=https://your-production-domain.com
```

---

## ⚠️ Important Notes

1. **`.env` file ko git me commit mat karein** - Already `.gitignore` me hai
2. **Production me strong JWT_SECRET use karein**
3. **MongoDB Atlas me IP whitelist karein**
4. **Email password ko App Password use karein** (regular password nahi)

---

## 📱 React Native App Ke Liye

Agar physical device use kar rahe hain, to API URL me localhost ki jagah apna computer IP use karein:

```javascript
// src/config/api.js
const API_BASE_URL = __DEV__
  ? "http://192.168.1.100:5000/api" // Apna computer IP
  : "https://your-production-api.com/api";
```

**IP Address Kaise Pata Karein:**

- Windows: `ipconfig` command run karein
- Mac/Linux: `ifconfig` command run karein
- Look for IPv4 address (usually 192.168.x.x)

---

## ✅ Verification

`.env` file create karne ke baad:

```bash
cd backend
npm run dev
```

Agar sab sahi hai, to "✅ MongoDB Connected" message dikhega.
