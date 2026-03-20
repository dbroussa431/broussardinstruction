import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

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
    seenQuestionIds: Array.isArray(existing.seenQuestionIds) ? existing.seenQuestionIds : [],
    totalQuizTimeSeconds: Number(existing.totalQuizTimeSeconds || 0),
    lastQuizTimeSeconds: Number(existing.lastQuizTimeSeconds || 0),
    currentStage: String(existing.currentStage || "not-started"),
    lastActivityAt: existing.lastActivityAt || null,
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
    paymentStatus: String(rawStudent.paymentStatus || (rawStudent.paid ? "paid" : "pending")).trim().toLowerCase(),
    paymentMethod: String(rawStudent.paymentMethod || (rawStudent.paid ? "paypal" : "manual")).trim(),
    course: String(rawStudent.course || "Louisiana Concealed Carry").trim(),
    price: Number(rawStudent.price || 0),
    progress,
    completedLessons,
    currentLesson: Number(rawStudent.currentLesson || inferCurrentLesson(progress, completedLessons) || 1),
    currentStage: String(rawStudent.currentStage || inferCurrentStage(progress, completedLessons)).trim(),
    totalQuizTimeSeconds: Number(rawStudent.totalQuizTimeSeconds || sumQuizTime(progress)),
    lastActivityAt: rawStudent.lastActivityAt || inferLastActivity(progress) || null,
    lastLoginAt: rawStudent.lastLoginAt || null,
    updatedAt: rawStudent.updatedAt || null,
    createdAt: rawStudent.createdAt || null
  };
}

function inferCurrentLesson(progress = {}, completedLessons = []) {
  const lessons = getLessons();
  for (const lesson of lessons) {
    if (!completedLessons.includes(lesson.id)) return lesson.id;
  }
  return lessons.length || 1;
}

function inferCurrentStage(progress = {}, completedLessons = []) {
  const lessonId = inferCurrentLesson(progress, completedLessons);
  const p = freshProgressForLesson(progress?.[lessonId] || {});
  if (completedLessons.length >= (getLessons().length || 8)) return "completed";
  if (p.quizPassed) return "passed";
  if (p.scenarioCompleted) return "ready-for-quiz";
  if (p.contentViewed) return "scenario";
  return "not-started";
}

function inferLastActivity(progress = {}) {
  return Object.values(progress)
    .map((value) => value?.lastActivityAt)
    .filter(Boolean)
    .sort()
    .pop() || null;
}

