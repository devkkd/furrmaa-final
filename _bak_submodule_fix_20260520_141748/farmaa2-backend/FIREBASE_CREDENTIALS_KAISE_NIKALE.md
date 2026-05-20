# Firebase Project ID, Client Email, Private Key – Kaha Se Nikale

Backend `.env` mein `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` daalne ke liye ye values **Firebase Service Account** se aati hain.

---

## Step 1: Firebase Console kholo

1. Browser mein jao: **https://console.firebase.google.com**
2. Apna **project** select karo (jo project mein Auth enable hai – Phone, Google, Apple).

---

## Step 2: Project Settings → Service accounts

1. Left side **gear icon** (⚙️) pe click karo → **Project settings**
2. Upar wale tabs mein **"Service accounts"** pe click karo
3. Neeche **"Firebase Admin SDK"** section dikhega

---

## Step 3: Service account key (JSON) download karo

1. **"Generate new private key"** button pe click karo (ya "Keys" tab se new key generate karo)
2. Pop-up aayega → **"Generate key"** confirm karo
3. Ek **JSON file** download hogi (name jaisa: `your-project-id-firebase-adminsdk-xxxxx-xxxxxxxxxx.json`)

---

## Step 4: JSON file kholo – ye 3 values copy karo

JSON file kuch aisi hogi:

```json
{
  "type": "service_account",
  "project_id": "furrmaa-45315",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@furrmaa-45315.iam.gserviceaccount.com",
  "client_id": "...",
  ...
}
```

**Yahan se ye 3 cheezein nikalo:**

| .env variable           | JSON mein kya copy karna hai |
|-------------------------|-------------------------------|
| **FIREBASE_PROJECT_ID**  | `"project_id"` ki value (e.g. `furrmaa-45315`) |
| **FIREBASE_CLIENT_EMAIL** | `"client_email"` ki value (e.g. `firebase-adminsdk-xxxxx@furrmaa-45315.iam.gserviceaccount.com`) |
| **FIREBASE_PRIVATE_KEY**  | `"private_key"` ki **puri** value (from `-----BEGIN PRIVATE KEY-----` to `-----END PRIVATE KEY-----`) |

---

## Step 5: Backend `.env` mein daalo

`furmma-backend/.env` file kholo aur aise bharo:

```env
FIREBASE_PROJECT_ID=furrmaa-45315
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@furrmaa-45315.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
```

**Important:**

- **FIREBASE_PRIVATE_KEY** ko **double quotes** `"..."` ke andar rakhna
- JSON mein jo **newline** hai (`\n`) woh as-is rehna chahiye – matlab key ke andar jahan line break hai wahan `\n` likhna (ek backslash + n)
- Puri key ek line mein rahegi, har line break ki jagah `\n`

Agar key copy karte waqt line breaks aa gaye (multiple lines), to sab ko hata ke ek hi line banao aur line breaks ki jagah `\n` daal do.

---

## Step 6: Server restart

```bash
cd furmma-backend
npm start
```

Console mein dikhna chahiye: **"✅ Firebase Admin SDK initialized successfully"**

---

## Short recap – kaha se kya nikala

| Value | Kaha se |
|-------|--------|
| **Project ID** | Firebase Console → Project settings → Service accounts → Downloaded JSON → `project_id` |
| **Client Email** | Same JSON → `client_email` |
| **Private Key** | Same JSON → `private_key` (puri value, quotes ke andar, `\n` for newlines) |

**File:** Service accounts page → **"Generate new private key"** → jo JSON download hoti hai usi se ye 3 values aati hain.
