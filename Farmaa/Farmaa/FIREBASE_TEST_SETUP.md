# 🔥 Firebase Test Setup Guide

## ⚠️ Error: "Please provide a valid API"

Yeh error Firebase Phone Authentication me aata hai jab:
1. Firebase project me Phone Authentication enable nahi hai
2. Test phone numbers add nahi kiye gaye
3. Billing enable nahi hai (production me required)

---

## ✅ Firebase Console Setup Steps

### Step 1: Enable Phone Authentication

1. Firebase Console me jao: https://console.firebase.google.com
2. Apna project select karein: `furmaa-app`
3. Left sidebar me **Authentication** click karein
4. **Sign-in method** tab me jao
5. **Phone** provider ko enable karein
6. **Save** karein

### Step 2: Add Test Phone Numbers

1. **Authentication** → **Sign-in method** → **Phone**
2. **Phone numbers for testing** section me jao
3. **Add phone number** click karein
4. Test numbers add karein (example):
   - `+91 9876543210`
   - `+91 9876543211`
   - `+91 9876543212`

**Important:** 
- Format: `+91` (country code) + `10 digits`
- Test numbers ko OTP automatically milta hai: `123456`
- Real SMS nahi jayega test numbers ko

### Step 3: Enable Billing (Optional for Testing)

**Test numbers ke liye billing NOT required!**

Agar production me real SMS chahiye to:
1. Firebase Console → Project Settings → Usage and billing
2. Billing account add karein
3. Blaze plan select karein (pay-as-you-go)

**Note:** Test numbers ke liye billing ki zarurat nahi hai!

---

## 🧪 Test Number Format

### Correct Format:
```
+91 9876543210
+91 9876543211
```

### Wrong Format:
```
9876543210  (country code missing)
919876543210  (format wrong)
```

---

## 🔧 Code Me Test Number Check

### Current Implementation:
```typescript
// Farmaa/src/context/AuthContext.tsx
const sendOTPWithFirebase = async (phone: string) => {
  // Format phone number
  const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
  
  // Send OTP via Firebase
  const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
  // ...
};
```

### Test Number Validation:
Agar test number hai to Firebase automatically `123456` OTP dega.

---

## ✅ Quick Test Steps

### 1. Firebase Console Setup:
- [ ] Phone Authentication enabled
- [ ] Test numbers added (with +91 prefix)
- [ ] Project ID correct: `furmaa-app`

### 2. App Me Test:
1. App open karein
2. Phone number enter karein (test number jo Firebase me add kiya)
3. OTP automatically `123456` aayega
4. Enter karein
5. Login ho jayega

---

## 🐛 Common Errors & Solutions

### Error 1: "Please provide a valid API"
**Solution:**
- Firebase Console me Phone Authentication enable karein
- Test numbers add karein

### Error 2: "Invalid phone number format"
**Solution:**
- Phone number format: `+91 9876543210`
- Country code required

### Error 3: "Billing required"
**Solution:**
- Test numbers ke liye billing NOT required
- Agar real SMS chahiye to Blaze plan enable karein

### Error 4: "Phone number not verified"
**Solution:**
- Firebase Console me test number add karein
- Format correct karein: `+91 XXXXXXXXXX`

---

## 📱 Test Numbers Example

Firebase Console me add karein:
```
+91 9876543210
+91 9876543211
+91 9876543212
```

App me enter karein:
```
9876543210
9876543211
9876543212
```

Code automatically `+91` add kar dega.

---

## 🎯 Next Steps

1. **Firebase Console me test numbers add karein**
2. **App rebuild karein:**
   ```bash
   cd Farmaa
   npm run android
   ```
3. **Test karein:**
   - Test number enter karein
   - OTP `123456` aayega
   - Enter karein
   - Login ho jayega

---

## 📝 Firebase Console Checklist

- [ ] Phone Authentication enabled
- [ ] Test numbers added (with +91)
- [ ] Project ID: `furmaa-app`
- [ ] `google-services.json` file correct location me hai
- [ ] Package name: `com.furmaa` (Firebase Console me verify karein)

---

**Test karein aur batao kya error aa raha hai!** 🚀








