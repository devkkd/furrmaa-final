import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Initialize Firebase Admin SDK
let firebaseAdmin;

function initFromCert(certInput, projectId) {
  if (admin.apps.length > 0) {
    return admin.app();
  }
  return admin.initializeApp({
    credential: admin.credential.cert(certInput),
    ...(projectId ? { projectId } : {}),
  });
}

try {
  // Check if Firebase credentials are provided
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    // Skip if using placeholder values
    if (process.env.FIREBASE_PROJECT_ID === 'your-project-id' ||
        (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PRIVATE_KEY.includes('Your-Private-Key-Here'))) {
      console.log('ℹ️  Firebase Admin SDK not configured (using placeholder values)');
      console.log('ℹ️  Web Firebase Phone login → verify token fail hoga jab tak .env bharo');
    } else {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };

      firebaseAdmin = initFromCert(serviceAccount, process.env.FIREBASE_PROJECT_ID);
      console.log('✅ Firebase Admin SDK initialized successfully');
    }
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const jsonPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH.trim());
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const serviceAccount = JSON.parse(raw);
    firebaseAdmin = initFromCert(serviceAccount, serviceAccount.project_id);
    console.log('✅ Firebase Admin SDK initialized from JSON file');
  } else {
    console.log('ℹ️  Firebase Admin SDK not configured');
    console.log('ℹ️  Copy .env.example → .env aur FIREBASE_* bharo (web Phone login ke liye)');
  }
} catch (error) {
  console.error('❌ Firebase Admin SDK initialization error:', error.message);
  console.warn('⚠️  Firebase web login token verify nahi chalega bina Admin credentials ke');
}

export default firebaseAdmin;
export { admin };

