# 🚀 Next Steps - Production Setup Guide

## 📋 Step-by-Step Checklist

### Step 1: Environment Variables Setup ✅

`.env` file me ye configurations add karein:

```env
# Server Configuration
PORT=5000
NODE_ENV=production  # Ya development

# MongoDB Configuration (ZAROORI)
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/furmaa

# JWT Configuration (ZAROORI)
JWT_SECRET=your_very_strong_secret_key_min_32_characters
JWT_EXPIRE=7d

# Email Configuration (Email OTP ke liye ZAROORI)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Firebase Admin SDK (Optional - agar Firebase use kar rahe ho)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key

# Frontend URL (Production me zaroori)
FRONTEND_URL=https://your-production-domain.com

# Admin Configuration (Optional)
ADMIN_PHONE=8888888888
ADMIN_EMAIL=admin@furmaa.com
ADMIN_OTP=123456
```

---

## 📧 Step 2: Gmail App Password Setup

Email OTP ke liye Gmail App Password chahiye:

1. **Google Account Settings me jayein:**
   - https://myaccount.google.com/security
   - Ya Google Account > Security

2. **2-Step Verification enable karein** (agar nahi hai):
   - Security section me "2-Step Verification" click karein
   - Setup karein (phone number verify karein)

3. **App Password generate karein:**
   - Security page me "App passwords" section me jayein
   - "Select app" me "Mail" choose karein
   - "Select device" me "Other" choose karein
   - "Furmaa" type karein
   - "Generate" button click karein
   - 16-character password copy karein
   - Is password ko `.env` file me `EMAIL_PASS` me dal dein

**Important:** Regular Gmail password kaam nahi karega, App Password hi use karein!

---

## 🔥 Step 3: Firebase Setup (Optional)

Agar Firebase Admin SDK use karna hai:

1. **Firebase Console me jayein:**
   - https://console.firebase.google.com
   - Project select karein ya naya project banayein

2. **Service Account Key generate karein:**
   - Project Settings > Service Accounts tab
   - "Generate new private key" button click karein
   - JSON file download hogi

3. **Environment Variables me dal dein:**
   - Option A: JSON file se values extract karein aur environment variables me dal dein
   - Option B: `FIREBASE_SERVICE_ACCOUNT_PATH` me file path dal dein

**Note:** `FIREBASE_PRIVATE_KEY` me `\n` characters ko `\\n` se replace karein.

---

## 🗄️ Step 4: MongoDB Setup

### Option A: MongoDB Atlas (Recommended for Production)

1. **Account banayein:**
   - https://www.mongodb.com/cloud/atlas
   - Free account create karein

2. **Cluster create karein:**
   - "Build a Database" click karein
   - Free tier (M0) choose karein
   - Region select karein
   - Cluster name choose karein

3. **Database User create karein:**
   - Database Access > Add New Database User
   - Username aur password set karein
   - Database User Privileges: "Atlas admin" ya "Read and write to any database"

4. **Network Access configure karein:**
   - Network Access > Add IP Address
   - Production ke liye: "Allow Access from Anywhere" (0.0.0.0/0)
   - Ya specific IP addresses add karein

5. **Connection String copy karein:**
   - "Connect" button click karein
   - "Connect your application" choose karein
   - Connection string copy karein
   - Username aur password replace karein
   - `.env` file me `MONGODB_URI` me dal dein

### Option B: Local MongoDB

```env
MONGODB_URI=mongodb://localhost:27017/furmaa
```

---

## 🧪 Step 5: Testing

### 5.1 Dependencies Install Karein

```bash
cd backend
npm install
```

### 5.2 Server Start Karein

```bash
# Development mode
npm run dev

# Production mode
npm start
```

**Expected Output:**
```
✅ MongoDB Connected: ...
✅ Email service is ready
✅ Firebase Admin SDK ready (agar configured hai)
🚀 Server is running on port 5000
```

### 5.3 Health Check

Browser ya Postman me:
```
GET http://localhost:5000/api/health
```

Expected Response:
```json
{
  "status": "OK",
  "message": "Furmaa API is running"
}
```

### 5.4 Email OTP Test Karein