function sumQuizTime(progress = {}) {
  return Object.values(progress).reduce((sum, item) => sum + Number(item?.totalQuizTimeSeconds || 0), 0);
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

function shuffleArray(items) {
  return randomSample(items, items.length);
}

function isLessonAllowedByTier(lessonId, tier = "FULL") {
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

function formatSeconds(totalSeconds = 0) {
  const seconds = Number(totalSeconds || 0);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function generateAccessCode(name = "BSA") {
  const prefix = String(name || "BSA")
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase()
    .slice(0, 4) || "BSA";
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${random}`;
}

async function login(code) {
  const cleanCode = String(code || "").trim().toUpperCase();
  if (!cleanCode) {
    return { ok: false, message: "Please enter your access code." };
  }

  try {
    let snapshot = await getDocs(query(collection(db, "portalStudents"), where("accessCode", "==", cleanCode), where("status", "==", "active")));
    if (snapshot.empty) {
      snapshot = await getDocs(query(collection(db, "portalStudents"), where("accessCode", "==", cleanCode)));
    }

    if (snapshot.empty) {
      return { ok: false, message: "Invalid or inactive access code." };
    }

    const docSnap = snapshot.docs[0];
    const student = cacheStudent({ id: docSnap.id, ...docSnap.data() });

    await updateDoc(doc(db, "portalStudents", student.id), {
      lastLoginAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { ok: true, student };
  } catch (error) {
    console.error("Login failed:", error);
    return { ok: false, message: "Unable to log in right now. Please try again." };
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
    if (student.status !== "active") {
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
  const nowIso = new Date().toISOString();
  merged.lastActivityAt = patch.lastActivityAt || nowIso;

  const progress = { ...refreshed.progress, [lessonId]: merged };
  const completedSet = new Set(refreshed.completedLessons || []);
  if (merged.quizPassed) completedSet.add(Number(lessonId));
  else completedSet.delete(Number(lessonId));

  const completedLessons = [...completedSet].sort((a, b) => a - b);
  const currentLesson = merged.quizPassed
    ? Math.min((getLessons().length || 8), Number(lessonId) + 1)
    : Number(lessonId);
  const currentStage = merged.quizPassed ? "passed" : merged.currentStage || inferCurrentStage(progress, completedLessons);
  const totalQuizTimeSeconds = sumQuizTime(progress);

  const payload = {
    progress,
    completedLessons,
    currentLesson,
    currentStage,
    totalQuizTimeSeconds,
    lastActivityAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await updateDoc(doc(db, "portalStudents", refreshed.id), payload);

  const updatedStudent = cacheStudent({
    ...refreshed,
    progress,
    completedLessons,
    currentLesson,
    currentStage,
    totalQuizTimeSeconds,
    lastActivityAt: nowIso
  });

  return updatedStudent;
}

async function setLessonContentViewed(lessonId) {
  const progress = getLessonProgress(lessonId);
  return updateStudentProgress(lessonId, {
    contentViewed: true,
    currentStage: progress.quizPassed ? "passed" : "lesson"
  });
}

async function setScenarioCompleted(lessonId) {
  return updateStudentProgress(lessonId, {
    scenarioCompleted: true,
    currentStage: "ready-for-quiz"
  });
}

async function setCurrentLessonStage(lessonId, stage) {
  return updateStudentProgress(lessonId, {
    currentStage: stage
  });
}

function getAttemptCount(lessonId, student = getCurrentStudent()) {
  return Number(getLessonProgress(lessonId, student).attempts || 0);
}

async function recordQuizResult(lessonId, score, details, meta = {}) {
  const current = getLessonProgress(lessonId);
  const attempts = Number(current.attempts || 0) + 1;
  const durationSeconds = Number(meta.durationSeconds || 0);
  const selectedQuestionIds = Array.isArray(meta.selectedQuestionIds) ? meta.selectedQuestionIds : [];
  const seenQuestionIds = [...new Set([...(current.seenQuestionIds || []), ...selectedQuestionIds])];

  return updateStudentProgress(lessonId, {
    attempts,
    quizScore: score,
    quizPassed: score >= PASSING_SCORE,
    quizDetails: details,
    seenQuestionIds,
    lastQuizTimeSeconds: durationSeconds,
    totalQuizTimeSeconds: Number(current.totalQuizTimeSeconds || 0) + durationSeconds,
    currentStage: score >= PASSING_SCORE ? "passed" : "quiz",
    completedAt: score >= PASSING_SCORE ? new Date().toISOString() : current.completedAt || null
  });
}

function requestLiveSessionAllowed(student = getCurrentStudent()) {
  return allLessonsComplete(student);
}

async function createStudentRecord(payload = {}) {
  const name = String(payload.name || "Student").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const price = Number(payload.price || 0);
  const paid = !!payload.paid || String(payload.paymentStatus || "").toLowerCase() === "paid";
  const accessCode = String(payload.accessCode || generateAccessCode(name)).trim().toUpperCase();

  const docRef = await addDoc(collection(db, "portalStudents"), {
    name,
    email,
    accessCode,
    tier: String(payload.tier || "FULL").toUpperCase(),
    paid,
    status: String(payload.status || "active").toLowerCase(),
    paymentStatus: String(payload.paymentStatus || (paid ? "paid" : "pending")).toLowerCase(),
    paymentMethod: String(payload.paymentMethod || (paid ? "paypal" : "manual")),
    course: String(payload.course || "Louisiana Concealed Carry"),
    price,
    progress: {},
    completedLessons: [],
    currentLesson: 1,
    currentStage: "not-started",
    totalQuizTimeSeconds: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastActivityAt: serverTimestamp()
  });

  return { id: docRef.id, accessCode };
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
  setCurrentLessonStage,
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
  shuffleArray,
  formatSeconds,
  generateAccessCode,
  createStudentRecord,
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
  setCurrentLessonStage,
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
  shuffleArray,
  formatSeconds,
  generateAccessCode,
  createStudentRecord,
  requestLiveSessionAllowed
};
