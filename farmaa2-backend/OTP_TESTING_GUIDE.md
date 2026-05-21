# 📧 Email & Phone OTP Testing Guide

## Overview

Backend ab **Email OTP** aur **Phone OTP** dono support karta hai. Ye guide testing ke liye hai.

---

## 🔧 Setup Requirements

### 1. Environment Variables

`.env` file me ye variables add karein:

```env
# Email Configuration (Email OTP ke liye)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Firebase Admin SDK (Optional - agar Firebase use kar rahe ho)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key

# Admin Configuration (Optional)
ADMIN_PHONE=8888888888
ADMIN_EMAIL=admin@furmaa.com
ADMIN_OTP=123456
```

### 2. Gmail App Password Setup

Email OTP ke liye Gmail App Password chahiye:

1. Google Account Settings > Security
2. 2-Step Verification enable karein (agar nahi hai)
3. App Passwords section me jayein
4. "Select app" me "Mail" choose karein
5. "Select device" me "Other" choose karein aur "Furmaa" type karein
6. Generate button click karein
7. Generated 16-character password ko `EMAIL_PASS` me dal dein

---

## 🧪 Testing Email OTP

### Step 1: Send OTP to Email

**Endpoint:** `POST /api/auth/send-otp`

**Request Body:**
```json
{
  "email": "test@example.com"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Response (Development):**
```json
{
  "success": true,
  "message": "OTP sent successfully to email",
  "otp": "123456"
}
```

**Response (Production):**
```json
{
  "success": true,
  "message": "OTP sent successfully to email"
}
```

### Step 2: Verify OTP

**Endpoint:** `POST /api/auth/verify-otp`

**Request Body:**
```json
{
  "email": "test@example.com",
  "otp": "123456",
  "name": "Test User"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456",
    "name": "Test User"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "_id": "507f1f77bcf86cd799439011",
    "name": "Test User",
    "email": "test@example.com",
    "phone": null,
    "role": "user",
    "isVerified": true,
    "firebaseUid": null
  }
}
```

---

## 📱 Testing Phone OTP

### Step 1: Send OTP to Phone

**Endpoint:** `POST /api/auth/send-otp`

**Request Body:**
```json
{
  "phone": "9876543210"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'
```

**Response (Development):**
```json
{
  "success": true,
  "message": "OTP sent successfully to mobile",
  "otp": "123456"
}
```

**Note:** Production me SMS service (Twilio, AWS SNS) integrate karna hoga.

### Step 2: Verify Phone OTP

**Endpoint:** `POST /api/auth/verify-otp`

**Request Body:**
```json
{
  "phone": "9876543210",
  "otp": "123456",
  "name": "Test User"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "otp": "123456",
    "name": "Test User"
  }'
```

---

## ✅ Test Scenarios

### 1. Valid Email OTP Flow
- ✅ Send OTP to valid email
- ✅ Check email inbox for OTP
- ✅ Verify OTP with correct code
- ✅ User should be created/logged in

### 2. Invalid OTP
- ✅ Send OTP
- ✅ Verify with wrong OTP
- ✅ Should return error: "Invalid OTP"

### 3. Expired OTP
- ✅ Send OTP
- ✅ Wait 5+ minutes
- ✅ Verify OTP
- ✅ Should return error: "OTP has expired"

### 4. Invalid Email
- ✅ Send OTP to invalid email format
- ✅ Should return error: "Please provide a valid email address"

### 5. Missing Fields
- ✅ Send request without email/phone
- ✅ Should return error: "Please provide either a phone number or email address"

### 6. Admin OTP
- ✅ Send OTP to admin email/phone (from .env)
- ✅ Should use seeded OTP (123456 by default)
- ✅ Valid for 24 hours

---

## 🔍 Debugging

### Email Not Sending?

1. **Check Email Configuration:**
   ```bash
   # Server logs me check karein
   ✅ Email service is ready
   # Ya
   ⚠️  Email service not available: ...
   ```

2. **Check Gmail App Password:**
   - App Password sahi hai?
   - 2-Step Verification enabled hai?

3. **Development Mode:**
   - Development mode me OTP console me print hota hai
   - Check server logs: `📧 OTP for email@example.com: 123456`

### OTP Not Working?

1. **Check Database:**
   ```javascript
   // MongoDB me check karein
   db.otps.find().sort({ createdAt: -1 }).limit(5)
   ```

2. **Check OTP Expiry:**
   - OTP 5 minutes ke liye valid hai
   - Check `expiresAt` field

3. **Check Verified Status:**
   - OTP ek baar verify hone ke baad `verified: true` ho jata hai
   - Same OTP dobara use nahi kar sakte

---

## 🚀 Production Checklist

- [ ] Email configuration properly set
- [ ] Gmail App Password configured
- [ ] Firebase Admin SDK configured (if using)
- [ ] Environment variables set (production)
- [ ] Email service tested
- [ ] OTP expiry time appropriate (5 minutes)
- [ ] Error handling tested
- [ ] Security: OTP not returned in production responses
- [ ] Rate limiting implemented (recommended)
- [ ] SMS service integrated for phone OTP (if needed)

---

## 📝 Notes

- **Development Mode:** OTP response me return hota hai (testing ke liye)
- **Production Mode:** OTP response me return nahi hota (security)
- **Email OTP:** Nodemailer use karke bheja jata hai
- **Phone OTP:** Abhi console me print hota hai (SMS service integrate karna hoga)
- **OTP Expiry:** 5 minutes (regular users), 24 hours (admin)
- **OTP Length:** 6 digits

---

## 🆘 Support

Agar koi issue aaye:
1. Server logs check karein
2. Database me OTP records check karein
3. Environment variables verify karein
4. Email service configuration test karein









