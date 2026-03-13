import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCF3y6cr25Ls9MKM2YPJLHJEAgA3PzRp-o",
  authDomain: "bsa-training-admin.firebaseapp.com",
  projectId: "bsa-training-admin",
  storageBucket: "bsa-training-admin.firebasestorage.app",
  messagingSenderId: "972595893407",
  appId: "1:972595893407:web:f415a0f24602bd9603beaa"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
