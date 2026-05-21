# 🔥 Firebase API Error - Quick Fix

## ⚠️ Error: "Please provide a valid API"

Yeh error Firebase Phone Authentication me aata hai.

---

## ✅ Quick Fix (3 Steps)

### Step 1: Firebase Console Me Phone Authentication Enable Karein

1. **Firebase Console** me jao: https://console.firebase.google.com
2. Project select karein: **furmaa-app**
3. Left sidebar me **Authentication** click karein
4. **Sign-in method** tab me jao
5. **Phone** provider ko **Enable** karein
6. **Save** karein

### Step 2: Test Phone Numbers Add Karein

1. **Authentication** → **Sign-in method** → **Phone**
2. Scroll down karein → **Phone numbers for testing** section
3. **Add phone number** button click karein
4. Test numbers add karein (format important):

```
+91 9876543210
+91 9876543211
+91 9876543212
```

**Important:**
- Format: `+91` (country code) + space + `10 digits`
- Test numbers ko OTP automatically milta hai: `123456`
- Real SMS nahi jayega test numbers ko

### Step 3: App Rebuild Karein

```bash
cd Farmaa
cd android
./gradlew clean
cd ..
npm run android
```

---

## 🧪 Test Karein

1. App open karein
2. Phone number enter karein (jo Firebase me add kiya): `9876543210`
3. **Next** button click karein
4. OTP automatically `123456` aayega
5. OTP enter karein
6. Login ho jayega ✅

---

## 📝 Important Notes

### ✅ Test Numbers Ke Liye:
- **Billing NOT required** - Test numbers free hain
- OTP automatically `123456` aayega
- Real SMS nahi jayega

### ⚠️ Production Me Real SMS Ke Liye:
- Billing enable karni hogi
- Blaze plan (pay-as-you-go) select karein
- Real SMS charges apply honge

---

## 🐛 Agar Abhi Bhi Error Aaye

### Check Karein:
1. ✅ Firebase Console me Phone Authentication enabled hai?
2. ✅ Test numbers add kiye (format: `+91 9876543210`)?
3. ✅ Project ID correct hai: `furmaa-app`?
4. ✅ `google-services.json` file correct location me hai?

### Firebase Console Screenshots:
- Authentication → Sign-in method → Phone (enabled)
- Phone numbers for testing (test numbers added)

---

## 🎯 Quick Checklist

- [ ] Firebase Console me Phone Authentication enabled
- [ ] Test numbers added (format: `+91 9876543210`)
- [ ] App rebuild kiya (`./gradlew clean` + `npm run android`)
- [ ] Test number se login test kiya

---

**Test karein aur batao kya error aa raha hai!** 🚀








