// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCssZwBH96GHEMilfkwsw56K7PcI_IiarA",
  authDomain: "local-app-4351c.firebaseapp.com",
  projectId: "local-app-4351c",
  storageBucket: "local-app-4351c.firebasestorage.app",
  messagingSenderId: "1039201934828",
  appId: "1:1039201934828:web:0e468b90af8610bf0c74c9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);