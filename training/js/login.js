import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const SESSION_KEY = "bsaStudentSession";

const loginForm = document.getElementById("loginForm");
const accessCodeInput = document.getElementById("accessCode");
const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");

function showMessage(message, isError = false) {
  loginMessage.textContent = message;
  loginMessage.classList.remove("error", "success");

  if (!message) return;

  loginMessage.classList.add(isError ? "error" : "success");
}

function setLoading(isLoading) {
  loginBtn.disabled = isLoading;
  loginBtn.textContent = isLoading ? "Signing In..." : "Login to Portal";
}

function normalizeCode(value) {
  return value.trim().toUpperCase();
}

function clearOldSession() {
  localStorage.removeItem(SESSION_KEY);
}

function saveSession(studentId, studentData, code) {
  const session = {
    id: studentId,
    studentName: studentData.studentName || studentData.name || "Student",
    accessCode: studentData.accessCode || code,
    portalStatus: studentData.portalStatus || "Active",
    progressLabel: studentData.progressLabel || "Not Started",
    course: studentData.course || "Training Course"
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

async function findStudentByCode(code) {
  const studentsRef = collection(db, "students");
  const codeQuery = query(studentsRef, where("accessCode", "==", code));
  const snapshot = await getDocs(codeQuery);

  if (!snapshot.empty) {
    return snapshot.docs[0];
  }

  return null;
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage("");
  clearOldSession();

  const code = normalizeCode(accessCodeInput.value);

  if (!code) {
    showMessage("Please enter your access code.", true);
    return;
  }

  try {
    setLoading(true);

    const studentDoc = await findStudentByCode(code);

    if (!studentDoc) {
      showMessage("Invalid access code. Please try again.", true);
      return;
    }

    const studentData = studentDoc.data();

    if (
      studentData.portalStatus &&
      String(studentData.portalStatus).toLowerCase() !== "active"
    ) {
      showMessage("Your portal is not active yet. Please contact your instructor.", true);
      return;
    }

    saveSession(studentDoc.id, studentData, code);
    showMessage("Login successful. Redirecting...");
    window.location.href = "./dashboard.html";
  } catch (error) {
    console.error("Login error:", error);
    showMessage("Login failed. Please try again in a moment.", true);
  } finally {
    setLoading(false);
  }
});
