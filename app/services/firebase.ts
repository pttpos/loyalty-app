// services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC9qYp1GDB2uS9AEkZaLlndLEGa5eKUwfU",
  authDomain: "pttstation-oil.firebaseapp.com",
  projectId: "pttstation-oil",
  storageBucket: "pttstation-oil.appspot.com",
  messagingSenderId: "320758491026",
  appId: "1:320758491026:web:d913afaaee45ef3835c34b",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
