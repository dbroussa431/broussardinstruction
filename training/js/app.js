import { db } from "../firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CURRENT_STUDENT_KEY = "bsaPortalCurrentStudent";

function normalizeProgress(progress) {
  const normalized = {};

  if (progress && typeof progress === "object") {
    for (const [key, value] of Object.entries(progress)) {
      normalized[Number(key)] = {
        contentViewed: !!value?.contentViewed,
        scenarioCompleted: !!value?.scenarioCompleted,
        quizPassed: !!value?.quizPassed,
        quizScore: Number(value?.quizScore || 0),
        attempts: Number(value?.attempts || 0),
        missedQuestions: Array.isArray(value?.missedQuestions) ? value.missedQuestions : []
      };
    }
  }

  return normalized;
}

function normalizeStudent(rawStudent) {
  const student = { ...(rawStudent || {}) };

  return {
    id: String(student.id || "").trim(),
    name: String(student.name || "").trim(),
    email: String(student.email || "").trim().toLowerCase(),
    accessCode: String(student.accessCode || "").trim().toUpperCase(),
    tier: String(student.tier || "FREE").trim().toUpperCase(),
    paid: !!student.paid,
    status: String(student.status || "active").trim().toLowerCase(),
    courseVersion: String(student.courseVersion || "2026-03").trim(),
    progress: normalizeProgress(student.progress),
    completedLessons: Array.isArray(student.completedLessons)
      ? [...new Set(student.completedLessons.map(Number).filter(Boolean))].sort((a, b) => a - b)
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
  if (!cleanCode) return null;

  try {
    const q = query(
      collection(db, "portalStudents"),
      where("accessCode", "==", cleanCode),
      where("status", "==", "active")
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];
    return setCurrentStudent({
      id: docSnap.id,
      ...docSnap.data()
    });
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

function getLessonProgress(student, lessonNumber) {
  const key = Number(lessonNumber);
  const progress = student?.progress?.[key] || {};

  return {
    contentViewed: !!progress.contentViewed,
    scenarioCompleted: !!progress.scenarioCompleted,
    quizPassed: !!progress.quizPassed,
    quizScore: Number(progress.quizScore || 0),
    attempts: Number(progress.attempts || 0),
    missedQuestions: Array.isArray(progress.missedQuestions) ? progress.missedQuestions : []
  };
}

function getOverallCompletionCount(student) {
  return Array.isArray(student?.completedLessons) ? student.completedLessons.length : 0;
}

function isLessonUnlocked(student, lessonNumber) {
  const num = Number(lessonNumber);
  if (num <= 1) return true;
  return Array.isArray(student?.completedLessons) && student.completedLessons.includes(num - 1);
}

function getStudentLessonState(student, lessonNumber) {
  const progress = getLessonProgress(student, lessonNumber);
  return {
    ...progress,
    unlocked: isLessonUnlocked(student, lessonNumber)
  };
}

async function saveStudentProgress(lessonNumber, updates = {}) {
  const current = getCurrentStudent();
  if (!current || !current.id) return null;

  const key = Number(lessonNumber);
  const existing = getLessonProgress(current, key);

  const mergedLesson = { ...existing, ...updates };
  const nextProgress = { ...current.progress, [key]: mergedLesson };

  const completed = new Set(current.completedLessons || []);
  if (mergedLesson.quizPassed) {
    completed.add(key);
  }

  const payload = {
    progress: nextProgress,
    completedLessons: [...completed].sort((a, b) => a - b),
    updatedAt: serverTimestamp()
  };

  try {
    const ref = doc(db, "portalStudents", current.id);
    await updateDoc(ref, payload);

    return setCurrentStudent({
      ...current,
      progress: nextProgress,
      completedLessons: [...completed].sort((a, b) => a - b)
    });
  } catch (error) {
    console.error("Failed to save student progress:", error);
    return current;
  }
}

window.BSA = {
  loginStudent,
  getCurrentStudent,
  clearCurrentStudent,
  refreshCurrentStudentFromFirestore,
  getLessonProgress,
  getStudentLessonState,
  getOverallCompletionCount,
  saveStudentProgress
};

export {
  normalizeStudent,
  setCurrentStudent,
  getCurrentStudent,
  clearCurrentStudent,
  loginStudent,
  refreshCurrentStudentFromFirestore,
  getLessonProgress,
  getStudentLessonState,
  getOverallCompletionCount,
  saveStudentProgress
};
