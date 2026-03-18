import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCF3y6cr25Ls9MKM2YPJLHJEAgA3PzRp-o",
  authDomain: "bsa-training-admin.firebaseapp.com",
  projectId: "bsa-training-admin",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
