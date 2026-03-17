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
  return (value || "").trim().toUpperCase();
}

async function findAccessCode(accessCode) {
  const q = query(
    collection(db, "portalAccess"),
    where("accessCode", "==", accessCode),
    limit(1)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    return null;
  }

  const docSnap = snap.docs[0];
  return {
    id: docSnap.id,
    ...docSnap.data()
  };
}

function saveSession(accessRecord) {
  sessionStorage.setItem("bsaAccessCode", accessRecord.accessCode || "");
  sessionStorage.setItem("bsaStudentId", accessRecord.studentId || "");
  sessionStorage.setItem("bsaTier", accessRecord.tier || "");
  sessionStorage.setItem("bsaPortalStatus", accessRecord.status || "");
  sessionStorage.setItem("bsaLoggedIn", "true");
}

async function handleLogin(event) {
  event.preventDefault();

  const accessCode = normalizeCode(accessCodeInput.value);

  showMessage("");

  if (!accessCode) {
    showMessage("Please enter your access code.", "error");
    accessCodeInput.focus();
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "Checking...";

  try {
    const record = await findAccessCode(accessCode);

    if (!record) {
      showMessage("Invalid access code.", "error");
      loginBtn.disabled = false;
      loginBtn.textContent = "Log In";
      return;
    }

    const status = String(record.status || "").toLowerCase();

    if (status !== "active") {
      showMessage("This access code is not active.", "error");
      loginBtn.disabled = false;
      loginBtn.textContent = "Log In";
      return;
    }

    saveSession(record);
    showMessage("Login successful. Redirecting...", "success");

    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Login error:", error);
    showMessage("Unable to log in right now. Please try again.", "error");
    loginBtn.disabled = false;
    loginBtn.textContent = "Log In";
  }
}

function autoUppercaseInput() {
  accessCodeInput.value = normalizeCode(accessCodeInput.value);
}

loginForm.addEventListener("submit", handleLogin);
accessCodeInput.addEventListener("input", autoUppercaseInput);
