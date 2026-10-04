import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyAF7QA2OnVgumv1gW6_3iPDN-UMue0TcJI",
  authDomain: "patisserieparty-32233.firebaseapp.com",
  projectId: "patisserieparty-32233", // <-- C'est ici !
  storageBucket: "patisserieparty-32233.firebasestorage.app",
  messagingSenderId: "876619647257",
  appId: "1:876619647257:web:e70f31d7fb498051145d88"
};

// Initialisation de Firebase et Firestore
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);