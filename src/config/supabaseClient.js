// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAFYGSZjbjL0YXbRTXPMeAwBUwGbDdR1Ns",
  authDomain: "cpc357project-29ccf.firebaseapp.com",
  projectId: "cpc357project-29ccf",
  storageBucket: "cpc357project-29ccf.firebasestorage.app",
  messagingSenderId: "46830602399",
  appId: "1:46830602399:web:6d0edb781ea59abcd4baaa",
  measurementId: "G-NYJ5R9GNKC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
