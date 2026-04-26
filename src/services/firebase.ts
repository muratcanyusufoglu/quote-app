import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC9x5q3SCXYhjzXkhs-t4AkF_Gp7KFJjJQ",
  authDomain: "quote-spark-analytic.firebaseapp.com",
  projectId: "quote-spark-analytic",
  storageBucket: "quote-spark-analytic.firebasestorage.app",
  messagingSenderId: "77220859500",
  appId: "1:77220859500:ios:8bcf942c1a92e7f6199249",
};

// Initialize Firebase app (prevent multiple initialization)
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
export const auth = getAuth(app);

export default app;
