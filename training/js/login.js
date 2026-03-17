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

function showMessage(text, type = "") {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`.trim();
}

function normalizeCode(value) {
  return String(value || "").trim().toUpperCase();
}

async function findAccessRecord(accessCode) {
  const q = query(
    collection(db, "portalAccess"),
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

function saveSession(record) {
  sessionStorage.setItem("bsaLoggedIn", "true");
  sessionStorage.setItem("bsaStudentId", record.studentId || record.id || "");
  sessionStorage.setItem("bsaAccessCode", record.accessCode || "");
  sessionStorage.setItem("bsaTier", record.tier || "");
  sessionStorage.setItem("bsaPortalStatus", record.status || "");
}

async function handleLogin(event) {
  event.preventDefault();

  showMessage("");
  const accessCode = normalizeCode(accessCodeInput.value);

  if (!accessCode) {
    showMessage("Please enter your access code.", "error");
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "Checking...";

  try {
    const record = await findAccessRecord(accessCode);

    if (!record) {
      showMessage("Invalid access code.", "error");
      return;
    }

    const status = String(record.status || "").toLowerCase();

    if (status !== "active") {
      showMessage("This access code is not active.", "error");
      return;
    }

    saveSession(record);
    showMessage("Login successful. Redirecting...", "success");
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Login failed:", error);
    showMessage("Unable to log in right now. Please try again.", "error");
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Log In";
  }
}

loginForm.addEventListener("submit", handleLogin);
accessCodeInput.addEventListener("input", () => {
  accessCodeInput.value = normalizeCode(accessCodeInput.value);
});
