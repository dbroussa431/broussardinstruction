import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CURRENT_STUDENT_KEY = "bsaPortalCurrentStudent";
const PASSING_SCORE = 80;

function getLessons() {
  return Array.isArray(window.LESSONS) ? window.LESSONS : [];
}

function freshProgressForLesson(existing = {}) {
  return {
    contentViewed: !!existing.contentViewed,
    scenarioCompleted: !!existing.scenarioCompleted,
    quizPassed: !!existing.quizPassed,
    quizScore: Number(existing.quizScore || 0),
    attempts: Number(existing.attempts || 0),
    quizDetails: Array.isArray(existing.quizDetails) ? existing.quizDetails : [],
    completedAt: existing.completedAt || null
  };
}

function normalizeStudent(rawStudent = {}) {
  const progress = {};
  if (rawStudent.progress && typeof rawStudent.progress === "object") {
    for (const [key, value] of Object.entries(rawStudent.progress)) {
      progress[Number(key)] = freshProgressForLesson(value || {});
    }
  }

  const completedLessons = Array.isArray(rawStudent.completedLessons)
    ? [...new Set(rawStudent.completedLessons.map(Number).filter(Boolean))].sort((a, b) => a - b)
    : Object.entries(progress)
        .filter(([, value]) => value && value.quizPassed)
        .map(([key]) => Number(key))
        .sort((a, b) => a - b);

  return {
    id: String(rawStudent.id || "").trim(),
    name: String(rawStudent.name || "").trim() || "Student",
    email: String(rawStudent.email || "").trim().toLowerCase(),
    accessCode: String(rawStudent.accessCode || "").trim().toUpperCase(),
    tier: String(rawStudent.tier || "FULL").trim().toUpperCase(),
    paid: !!rawStudent.paid,
    status: String(rawStudent.status || "active").trim().toLowerCase(),
    progress,
    completedLessons,
    lastLoginAt: rawStudent.lastLoginAt || null,
    updatedAt: rawStudent.updatedAt || null
  };
}

function cacheStudent(student) {
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
    console.error("Failed to parse student session:", error);
    return null;
  }
}

function clearCurrentStudent() {
  localStorage.removeItem(CURRENT_STUDENT_KEY);
}

function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function randomSample(items, count) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

function isLessonAllowedByTier(_lessonId, _tier = "FULL") {
  return true;
}

function lessonSequenceUnlocked(lessonId, student = getCurrentStudent()) {
  if (!student) return false;
  if (!isLessonAllowedByTier(lessonId, student.tier)) return false;
  if (lessonId <= 1) return true;
  return !!student.completedLessons.includes(lessonId - 1);
}

function lessonStatus(lessonId, student = getCurrentStudent()) {
  const progress = getLessonProgress(lessonId, student);

  if (!isLessonAllowedByTier(lessonId, student?.tier || "FULL")) {
    return { locked: true, className: "locked", label: "Upgrade Required" };
  }

  if (!lessonSequenceUnlocked(lessonId, student)) {
    return { locked: true, className: "locked", label: "Locked" };
  }

  if (progress.quizPassed) {
    return { locked: false, className: "passed", label: `Passed • ${progress.quizScore || PASSING_SCORE}%` };
  }

  if (progress.scenarioCompleted) {
    return { locked: false, className: "ready", label: "Ready for Quiz" };
  }

  if (progress.contentViewed) {
    return { locked: false, className: "active", label: "Scenario Review Next" };
  }

  return { locked: false, className: "ready", label: "Start Lesson" };
}

function getLessonProgress(lessonId, student = getCurrentStudent()) {
  if (!student) return freshProgressForLesson();
  return freshProgressForLesson(student.progress?.[lessonId] || {});
}

function overallProgress(student = getCurrentStudent()) {
  const total = getLessons().length || 8;
  const passed = Array.isArray(student?.completedLessons) ? student.completedLessons.length : 0;
  return {
    total,
    passed,
    percent: total ? Math.round((passed / total) * 100) : 0
  };
}

function allLessonsComplete(student = getCurrentStudent()) {
  const lessons = getLessons();
  return !!student && lessons.length > 0 && student.completedLessons.length >= lessons.length;
}

function isStudentActive(rawStudent = {}) {
  const status = String(rawStudent.status || "active").trim().toLowerCase();
  return status === "active";
}

async function findStudentByAccessCode(code) {
  const cleanCode = String(code || "").trim().toUpperCase();
  const snapshot = await getDocs(collection(db, "portalStudents"));
  return snapshot.docs.find((item) => {
    const data = item.data() || {};
    const accessCode = String(data.accessCode || "").trim().toUpperCase();
    return accessCode === cleanCode && isStudentActive(data);
  }) || null;
}

