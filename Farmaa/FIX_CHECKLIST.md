# Fix Checklist – Admin, Products, Training

## 1. Admin login (404 "Admin not found")

**Reason:** DB mein koi user `role: 'admin'` nahi hai.

**Fix:** 9999999999 wale user ko admin banao:

```bash
cd backend
node scripts/setAdminByPhone.js
```

(.env mein `ADMIN_PHONE=9999999999` hona chahiye – already hai.)

Phir app mein "Admin Login" / dev-login dobara try karo.

---

## 2. Products nahi aa rahe

**Check:**

- **Backend chal raha hai?** Terminal mein `🚀 Server is running on port 5000` dikhna chahiye.
- **Phone aur laptop same WiFi pe?** App `http://10.101.188.7:5000/api` use karti hai. Agar IP badla (naya WiFi) to `Farmaa/src/config/api.js` mein `DEV_PHYSICAL_DEVICE_API_URL` apna current IP do (CMD: `ipconfig` → IPv4).
- **DB mein products?** Agar products collection khali hai to list empty dikhegi. Seed chalao: `node scripts/seedProducts.js` (agar script hai).

---

## 3. Training nahi aa raha

**Check:**

- Same as above – **backend + same WiFi + correct IP** in `api.js`.
- **Training videos DB mein?** Agar `trainingvideos` collection empty hai to kuch nahi dikhega. Admin panel se add karo ya seed.

---

## 4. Kya change hua (functionality)

- **Login:** Ab sirf **backend OTP** (Mongo), Firebase OTP hata diya. 9999999999 + OTP 787878 se login.
- **Logout:** Logout pe ab **Mobile Login** screen pe redirect.
- **Admin dev-login:** Route `admin.routes.js` mein add kiya (POST `/api/admin/dev-login`). Sirf tab kaam karega jab koi user DB mein `role: 'admin'` ho.
- **Web /account:** Backend OTP + /account pe user data (name, email, phone) show.

Products aur Training ke **API routes change nahi kiye**. Agar pehle chal rahe the to ab bhi same URLs hain. Problem usually:

- backend band,
- galat IP in app,
- ya DB mein data nahi.

---

## Quick steps (ek saath)

1. `cd backend` → `node scripts/setAdminByPhone.js` (admin fix)
2. Backend: `npm start` (chal raha ho to skip)
3. Phone aur laptop **same WiFi**, `ipconfig` se IP check karke `Farmaa/src/config/api.js` mein wahi IP set karo
4. Phir app mein: Login (9999999999 + 787878) → Products / Training check → Admin Login try karo