**Send OTP:**
```bash
POST http://localhost:5000/api/auth/send-otp
Content-Type: application/json

{
  "email": "your-test-email@gmail.com"
}
```

**Expected Response (Development):**
```json
{
  "success": true,
  "message": "OTP sent successfully to email",
  "otp": "123456"
}
```

**Verify OTP:**
```bash
POST http://localhost:5000/api/auth/verify-otp
Content-Type: application/json

{
  "email": "your-test-email@gmail.com",
  "otp": "123456",
  "name": "Test User"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "your-test-email@gmail.com",
    "role": "user",
    "isVerified": true
  }
}
```

---

## 🚀 Step 6: Production Deployment

### 6.1 Production Environment Variables

`.env` file me production values set karein:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...  # Production MongoDB
JWT_SECRET=very_strong_production_secret  # Strong secret key
FRONTEND_URL=https://your-production-domain.com
```

### 6.2 Security Checklist

- [ ] `JWT_SECRET` strong aur random hai (minimum 32 characters)
- [ ] `NODE_ENV=production` set kiya hai
- [ ] `FRONTEND_URL` production domain set kiya hai
- [ ] MongoDB Atlas me IP whitelist kiya hai
- [ ] Email credentials secure hain
- [ ] `.env` file git me commit nahi hui
- [ ] Firebase credentials secure hain (agar use kar rahe ho)

### 6.3 Server Start (Production)

```bash
# PM2 use karein (recommended)
npm install -g pm2
pm2 start server.js --name furmaa-backend

# Ya simple start
npm start
```

### 6.4 Monitoring

- [ ] Server logs check karein
- [ ] Email service working hai
- [ ] Database connection stable hai
- [ ] API endpoints respond kar rahe hain

---

## 📝 Step 7: Additional Setup (Optional)

### 7.1 Admin User Create Karein

```bash
npm run make:admin
```

Ya manually:
```bash
npm run seed:admin
```

### 7.2 Products Seed Karein

```bash
npm run seed:products
```

### 7.3 Admin OTP Seed Karein

```bash
npm run seed:otp
```

---

## 🆘 Troubleshooting

### Email Not Sending?

1. **Gmail App Password check karein:**
   - App Password sahi hai?
   - 2-Step Verification enabled hai?

2. **Email Configuration check karein:**
   - `.env` file me values sahi hain?
   - Server logs me error dikh raha hai?

3. **Development Mode:**
   - Development mode me OTP console me print hota hai
   - Email inbox check karein

### MongoDB Connection Error?

1. **Connection String check karein:**
   - Username/password sahi hain?
   - Cluster URL sahi hai?

2. **Network Access:**
   - IP whitelist me hai?
   - Production me 0.0.0.0/0 allowed hai?

3. **Database User:**
   - Database user permissions sahi hain?

### Firebase Not Working?

1. **Credentials check karein:**
   - `FIREBASE_PRIVATE_KEY` me `\n` ko `\\n` se replace kiya hai?

2. **Service Account:**
   - Service account key valid hai?
   - Project ID sahi hai?

---

## ✅ Final Checklist

- [ ] `.env` file configured hai
- [ ] Gmail App Password setup kiya hai
- [ ] MongoDB Atlas configured hai
- [ ] Server start ho raha hai
- [ ] Health check successful hai
- [ ] Email OTP sending working hai
- [ ] Email OTP verification working hai
- [ ] Production environment variables set hain
- [ ] Security measures implemented hain
- [ ] Documentation read kar li hai

---

## 📚 Additional Resources

- `OTP_TESTING_GUIDE.md` - Detailed testing guide
- `ENV_SETUP_GUIDE.md` - Environment setup details
- `README.md` - API documentation
- `QUICK_ENV_SETUP.md` - Quick setup guide

---

## 🎯 Priority Order

1. **First:** MongoDB setup (zaroori)
2. **Second:** JWT_SECRET generate karein (zaroori)
3. **Third:** Email configuration (Email OTP ke liye zaroori)
4. **Fourth:** Firebase setup (optional)
5. **Fifth:** Testing
6. **Sixth:** Production deployment

---

**Agar koi issue aaye, to server logs check karein aur troubleshooting section dekhain!** 🚀









