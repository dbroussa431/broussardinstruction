import { db } from "../firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CURRENT_STUDENT_KEY = "bsaPortalCurrentStudent";
const PASSING_SCORE = 80;
const TOTAL_LESSONS = 8;
const ADMIN_UNLOCK_CODE = "BSA-UNLOCK-2026"; // CHANGE THIS

// Function to normalize student data
function normalizeStudent(rawStudent) {
  const student = { ...(rawStudent || {}) };

  const normalizedProgress = {};
  if (student.progress && typeof student.progress === "object") {
    for (const [key, value] of Object.entries(student.progress)) {
      normalizedProgress[Number(key)] = { ...(value || {}) };
    }
  }

  return {
    id: student.id || "",
    name: String(student.name || "").trim(),
    email: String(student.email || "").trim().toLowerCase(),
    accessCode: String(student.accessCode || "").trim().toUpperCase(),
    tier: String(student.tier || "FULL").toUpperCase(),
    paid: !!student.paid,
    status: String(student.status || "active"),
    progress: normalizedProgress,
    completedLessons: Array.isArray(student.completedLessons)
      ? [...new Set(student.completedLessons.map(Number).filter(Boolean))]
      : []
  };
}

// Function to set the current student in local storage
function setCurrentStudent(student) {
  localStorage.setItem(CURRENT_STUDENT_KEY, JSON.stringify(normalizeStudent(student)));
}

// Function to get the current student from local storage
function getCurrentStudent() {
  const raw = localStorage.getItem(CURRENT_STUDENT_KEY);
  return raw ? normalizeStudent(JSON.parse(raw)) : null;
}

// Function to clear the active student from local storage
function clearActiveStudent() {
  localStorage.removeItem(CURRENT_STUDENT_KEY);
}

// Function to refresh the current student from the database
async function refreshCurrentStudent() {
  const current = getCurrentStudent();
  if (!current || !current.id) return null;

  const ref = doc(db, "portalStudents", current.id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    clearActiveStudent();
    return null;
  }

  const fresh = normalizeStudent({ id: snap.id, ...snap.data() });
  setCurrentStudent(fresh);
  return fresh;
}

// Function to login student based on access code and email
async function loginStudent(code, email = "") {
  const cleanCode = String(code || "").trim().toUpperCase();
  const cleanEmail = String(email || "").trim().toLowerCase();

  try {
    const q = query(
      collection(db, "portalStudents"),
      where("accessCode", "==", cleanCode),
      where("email", "==", cleanEmail)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.error('Invalid email or access code.');
      return null;
    }

    const docSnap = snapshot.docs[0];
    const student = normalizeStudent({ id: docSnap.id, ...docSnap.data() });
    setCurrentStudent(student);
    return student;

  } catch (error) {
    console.error("Error during student login:", error);
    return null;
  }
}

// Exposing required functions to the window object for use in index.html
window.BSA = {
  PASSING_SCORE,
  loginStudent,
  getCurrentStudent,
  refreshCurrentStudent,
};
