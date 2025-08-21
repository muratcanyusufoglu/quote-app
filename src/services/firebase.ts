import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC9x5q3SCXYhjzXkhs-t4AkF_Gp7KFJjJQ",
  authDomain: "quote-spark-analytic.firebaseapp.com",
  projectId: "quote-spark-analytic",
  storageBucket: "quote-spark-analytic.firebasestorage.app",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
};

// Initialize Firebase app (prevent multiple initialization)
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
export const auth = getAuth(app);

export default app;
