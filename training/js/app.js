import { db } from "../firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CURRENT_STUDENT_KEY = "bsaPortalCurrentStudent";

function normalizeStudent(rawStudent) {
  const student = { ...(rawStudent || {}) };

  const normalizedProgress = {};
  if (student.progress && typeof student.progress === "object") {
    for (const [key, value] of Object.entries(student.progress)) {
      normalizedProgress[Number(key)] = { ...(value || {}) };
    }
  }

  return {
    id: String(student.id || "").trim(),
    name: String(student.name || "").trim(),
    email: String(student.email || "").trim().toLowerCase(),
    accessCode: String(student.accessCode || "").trim().toUpperCase(),
    tier: String(student.tier || "FULL").trim().toUpperCase(),
    paid: !!student.paid,
    status: String(student.status || "active").trim().toLowerCase(),
    progress: normalizedProgress,
    completedLessons: Array.isArray(student.completedLessons)
      ? [...new Set(student.completedLessons.map(Number).filter(Boolean))]
      : []
  };
}

function setCurrentStudent(student) {
  const normalized = normalizeStudent(student);
  localStorage.setItem(CURRENT_STUDENT_KEY, JSON.stringify(normalized));
  return normalized;
}

function getCurrentStudent() {
  try {
    const raw = localStorage.getItem(CURRENT_STUDENT_KEY);
    if (!raw) return null;
    return normalizeStudent(JSON.parse(raw));
  } catch (error) {
    console.error("Failed to read current student from localStorage:", error);
    return null;
  }
}

function clearCurrentStudent() {
  localStorage.removeItem(CURRENT_STUDENT_KEY);
}

async function loginStudent(code) {
  const cleanCode = String(code || "").trim().toUpperCase();

  if (!cleanCode) {
    console.error("Access code is required.");
    return null;
  }

  try {
    const q = query(
      collection(db, "portalStudents"),
      where("accessCode", "==", cleanCode),
      where("status", "==", "active")
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.error("Invalid or inactive access code.");
      return null;
    }

    const docSnap = snapshot.docs[0];
    const student = setCurrentStudent({
      id: docSnap.id,
      ...docSnap.data()
    });

    return student;
  } catch (error) {
    console.error("Error during student login:", error);
    return null;
  }
}

async function refreshCurrentStudentFromFirestore() {
  const current = getCurrentStudent();
  if (!current || !current.id) return null;

  try {
    const ref = doc(db, "portalStudents", current.id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      clearCurrentStudent();
      return null;
    }

    const freshStudent = normalizeStudent({
      id: snap.id,
      ...snap.data()
    });

    if (freshStudent.status !== "active") {
      clearCurrentStudent();
      return null;
    }

    setCurrentStudent(freshStudent);
    return freshStudent;
  } catch (error) {
    console.error("Failed to refresh current student:", error);
    return current;
  }
}

window.BSA = {
  loginStudent,
  getCurrentStudent,
  clearCurrentStudent,
  refreshCurrentStudentFromFirestore
};

export {
  CURRENT_STUDENT_KEY,
  normalizeStudent,
  setCurrentStudent,
  getCurrentStudent,
  clearCurrentStudent,
  loginStudent,
  refreshCurrentStudentFromFirestore
};
