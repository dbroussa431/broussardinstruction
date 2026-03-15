import { db } from "../firebase-config.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CURRENT_STUDENT_KEY = "bsaPortalCurrentStudent";

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

// Function to set the current student in localStorage
function setCurrentStudent(student) {
  localStorage.setItem(CURRENT_STUDENT_KEY, JSON.stringify(normalizeStudent(student)));
}

// Function to get the current student from localStorage
function getCurrentStudent() {
  const raw = localStorage.getItem(CURRENT_STUDENT_KEY);
  return raw ? normalizeStudent(JSON.parse(raw)) : null;
}

// Function to login student based on email and access code
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

// Expose the loginStudent function to the window object
window.BSA = {
  loginStudent,
  getCurrentStudent,
};
