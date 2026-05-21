# 🔥 google-services.json Setup Guide

## ⚠️ Current Status

Aapki `google-services.json` file me **dummy/placeholder data** hai. Actual Firebase project se proper file download karni hogi.

---

## ✅ Step 1: Firebase Console Me Jayein

1. **Firebase Console:** https://console.firebase.google.com/project/furrmaa-45315

2. **Project Settings** (gear icon) click karein

3. **General tab** me jayein

4. **"Your apps" section** me jayein

---

## 📱 Step 2: Android App Add/Check Karein

### Option A: Agar Android App Already Hai

1. Android app ko select karein (ya "Add app" > Android)
2. **Package name verify karein:** `com.farmaa` (ya aapka actual package name)
3. **"google-services.json"** download button click karein

### Option B: Agar Android App Nahi Hai

1. **"Add app" button** click karein
2. **Android icon** select karein
3. **Android package name** enter karein: `com.farmaa`
   - Ya `Farmaa/android/app/build.gradle` file me check karein: `applicationId`
4. **App nickname** (optional): `Farmaa Android`
5. **Debug signing certificate SHA-1** (optional - baad me add kar sakte hain)
6. **"Register app"** click karein
7. **"Download google-services.json"** button click karein

---

## 📥 Step 3: File Download Karein

1. **google-services.json** file download hogi
2. File ko **replace karein** in `Farmaa/android/app/google-services.json`

---

## ✅ Step 4: File Verify Karein

Download kiye gaye file me ye check karein:

```json
{
  "project_info": {
    "project_number": "200582949604",  // Actual number (not 123456789)
    "project_id": "furrmaa-45315",      // Actual project ID (not farmaa-dev)
    "storage_bucket": "furrmaa-45315.appspot.com"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:200582949604:android:xxxxx",
        "android_client_info": {
          "package_name": "com.farmaa"  // Ya aapka package name
        }
      },
      "api_key": [
        {
          "current_key": "AIzaSy..."  // Actual API key (not dummy)
        }
      ]
    }
  ]
}
```

**Important:** 
- `project_id` = `furrmaa-45315` hona chahiye
- `project_number` = `200582949604` (actual number)
- `current_key` = Actual Firebase API key (not dummy)

---

## 🔧 Step 5: Android Build Verify Karein

`Farmaa/android/app/build.gradle` file me ye check karein:

```gradle
apply plugin: 'com.google.gms.google-services'
```

Agar nahi hai, to file ke end me add karein (just before closing brace).

---

## ✅ Step 6: Rebuild App

```bash
cd Farmaa
cd android
./gradlew clean
cd ..
npm run android
```

---

## 🎯 Next Steps (After google-services.json Setup)

### Backend Setup (Zaroori):

1. **Firebase Service Account Key Download:**
   - https://console.firebase.google.com/project/furrmaa-45315/settings/serviceaccounts/adminsdk
   - "Generate new private key" click karein
   - JSON file download karein

2. **Backend `.env` file me add karein:**
   ```env
   FIREBASE_PROJECT_ID=furrmaa-45315
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@furrmaa-45315.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
   ```

3. **Server restart:**
   ```bash
   cd backend
   npm run dev
   ```

---

## ✅ Complete Checklist

- [ ] Firebase Console me Android app add/check karein
- [ ] Actual `google-services.json` download karein
- [ ] File ko `Farmaa/android/app/google-services.json` me replace karein
- [ ] File verify karein (project_id = furrmaa-45315)
- [ ] Android build verify karein
- [ ] App rebuild karein
- [ ] Backend Service Account Key download karein
- [ ] Backend `.env` me Firebase credentials add karein
- [ ] Backend server restart karein

---

## 🎯 Final Answer

**Ab kya karein:**

1. ✅ **Firebase Console** me jayein (https://console.firebase.google.com/project/furrmaa-45315)
2. ✅ **Project Settings > General** me jayein
3. ✅ **Android app** add/check karein (package name: `com.farmaa`)
4. ✅ **google-services.json** download karein
5. ✅ **File replace** karein (`Farmaa/android/app/google-services.json`)
6. ✅ **Backend setup** karein (Service Account Key)

**Complete setup guide:** `backend/FIREBASE_COMPLETE_SETUP.md`

---

**Dummy file replace karein, phir Firebase OTP kaam karega!** 🚀









