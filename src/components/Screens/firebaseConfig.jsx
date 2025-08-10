// firebase/firebaseConfig.js

// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzmMCYtIWh0MgWEpWMDIYVFG0cuU1sirg",
  authDomain: "budget-breeze-9a6ec.firebaseapp.com",
  projectId: "budget-breeze-9a6ec",
  storageBucket: "budget-breeze-9a6ec.appspot.com",  // ← corrected from 'firebasestorage.app'
  messagingSenderId: "722972232051",
  appId: "1:722972232051:web:c61bfac561bd6375769d06",
  measurementId: "G-0FB5MDBBS1" // optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore database
const db = getFirestore(app);

// Export db to use in your app
export { db };