async function login(code) {
  const cleanCode = String(code || "").trim().toUpperCase();
  if (!cleanCode) {
    return { ok: false, message: "Please enter your access code." };
  }

  try {
    const docSnap = await findStudentByAccessCode(cleanCode);

    if (!docSnap) {
      return { ok: false, message: "Invalid or inactive access code." };
    }

    const student = cacheStudent({ id: docSnap.id, ...docSnap.data() });

    try {
      await updateDoc(doc(db, "portalStudents", student.id), {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (writeError) {
      console.warn("Login timestamp update failed, but session was created:", writeError);
    }

    return { ok: true, student };
  } catch (error) {
    console.error("Login failed:", error);
    return { ok: false, message: "Unable to log in right now. Check Firebase and try again." };
  }
}

function logout() {
  clearCurrentStudent();
}

function requireLogin() {
  const student = getCurrentStudent();
  if (!student || !student.id || !student.accessCode) {
    window.location.href = "login.html";
    return null;
  }
  return student;
}

async function refreshCurrentStudentFromFirestore() {
  const current = getCurrentStudent();
  if (!current?.id) return null;

  try {
    const snap = await getDoc(doc(db, "portalStudents", current.id));
    if (!snap.exists()) {
      clearCurrentStudent();
      return null;
    }

    const student = normalizeStudent({ id: snap.id, ...snap.data() });
    if (!isStudentActive(student)) {
      clearCurrentStudent();
      return null;
    }
    return cacheStudent(student);
  } catch (error) {
    console.error("Refresh failed:", error);
    return current;
  }
}

async function updateStudentProgress(lessonId, patch = {}) {
  const student = getCurrentStudent();
  if (!student?.id) throw new Error("No active student session.");

  const refreshed = (await refreshCurrentStudentFromFirestore()) || student;
  const existing = freshProgressForLesson(refreshed.progress?.[lessonId] || {});
  const merged = { ...existing, ...patch };

  const progress = { ...refreshed.progress, [lessonId]: merged };
  const completedSet = new Set(refreshed.completedLessons || []);
  if (merged.quizPassed) completedSet.add(Number(lessonId));
  else completedSet.delete(Number(lessonId));

  const completedLessons = [...completedSet].sort((a, b) => a - b);

  const payload = {
    progress,
    completedLessons,
    updatedAt: serverTimestamp()
  };

  await updateDoc(doc(db, "portalStudents", refreshed.id), payload);

  const updatedStudent = cacheStudent({
    ...refreshed,
    progress,
    completedLessons
  });

  return updatedStudent;
}

async function setLessonContentViewed(lessonId) {
  const progress = getLessonProgress(lessonId);
  if (progress.contentViewed) return getCurrentStudent();
  return updateStudentProgress(lessonId, { contentViewed: true });
}

async function setScenarioCompleted(lessonId) {
  return updateStudentProgress(lessonId, { scenarioCompleted: true });
}

function getAttemptCount(lessonId, student = getCurrentStudent()) {
  return Number(getLessonProgress(lessonId, student).attempts || 0);
}

async function recordQuizResult(lessonId, score, details) {
  const current = getLessonProgress(lessonId);
  const attempts = Number(current.attempts || 0) + 1;

  return updateStudentProgress(lessonId, {
    attempts,
    quizScore: score,
    quizPassed: score >= PASSING_SCORE,
    quizDetails: details,
    completedAt: new Date().toISOString()
  });
}

function requestLiveSessionAllowed(student = getCurrentStudent()) {
  return allLessonsComplete(student);
}

const api = {
  CURRENT_STUDENT_KEY,
  PASSING_SCORE,
  login,
  logout,
  requireLogin,
  getCurrentStudent,
  clearCurrentStudent,
  refreshCurrentStudentFromFirestore,
  normalizeStudent,
  cacheStudent,
  setLessonContentViewed,
  setScenarioCompleted,
  recordQuizResult,
  getAttemptCount,
  getLessonProgress,
  lessonStatus,
  overallProgress,
  allLessonsComplete,
  lessonSequenceUnlocked,
  isLessonAllowedByTier,
  qs,
  randomSample,
  requestLiveSessionAllowed
};

window.BSA = api;

export {
  CURRENT_STUDENT_KEY,
  PASSING_SCORE,
  login,
  logout,
  requireLogin,
  getCurrentStudent,
  clearCurrentStudent,
  refreshCurrentStudentFromFirestore,
  normalizeStudent,
  cacheStudent,
  setLessonContentViewed,
  setScenarioCompleted,
  recordQuizResult,
  getAttemptCount,
  getLessonProgress,
  lessonStatus,
  overallProgress,
  allLessonsComplete,
  lessonSequenceUnlocked,
  isLessonAllowedByTier,
  qs,
  randomSample,
  requestLiveSessionAllowed
};
