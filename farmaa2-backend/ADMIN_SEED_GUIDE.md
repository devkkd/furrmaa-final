# Admin User Seed Karne Ka Complete Process

## 📋 Prerequisites (Pehle Ye Check Karo)

1. **MongoDB Running Hona Chahiye**

   - Local MongoDB: `mongodb://localhost:27017/furmaa`
   - Ya MongoDB Atlas connection string

2. **Backend Dependencies Installed**

   ```bash
   cd backend
   npm install
   ```

3. **.env File Setup**
   - `.env` file me MongoDB connection string hona chahiye

---

## 🚀 Method 1: Default Credentials Se Seed Karna (Easiest)

### Step 1: Backend Folder Me Jao

```bash
cd backend
```

### Step 2: Seed Script Run Karo

```bash
npm run seed:admin
```

### Step 3: Output Dekho

Agar sab sahi hai, to aisa output dikhega:

```
✅ MongoDB Connected: localhost:27017
✅ Admin user created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: admin@furmaa.com
📱 Phone: 9999999999
🔑 Password: admin123
👤 Role: admin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  Please change the password after first login!
```

### Default Credentials:

- **Email:** `admin@furmaa.com`
- **Mobile:** `9999999999`
- **Password:** `admin123`

---

## 🎯 Method 2: Custom Credentials Se Seed Karna

### Step 1: .env File Me Admin Credentials Add Karo

`.env` file me ye lines add karo (agar nahi hain to):

```env
# Admin Credentials
ADMIN_EMAIL=your-admin@email.com
ADMIN_PHONE=9876543210
ADMIN_PASSWORD=your-secure-password-123
ADMIN_NAME=Admin Name
```

**Example:**

```env
ADMIN_EMAIL=admin@mypetstore.com
ADMIN_PHONE=9876543210
ADMIN_PASSWORD=MySecurePass@2024
ADMIN_NAME=Pet Store Admin
```

### Step 2: Seed Script Run Karo

```bash
npm run seed:admin
```

### Step 3: Output Check Karo

Aapke custom credentials se admin create ho jayega.

---

## 🔍 Kaise Check Karein Ki Admin Seed Ho Gaya?

### Method 1: MongoDB Compass Se

1. MongoDB Compass open karo
2. `furmaa` database select karo
3. `users` collection me jao
4. Admin user ko dekho:
   - `role: "admin"`
   - Aapka email/phone
   - `isVerified: true`
   - `isActive: true`

### Method 2: Terminal Se Check Karo

```bash
# MongoDB shell me jao
mongosh

# Database select karo
use furmaa

# Admin user find karo
db.users.findOne({ role: "admin" })
```

---

## 📱 Mobile App Me Login Kaise Karein?

### Option 1: Email + Password Se Login

1. App open karo
2. "Login" screen me jao
3. Email: `admin@furmaa.com` (ya jo aapne set kiya)
4. Password: `admin123` (ya jo aapne set kiya)
5. Login button press karo

### Option 2: Mobile Number + OTP Se Login

1. App open karo
2. "Mobile Login" screen me jao
3. Mobile number: `9999999999` (ya jo aapne set kiya)
4. OTP receive karo
5. OTP enter karke verify karo

---

## 🎛️ Admin Panel Access Kaise Karein?

1. **Login Karo** (upar wale methods se)
2. **"More" Tab** me jao (bottom navigation me)
3. **"Admin Panel"** card dikhega (sirf admin users ko)
4. Click karo → Admin Dashboard open hoga

---

## ⚠️ Important Notes

### 1. Agar Admin Already Exists Hai

Agar aap dobara seed script run karte ho aur admin already hai, to:

```
✅ Admin user already exists:
   Email: admin@furmaa.com
   Phone: 9999999999
   Role: admin
```

Ye message dikhega aur koi naya admin create nahi hoga.

### 2. Password Security

- **First login ke baad password change karo!**
- Production me strong password use karo
- Default password (`admin123`) sirf development ke liye hai

### 3. Multiple Admins

Agar multiple admins chahiye:

- Seed script ko multiple times run karo with different emails/phones
- Ya directly MongoDB me create karo

---

## 🛠️ Troubleshooting

### Problem 1: MongoDB Connection Error

```
❌ Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**

- MongoDB service start karo
- `.env` file me correct `MONGODB_URI` check karo

### Problem 2: Module Not Found

```
Error: Cannot find module '../config/database.js'
```

**Solution:**

- `backend` folder me se script run karo
- `cd backend` karke phir `npm run seed:admin`

### Problem 3: Admin Panel Nahi Dikha

**Solution:**

- Logout karke phir se login karo
- Check karo ki `user.role === 'admin'` hai
- App restart karo

---

## 📝 Complete Example

```bash
# Step 1: Backend folder me jao
cd backend

# Step 2: .env file check karo (agar custom credentials chahiye)
# .env file me add karo:
# ADMIN_EMAIL=myadmin@test.com
# ADMIN_PHONE=9876543210
# ADMIN_PASSWORD=Test123!

# Step 3: Seed script run karo
npm run seed:admin

# Step 4: Output dekho
# ✅ Admin user created successfully!

# Step 5: Mobile app me login karo
# Email: myadmin@test.com
# Password: Test123!

# Step 6: Admin Panel access karo
# More Tab → Admin Panel
```

---

## ✅ Verification Checklist

- [ ] MongoDB running hai
- [ ] `.env` file me `MONGODB_URI` set hai
- [ ] Seed script successfully run hua
- [ ] Admin credentials console me dikhe
- [ ] Mobile app me login ho raha hai
- [ ] Admin Panel "More" tab me dikh raha hai
- [ ] Dashboard me stats dikh rahe hain

---

**🎉 Bas! Admin user seed ho gaya hai aur aap admin panel use kar sakte ho!**

