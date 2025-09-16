// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
import {getAuth} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhBJ8J01wz2QLSLt3Kd8bm9pjHGFZbOfs",
  authDomain: "firestore-practice-652d2.firebaseapp.com",
  projectId: "firestore-practice-652d2",
  storageBucket: "firestore-practice-652d2.firebasestorage.app",
  messagingSenderId: "622957118602",
  appId: "1:622957118602:web:261de0e45896c772a99973"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);