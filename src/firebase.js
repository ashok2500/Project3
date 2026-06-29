import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAOT2XLuwglJG3nSn23ZyyiyOBQBrKtLeQ",
  authDomain: "star-crackers.firebaseapp.com",
  projectId: "star-crackers",
  storageBucket: "star-crackers.firebasestorage.app",
  messagingSenderId: "939235669333",
  appId: "1:939235669333:web:44682b72c4eb626c8dabdc"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;