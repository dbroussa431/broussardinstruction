import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCF3y6cr25Ls9MKM2YPJLHJEAgA3PzRp-o",
  authDomain: "bsa-training-admin.firebaseapp.com",
  projectId: "bsa-training-admin",
  storageBucket: "bsa-training-admin.appspot.com",
  messagingSenderId: "972595893407",
  appId: "1:972595893407:web:f415a0f24602bd9603beaa"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
export default app;
