import { db } from "../firebase-config.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
    id: student.id || "",
    name: String(student.name || "").trim(),
    email: String(student.email || "").trim().toLowerCase(),
    accessCode: String(student.accessCode || "").trim().toUpperCase(),
    tier: String(student.tier || "FULL").toUpperCase(),
    paid: !!student.paid,
    status: String(student.status || "active").toLowerCase(),
    progress: normalizedProgress,
    completedLessons: Array.isArray(student.completedLessons)
      ? [...new Set(student.completedLessons.map(Number).filter(Boolean))]
      : []
  };
}

function setCurrentStudent(student) {
  localStorage.setItem(CURRENT_STUDENT_KEY, JSON.stringify(normalizeStudent(student)));
}

function getCurrentStudent() {
  const raw = localStorage.getItem(CURRENT_STUDENT_KEY);
  return raw ? normalizeStudent(JSON.parse(raw)) : null;
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
    const student = normalizeStudent({ id: docSnap.id, ...docSnap.data() });
    setCurrentStudent(student);
    return student;

  } catch (error) {
    console.error("Error during student login:", error);
    return null;
  }
}

window.BSA = {
  loginStudent,
  getCurrentStudent,
};
