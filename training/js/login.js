import { db } from "./firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const loginForm = document.getElementById("loginForm");
const accessCodeInput = document.getElementById("accessCode");
const loginBtn = document.getElementById("loginBtn");
const messageEl = document.getElementById("message");

function normalizeCode(value) {
  return String(value || "").trim().toUpperCase();
}

function showMessage(text, type = "") {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`.trim();
}

async function findStudentByCode(accessCode) {
  const q = query(
    collection(db, "portalStudents"),
    where("accessCode", "==", accessCode),
    limit(1)
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;

  const docSnap = snap.docs[0];
  return {
    id: docSnap.id,
    ...docSnap.data()
  };
}

function saveSession(student) {
  sessionStorage.setItem("bsaLoggedIn", "true");
  sessionStorage.setItem("bsaStudentId", student.studentId || student.id || "");
  sessionStorage.setItem("bsaAccessCode", student.accessCode || "");
  sessionStorage.setItem("bsaTier", student.tier || "");
  sessionStorage.setItem("bsaPortalStatus", student.status || "");
  sessionStorage.setItem("bsaStudentName", student.name || "");
}

async function handleLogin(event) {
  event.preventDefault();
  showMessage("");

  const code = normalizeCode(accessCodeInput.value);

  if (!code) {
    showMessage("Please enter your access code.", "error");
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "Checking...";

  try {
    const student = await findStudentByCode(code);

    if (!student) {
      showMessage("Invalid access code.", "error");
      return;
    }

    const status = String(student.status || "").toLowerCase();
    if (status !== "active") {
      showMessage("This code is not active.", "error");
      return;
    }

    saveSession(student);
    showMessage("Login successful. Redirecting...", "success");
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Login failed:", error);
    showMessage("Unable to log in right now. Please try again.", "error");
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Enter Portal";
  }
}

loginForm.addEventListener("submit", handleLogin);

accessCodeInput.addEventListener("input", () => {
  accessCodeInput.value = normalizeCode(accessCodeInput.value);
});
