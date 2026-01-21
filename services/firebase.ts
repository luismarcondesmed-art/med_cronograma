import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDyfgOvzTYd6si3g-mPQyInbfiFG1hoVAU",
  authDomain: "cronograma-medufpr.firebaseapp.com",
  projectId: "cronograma-medufpr",
  storageBucket: "cronograma-medufpr.firebasestorage.app",
  messagingSenderId: "68632769127",
  appId: "1:68632769127:web:1144e190a83a3581be1ac2",
  measurementId: "G-6RNMK13MMK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Analytics can only be initialized in a browser environment
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, db, storage, analytics };