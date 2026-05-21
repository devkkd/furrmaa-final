# Production Setup Guide - Furmaa

Yeh guide aapko production-ready setup ke liye step-by-step instructions deti hai.

## 📋 Prerequisites

1. Node.js (>=20)
2. MongoDB (local ya Atlas)
3. Firebase Account
4. React Native development environment

## 🔥 Step 1: Firebase Setup

### 1.1 Firebase Project Create Karein

1. [Firebase Console](https://console.firebase.google.com/) me jayein
2. "Add project" click karein
3. Project name enter karein (e.g., "Furmaa")
4. Google Analytics enable/disable karein (optional)
5. Project create karein

### 1.2 Android Setup

1. Firebase Console me "Add app" > Android select karein
2. Package name enter karein: `com.furmaa` (ya apna package name)
3. `google-services.json` file download karein
4. File ko `Farmaa/android/app/` folder me copy karein

### 1.3 iOS Setup

1. Firebase Console me "Add app" > iOS select karein
2. Bundle ID enter karein
3. `GoogleService-Info.plist` file download karein
4. File ko `Farmaa/ios/` folder me copy karein

### 1.4 Firebase Authentication Enable Karein

1. Firebase Console > Authentication > Get Started
2. Sign-in methods enable karein:
   - **Email/Password**: Enable
   - **Phone**: Enable (OTP ke liye)

### 1.5 Firebase Config Update Karein

`Farmaa/src/config/firebase.ts` file me apne Firebase credentials add karein:

```typescript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  appId: "YOUR_APP_ID",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
};
```

## 🗄️ Step 2: Database Setup

### 2.1 MongoDB Setup

1. Local MongoDB install karein ya MongoDB Atlas account banayein
2. Connection string note karein

### 2.2 Backend Environment Variables

`backend/.env` file create/update karein:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/furmaa
# Ya MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/furmaa

JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRE=7d
NODE_ENV=production

# Admin Setup
ADMIN_PHONE=8888888888
ADMIN_OTP=123456
```

### 2.3 Products Seed Karein

Database me products add karne ke liye:

```bash
cd backend
npm run seed:products
```

Yeh command 15+ products database me add karega.

## 🚀 Step 3: Backend Setup

### 3.1 Dependencies Install Karein

```bash
cd backend
npm install
```

### 3.2 Admin User Create Karein

```bash
# Admin user create karein
npm run seed:admin

# Ya existing user ko admin banayein
npm run make:admin
```

### 3.3 Server Start Karein

```bash
# Development
npm run dev

# Production
npm start
```

Backend `http://localhost:5000` par run hoga.

## 📱 Step 4: Mobile App Setup

### 4.1 Dependencies Install Karein

```bash
cd Farmaa
npm install
```

### 4.2 iOS Pods Install (Mac only)

```bash
cd ios
pod install
cd ..
```

### 4.3 API Configuration

`Farmaa/src/config/api.js` me production API URL update karein:

```javascript
// Production
return "https://your-production-api.com/api";
```

### 4.4 Firebase Native Setup

Android ke liye `google-services.json` already add kar diya hai.
iOS ke liye `GoogleService-Info.plist` already add kar diya hai.

## 🎯 Step 5: Testing

### 5.1 Backend Test

```bash
# Health check
curl http://localhost:5000/api/health

# Products check
curl http://localhost:5000/api/products
```

### 5.2 Mobile App Test

1. Metro bundler start karein:

   ```bash
   cd Farmaa
   npm start
   ```

2. Android me run karein:

   ```bash
   npm run android
   ```

3. iOS me run karein (Mac only):
   ```bash
   npm run ios
   ```

### 5.3 Login Test

**Backend Auth:**

- Email/Password login test karein
- OTP login test karein

**Firebase Auth:**

- Login screen me "Using Firebase Auth" toggle karein
- Email/Password login test karein
- Mobile login screen me "Using Firebase OTP" toggle karein
- OTP verification test karein

## 🔧 Step 6: Admin Panel

### 6.1 Admin Login

1. Admin phone number se OTP login karein (default: 8888888888, OTP: 123456)
2. Ya admin email/password se login karein

### 6.2 Products Manage Karein

1. Profile screen se Admin Dashboard open karein
2. Products section me:
   - List: All products dekh sakte hain
   - Add: New product add kar sakte hain
   - Update: Existing product update kar sakte hain
   - Delete: Product delete kar sakte hain

### 6.3 Orders Manage Karein

Admin Dashboard > Orders:

- All orders dekh sakte hain
- Order status update kar sakte hain
- Order details dekh sakte hain

## 📊 Step 7: Dynamic Data Verification

### 7.1 Products Check

1. Home screen par featured products database se aane chahiye
2. Products screen par all products database se aane chahiye
3. Product details screen par real data show hona chahiye

### 7.2 Admin Panel Check

1. Admin panel se product add karein
2. Mobile app me immediately dikhna chahiye
3. Product update karein - changes immediately reflect hone chahiye

## 🐛 Troubleshooting

### Firebase Issues

1. **Firebase not initialized**: Check `google-services.json` (Android) aur `GoogleService-Info.plist` (iOS) files
2. **OTP not sending**: Firebase Console me Phone Authentication enable karein
3. **Email login fails**: Firebase Console me Email/Password authentication enable karein

### Database Issues

1. **Connection failed**: MongoDB connection string check karein
2. **Products not showing**: `npm run seed:products` run karein
3. **Admin access denied**: `npm run make:admin` run karein

### API Issues

1. **Network error**: Backend server running hai ya nahi check karein
2. **CORS error**: Backend `server.js` me CORS settings check karein
3. **401 Unauthorized**: Token valid hai ya nahi check karein

## 📝 Production Checklist

- [ ] Firebase project setup complete
- [ ] Firebase authentication enabled (Email/Password + Phone)
- [ ] MongoDB connection working
- [ ] Products seeded in database
- [ ] Admin user created
- [ ] Backend API running
- [ ] Mobile app connecting to backend
- [ ] Firebase auth working (Email + OTP)
- [ ] Admin panel accessible
- [ ] Products dynamically loading
- [ ] Admin can add/update/delete products
- [ ] Changes reflect immediately in app

## 🎉 Success!

Agar sab kuch sahi se setup ho gaya hai, to:

1. ✅ Firebase authentication kaam kar raha hai
2. ✅ Products database se load ho rahe hain
3. ✅ Admin panel se sab kuch manage kar sakte hain
4. ✅ Sab kuch dynamic hai - dummy data nahi hai

## 📞 Support

Agar koi issue aaye to:

1. Console logs check karein
2. Backend logs check karein
3. Firebase Console me errors check karein
4. MongoDB connection verify karein

---

**Note**: Production me Firebase credentials environment variables me store karein, hardcode nahi karein.


