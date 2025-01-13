// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBePpNhR3QHD-0EuwzmA5FhJ91M0CzVc6c",
  authDomain: "vibe-nation.firebaseapp.com",
  projectId: "vibe-nation",
  storageBucket: "vibe-nation.firebasestorage.app",
  messagingSenderId: "1066972586691",
  appId: "1:1066972586691:web:114de094771a73737cb876",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
export default app;
export const auth = getAuth(app);
