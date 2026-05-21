# 🔥 Firebase Test Numbers Setup - Step by Step

## ⚠️ Error Abhi Bhi Aa Raha Hai?

Agar Phone Authentication enabled hai phir bhi error aa raha hai, to ye steps follow karein:

---

## ✅ Step 1: Test Phone Numbers Add Karein

### Firebase Console Me:

1. **Authentication** → **Sign-in method** → **Phone** me jao
2. Scroll down karein
3. **"Phone numbers for testing"** section me jao
4. **"Add phone number"** button click karein
5. Test numbers add karein:

```
+91 9876543210
+91 9876543211
+91 9876543212
```

**Important Format:**
- `+91` (country code) + space + `10 digits`
- Example: `+91 9876543210`

6. **Save** karein

### Test Numbers Ka OTP:
- Test numbers ko OTP automatically `123456` aayega
- Real SMS nahi jayega

---

## ✅ Step 2: SHA Certificate Fingerprint Add Karein (Android)

### Firebase Console Me:

1. **Project Settings** → **Your apps** → Android app select karein
2. **SHA certificate fingerprints** section me jao
3. **"Add fingerprint"** button click karein

### SHA Fingerprint Get Karein:

**Windows (PowerShell):**
```powershell
cd Farmaa/android/app
keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Mac/Linux:**
```bash
cd Farmaa/android/app
keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Output me "SHA1" copy karein aur Firebase Console me add karein**

---

## ✅ Step 3: SMS Quota Issue

Screenshot me dikha raha hai:
> "To prevent abuse, new projects currently have a sent SMS daily quota of 10/day"

### Solutions:

**Option A: Test Numbers Use Karein (Recommended)**
- Test numbers add karein (Step 1)
- Test numbers ko OTP automatically `123456` aayega
- Billing NOT required for test numbers
- Daily quota issue nahi aayega

**Option B: Billing Enable Karein (Production)**
- Firebase Console → Usage and billing
- Billing account add karein
- Blaze plan select karein
- Real SMS unlimited (charges apply)

---

## 🧪 Test Karein

### Test Number Se Login:

1. App open karein
2. Test number enter karein (jo Firebase me add kiya): `9876543210`
3. **Next** button click karein
4. OTP automatically `123456` aayega
5. OTP enter karein
6. Login ho jayega ✅

---

## 🐛 Common Errors & Fixes

### Error 1: "Please provide a valid API"
**Fix:**
- Test numbers add karein Firebase Console me
- SHA fingerprint add karein
- App rebuild karein

### Error 2: "Invalid phone number"
**Fix:**
- Phone number format check karein: `+91 9876543210`
- Test numbers me same format use karein

### Error 3: "SMS quota exceeded"
**Fix:**
- Test numbers use karein (unlimited, no quota)
- Ya billing enable karein

---

## 📝 Quick Checklist

- [ ] Test numbers added in Firebase Console (format: `+91 9876543210`)
- [ ] SHA certificate fingerprint added
- [ ] App rebuild kiya (`./gradlew clean` + `npm run android`)
- [ ] Test number se login test kiya

---

## 🎯 Next Steps

1. **Firebase Console me test numbers add karein**
2. **SHA fingerprint add karein**
3. **App rebuild karein**
4. **Test karein**

---

**Test numbers add karein aur batao kya error aa raha hai!** 🚀








