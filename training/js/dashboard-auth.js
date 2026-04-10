import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const logoutBtn = document.getElementById("logoutBtn");
const studentEmail = document.getElementById("studentEmail");

async function syncStudentLogin(email) {
  if (!email) return;

  const q = query(collection(db, "portalStudents"), where("email", "==", email));
  const snap = await getDocs(q);

  if (snap.empty) {
    console.warn("No student document found for auth email:", email);
    return;
  }

  for (const docSnap of snap.docs) {
    await updateDoc(doc(db, "portalStudents", docSnap.id), {
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      inactiveEmailSent7: false,
      inactiveEmailSent14: false,
      inactiveEmailSent30: false
    });
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  if (studentEmail) {
    studentEmail.textContent = `Logged in as: ${user.email}`;
  }

  try {
    await syncStudentLogin(user.email);
  } catch (error) {
    console.error("Student login sync failed:", error);
  }
});

logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "./login.html";
});
