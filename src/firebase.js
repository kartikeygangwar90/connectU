import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase App Check for abuse protection
// This helps protect your backend resources from abuse, such as billing fraud or phishing
// To set up App Check:
// 1. Go to Firebase Console > App Check
// 2. Register your app with reCAPTCHA v3 (get site key from Google reCAPTCHA admin console)
// 3. Add the site key to your .env file as VITE_RECAPTCHA_SITE_KEY
// 4. Enable App Check enforcement for Firestore, Auth, and Functions in Firebase Console
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

if (recaptchaSiteKey) {
  // Enable debug mode in development (allows localhost without real reCAPTCHA)
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-restricted-globals
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(recaptchaSiteKey),
    // Optional: Automatically refreshes App Check tokens when needed
    isTokenAutoRefreshEnabled: true
  });

} else {
  console.warn(
    "Firebase App Check not initialized: VITE_RECAPTCHA_SITE_KEY not found. " +
    "For production, please set up App Check to protect against abuse. " +
    "See: https://firebase.google.com/docs/app-check"
  );
}

// export auth
export const auth = getAuth(app);
// export fireStore
export const dataBase = getFirestore(app);
// export functions
export const functions = getFunctions(app);

// Firebase Cloud Messaging for push notifications
// Note: Messaging only works in browsers that support it
let messaging = null;
export const getMessagingInstance = async () => {
  if (messaging) return messaging;

  // Check browser support
  if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
    try {
      const { getMessaging: getMsg } = await import('firebase/messaging');
      messaging = getMsg(app);
      return messaging;
    } catch (error) {
      console.warn('Firebase Messaging not available:', error.message);
      return null;
    }
  }
  return null;
};

// export app for potential use in other modules
export default app;