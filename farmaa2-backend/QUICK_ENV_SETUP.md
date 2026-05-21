# 🚀 Quick .env Setup - Step by Step

## 📝 Step 1: File Create Karein

`backend` folder me `.env` naam ki file create karein (dot se start)

---

## ✅ Step 2: Minimum Required (Zaroori)

Ye 4 cheezein **ZAROORI** hain:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/furmaa
JWT_SECRET=change_this_to_random_32_char_string_12345678901234567890
JWT_EXPIRE=7d
```

---

## 📋 Detailed Explanation

### 1. PORT

```env
PORT=5000
```

- Server ka port number
- Default: 5000 (change kar sakte hain)

### 2. NODE_ENV

```env
NODE_ENV=development
```

- Development ke liye: `development`
- Production ke liye: `production`

### 3. MONGODB_URI (ZAROORI ⚠️)

**Option A: Local MongoDB** (agar local install hai)

```env
MONGODB_URI=mongodb://localhost:27017/furmaa
```

**Option B: MongoDB Atlas** (Cloud - Recommended)

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/furmaa
```

**MongoDB Atlas Setup:**

1. https://www.mongodb.com/cloud/atlas - Free account banayein
2. Free cluster create karein
3. "Connect" button click karein
4. Connection string copy karein
5. Username aur password replace karein

### 4. JWT_SECRET (ZAROORI ⚠️)

**Random Secret Generate Karein:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Ya manually 32+ characters ka string:

```env
JWT_SECRET=my_super_secret_key_12345678901234567890
JWT_EXPIRE=7d
```

---

## 🎯 Complete Example .env File

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB (Local)
MONGODB_URI=mongodb://localhost:27017/furmaa

# JWT Authentication
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_EXPIRE=7d
```

---

## ✅ Step 3: Test Karein

```bash
cd backend
npm run dev
```

Agar yeh message dikhe to sab sahi hai:

```
✅ MongoDB Connected: ...
🚀 Server is running on port 5000
```

---

## 🔧 Optional (Baad Me Add Kar Sakte Hain)

```env
# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload (Optional)
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

---

## ⚠️ Important

1. `.env` file ko **git me commit mat karein** (already .gitignore me hai)
2. **JWT_SECRET** ko strong random string banayein
3. **MongoDB** local ya Atlas - dono me se ek zaroor setup karein

---

## 🆘 Agar Error Aaye

**MongoDB Connection Error:**

- Local MongoDB: Service start karein
- Atlas: IP whitelist karein (0.0.0.0/0)

**Port Already in Use:**

- PORT=5001 ya koi aur port use karein
