# Company Firebase Account – Key / Credentials Kaise Le

Company project (`furrmaa-65dc3`) ke liye Firebase Admin key chahiye. Do tarike se kar sakte ho.

---

## Tarika 1: Khud Google Cloud Console se try karo (pehle ye karo)

Firebase Console pe "key creation not allowed" aata hai, lekin Google Cloud Console pe sometimes kaam ho jata hai.

### Step 1: Cloud Console kholo

1. Browser: **https://console.cloud.google.com**
2. Upar project selector pe click karo → **furrmaa-65dc3** (ya jo Firebase project hai) select karo.

### Step 2: Service Accounts pe jao

1. Left side **☰ (menu)** → **IAM & Admin** → **Service accounts**.
2. List mein **Firebase** wala account dikhega, email jaisa:
   `firebase-adminsdk-fbsvc@furrmaa-65dc3.iam.gserviceaccount.com`
3. Us **email** pe click karo (pura row click kar sakte ho).

### Step 3: Key banayo

1. **Keys** tab pe jao.
2. **Add Key** → **Create new key**.
3. **Key type:** **JSON** select karo → **Create**.
4. Agar key ban gayi to JSON file download ho jayegi. **Tarika 2** skip karo, neeche "JSON se .env kaise bhare" follow karo.
5. Agar yahan bhi error aaye: *"Key creation is not allowed"* / *"restricted by organisation policies"* → **Tarika 2** (admin se baat) karo.

---

## Tarika 2: Admin se key / policy mangna

Agar Tarika 1 pe key nahi banti, to company admin ko ye kuch karwana hoga.

### Option A: Admin khud key bana ke de (sabse simple)

Admin ko bolo:

- **Kya karna hai:** Firebase Admin SDK ke liye **service account key (JSON)** chahiye.
- **Kahan se:** Google Cloud Console → Project: **furrmaa-65dc3** → **IAM & Admin** → **Service accounts** → `firebase-adminsdk-fbsvc@furrmaa-65dc3.iam.gserviceaccount.com` → **Keys** → **Add Key** → **Create new key** → **JSON**.
- **Tumhe kya chahiye:** Woh JSON file **secure tarike se** bheje (e.g. encrypted zip, secure chat). Tum us JSON se sirf 3 cheezein backend ke liye use karoge (project_id, client_email, private_key).

Tum us JSON se values nikal ke `.env` mein daalna (neeche steps).

### Option B: Admin policy change kare (key creation allow)

Agar company policy allow kare to tum khud Firebase/Cloud Console se key bana paoge.

Admin ko bolo:

- **Kya change karna hai:** "Service account key creation" **allow** karni hai is project / organization ke liye.
- **Kahan:** Google Cloud Console → **IAM & Admin** → **Organization policies** (ya **Settings**).  
  Policy name jaisa: **"Disable service account key creation"** — ise **allow** / **off** karna hai (screenshot bhej sakte ho).
- **Kyun:** Backend (Node.js) mein Firebase Auth verify karne ke liye service account key zaroori hai.

Policy on hone ke baad tum **Tarika 1** dobara try karo.

---

## JSON milne ke baad: .env kaise bhare

Jab bhi tumhe **service account JSON** file mile (khud banao ya admin se):

### 1. JSON file kholo

Andar aisi cheezein hoti hain:

- `project_id`
- `client_email`
- `private_key`

### 2. Backend `.env` mein daalo

`furmma-backend/.env` file kholo. Ye lines add/update karo (values JSON se copy karo):

```env
FIREBASE_PROJECT_ID=furrmaa-65dc3
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@furrmaa-65dc3.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQ...(puri key)...\n-----END PRIVATE KEY-----\n"
```

**Private key tips:**

- `FIREBASE_PRIVATE_KEY` ko **double quotes** `"..."` ke andar rakhna.
- JSON mein key multiple lines mein hoti hai; `.env` mein ek line karo, line breaks ki jagah **`\n`** likhna (backslash + n).
- Puri key daalna hai: `-----BEGIN PRIVATE KEY-----` se `-----END PRIVATE KEY-----` tak.

### 3. Server restart

```bash
cd furmma-backend
npm start
```

Console mein aana chahiye: **✅ Firebase Admin SDK initialized successfully**

---

## Short checklist

| Step | Kya karna hai |
|------|----------------|
| 1 | **https://console.cloud.google.com** → project **furrmaa-65dc3** → IAM & Admin → Service accounts |
| 2 | `firebase-adminsdk-fbsvc@...` pe click → **Keys** → **Add Key** → **Create new key** → **JSON** |
| 3 | Agar key download ho → us JSON se `project_id`, `client_email`, `private_key` → `.env` mein daalo |
| 4 | Agar "not allowed" aaye → Admin se key bana ke mang lo (Option A) ya policy allow karwao (Option B) |

Isse company account se hi Firebase backend credentials set ho jayenge.
