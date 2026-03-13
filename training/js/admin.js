import { auth, db } from "../firebase-config.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const loginSection = document.getElementById("loginSection");
const appSection = document.getElementById("appSection");
const loginForm = document.getElementById("loginForm");
const loginMsg = document.getElementById("loginMsg");
const studentForm = document.getElementById("studentForm");
const saveMsg = document.getElementById("saveMsg");
const logoutBtn = document.getElementById("logoutBtn");
const studentsTableBody = document.getElementById("studentsTableBody");
const refreshBtn = document.getElementById("refreshBtn");

function showMessage(el, msg, isError = false) {
  el.textContent = msg;
  el.style.color = isError ? "#b00020" : "#0a7a2f";
}

async function loadStudents() {
  studentsTableBody.innerHTML = `<tr><td colspan="6">Loading...</td></tr>`;

  try {
    const q = query(collection(db, "students"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      studentsTableBody.innerHTML = `<tr><td colspan="6">No student records yet.</td></tr>`;
      return;
    }

    studentsTableBody.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const s = docSnap.data();

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${s.firstName || ""}</td>
        <td>${s.lastName || ""}</td>
        <td>${s.course || ""}</td>
        <td>${s.completionDate || ""}</td>
        <td>${s.instructor || ""}</td>
        <td>${s.email || ""}</td>
      `;
      studentsTableBody.appendChild(row);
    });
  } catch (err) {
    studentsTableBody.innerHTML = `<tr><td colspan="6">Error loading students.</td></tr>`;
    console.error(err);
  }
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginMsg.textContent = "";

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showMessage(loginMsg, "Login successful.");
  } catch (err) {
    console.error(err);
    showMessage(loginMsg, err.message, true);
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.error(err);
    alert("Logout failed.");
  }
});

studentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  saveMsg.textContent = "";

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const course = document.getElementById("course").value.trim();
  const completionDate = document.getElementById("completionDate").value.trim();
  const instructor = document.getElementById("instructor").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!firstName || !lastName || !course || !completionDate || !instructor) {
    showMessage(saveMsg, "Please fill in all required fields.", true);
    return;
  }

  try {
    await addDoc(collection(db, "students"), {
      firstName,
      lastName,
      course,
      completionDate,
      instructor,
      email,
      createdAt: serverTimestamp()
    });

    showMessage(saveMsg, "Student record saved.");
    studentForm.reset();
    await loadStudents();
  } catch (err) {
    console.error(err);
    showMessage(saveMsg, err.message, true);
  }
});

refreshBtn.addEventListener("click", loadStudents);

onAuthStateChanged(auth, async (user) => {
  if (user) {
    loginSection.style.display = "none";
    appSection.style.display = "block";
    await loadStudents();
  } else {
    loginSection.style.display = "block";
    appSection.style.display = "none";
    studentsTableBody.innerHTML = "";
  }
alert("admin.js loaded");
});
