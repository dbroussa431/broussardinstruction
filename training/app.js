import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  query,
  where,
  limit,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const CURRENT_STUDENT_KEY = "bsaPortalCurrentStudent";
const ACTIVE_QUIZ_KEY = "bsaPortalActiveQuiz";
const PASSING_SCORE = 80;

function getLessons() {
  return Array.isArray(window.LESSONS) ? window.LESSONS : [];
}

function normalizeAccessCode(value) {
  return String(value || "").trim().toUpperCase().replace(/\s+/g, "");
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeStatus(value) {
  return String(value || "active").trim().toLowerCase();
}

function freshProgressForLesson(existing = {}) {
  return {
    contentViewed: !!existing.contentViewed,
    scenarioCompleted: !!existing.scenarioCompleted,
    quizPassed: !!existing.quizPassed,
    quizScore: Number(existing.quizScore || 0),
    attempts: Number(existing.attempts || 0),
    quizDetails: Array.isArray(existing.quizDetails) ? existing.quizDetails : [],
    completedAt: existing.completedAt || null,
    lastLessonVisited: Number(existing.lastLessonVisited || 0),
    totalQuizTimeSeconds: Number(existing.totalQuizTimeSeconds || 0),
    lastActivityAt: existing.lastActivityAt || null
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
    email: normalizeEmail(rawStudent.email || ""),
    accessCode: normalizeAccessCode(rawStudent.accessCode || ""),
    tier: String(rawStudent.tier || "FULL").trim().toUpperCase(),
    paid: !!rawStudent.paid,
    paymentStatus: String(rawStudent.paymentStatus || "").trim().toLowerCase(),
    status: normalizeStatus(rawStudent.status),
    course: String(rawStudent.course || "Louisiana Concealed Carry"),
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
  clearActiveQuiz();
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

function isLessonAllowedByTier(lessonId, tier = "FULL") {
  return Number(lessonId) >= 1;
}

function lessonSequenceUnlocked(lessonId, student = getCurrentStudent()) {
  if (!student) return false;
  if (!isLessonAllowedByTier(lessonId, student.tier)) return false;
  if (lessonId <= 1) return true;
  return !!student.completedLessons.includes(Number(lessonId) - 1);
}

function getLessonProgress(lessonId, student = getCurrentStudent()) {
  if (!student) return freshProgressForLesson();
  return freshProgressForLesson(student.progress?.[lessonId] || {});
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
    return { locked: false, className: "in-progress", label: "Ready for Quiz" };
  }
  if (progress.contentViewed) {
    return { locked: false, className: "in-progress", label: "Scenario Review Next" };
  }
  return { locked: false, className: "not-started", label: "Start Lesson" };
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

async function login(email, code) {
  const cleanEmail = normalizeEmail(email);
  const cleanCode = normalizeAccessCode(code);

  if (!cleanEmail) {
    return { ok: false, message: "Please enter your email address." };
  }
  if (!cleanCode) {
    return { ok: false, message: "Please enter your access code." };
  }

  try {
    const qref = query(
      collection(db, "portalStudents"),
      where("email", "==", cleanEmail),
      limit(10)
    );
    const snapshot = await getDocs(qref);

    if (snapshot.empty) {
      return { ok: false, message: "No student record was found for that email." };
    }

    const match = snapshot.docs.find((studentDoc) => {
      const data = studentDoc.data() || {};
      return normalizeAccessCode(data.accessCode || "") === cleanCode;
    });

    if (!match) {
      return { ok: false, message: "Email and access code do not match." };
    }

    const status = normalizeStatus(match.data().status || "active");
    if (status !== "active") {
      return { ok: false, message: "This portal access is not active yet." };
    }

    const student = cacheStudent({ id: match.id, ...match.data() });

    await updateDoc(doc(db, "portalStudents", student.id), {
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { ok: true, student };
  } catch (error) {
    console.error("Login failed:", error);
    const message = String(error?.message || "").toLowerCase();
    if (message.includes("permission")) {
      return { ok: false, message: "Firebase permissions are blocking login." };
    }
    if (message.includes("network") || message.includes("offline") || message.includes("failed to fetch")) {
      return { ok: false, message: "Could not connect to Firebase." };
    }
    return { ok: false, message: "Unable to log in right now. Please try again." };
  }
}

function logout() {
  clearCurrentStudent();
}

function requireLogin() {
  const student = getCurrentStudent();
  if (!student || !student.id || !student.accessCode || !student.email) {
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
  const merged = {
    ...existing,
    ...patch,
    lastLessonVisited: Number(patch.lastLessonVisited || lessonId || existing.lastLessonVisited || 0),
    lastActivityAt: new Date().toISOString()
  };

  const progress = { ...refreshed.progress, [lessonId]: merged };
  const completedSet = new Set(refreshed.completedLessons || []);
  if (merged.quizPassed) completedSet.add(Number(lessonId));
  else completedSet.delete(Number(lessonId));
  const completedLessons = [...completedSet].sort((a, b) => a - b);

  await updateDoc(doc(db, "portalStudents", refreshed.id), {
    progress,
    completedLessons,
    updatedAt: serverTimestamp()
  });

  return cacheStudent({ ...refreshed, progress, completedLessons });
}

async function setLessonContentViewed(lessonId) {
  const progress = getLessonProgress(lessonId);
  if (progress.contentViewed) return getCurrentStudent();
  return updateStudentProgress(lessonId, {
    contentViewed: true,
    lastLessonVisited: Number(lessonId)
  });
}

async function setScenarioCompleted(lessonId) {
  return updateStudentProgress(lessonId, {
    scenarioCompleted: true,
    lastLessonVisited: Number(lessonId)
  });
}

function getAttemptCount(lessonId, student = getCurrentStudent()) {
  return Number(getLessonProgress(lessonId, student).attempts || 0);
}

async function recordQuizResult(lessonId, score, details, totalQuizTimeSeconds = 0) {
  const current = getLessonProgress(lessonId);
  const attempts = Number(current.attempts || 0) + 1;
  clearActiveQuiz(lessonId);

  return updateStudentProgress(lessonId, {
    attempts,
    quizScore: Number(score || 0),
    quizPassed: Number(score || 0) >= PASSING_SCORE,
    quizDetails: Array.isArray(details) ? details : [],
    completedAt: new Date().toISOString(),
    totalQuizTimeSeconds: Number(current.totalQuizTimeSeconds || 0) + Number(totalQuizTimeSeconds || 0),
    lastLessonVisited: Number(lessonId)
  });
}

function getActiveQuizStore() {
  try {
    const raw = localStorage.getItem(ACTIVE_QUIZ_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveActiveQuizStore(store) {
  localStorage.setItem(ACTIVE_QUIZ_KEY, JSON.stringify(store));
}

function getActiveQuiz(lessonId) {
  const store = getActiveQuizStore();
  return store[String(lessonId)] || null;
}

function setActiveQuiz(lessonId, questions) {
  const store = getActiveQuizStore();
  store[String(lessonId)] = {
    lessonId: Number(lessonId),
    startedAt: Date.now(),
    questions
  };
  saveActiveQuizStore(store);
  return store[String(lessonId)];
}

function clearActiveQuiz(lessonId = null) {
  if (lessonId === null || lessonId === undefined) {
    localStorage.removeItem(ACTIVE_QUIZ_KEY);
    return;
  }
  const store = getActiveQuizStore();
  delete store[String(lessonId)];
  saveActiveQuizStore(store);
}

function getQuizQuestionsForLesson(lessonId, count = 20) {
  const existing = getActiveQuiz(lessonId);
  if (existing?.questions?.length) return existing.questions;

  const pool = Array.isArray(window.QUIZ_BANK?.[lessonId]) ? window.QUIZ_BANK[lessonId] : [];
  const selected = randomSample(pool, count).map((q, idx) => ({
    id: q.id || `L${lessonId}-Q${idx + 1}`,
    ...q
  }));
  setActiveQuiz(lessonId, selected);
  return selected;
}

function getScenarioQuestionsForLesson(lessonId, count = 2) {
  const lesson = getLessons().find((entry) => Number(entry.id) === Number(lessonId));
  const pool = Array.isArray(lesson?.scenarios) ? lesson.scenarios : [];
  return randomSample(pool, count).map((item, idx) => ({
    id: item.id || `L${lessonId}-S${idx + 1}`,
    ...item
  }));
}

function formatSeconds(totalSeconds = 0) {
  const safe = Math.max(0, Number(totalSeconds || 0));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}m ${seconds}s`;
}

async function submitPurchaseRequest(form = {}) {
  const name = String(form.name || "").trim();
  const email = normalizeEmail(form.email || "");
  const phone = String(form.phone || "").trim();
  const notes = String(form.notes || "").trim();
  const course = String(form.course || "Louisiana Concealed Carry");
  const price = Number(form.price || 150);

  if (!name) return { ok: false, message: "Please enter your full name." };
  if (!email || !email.includes("@")) return { ok: false, message: "Please enter a valid email address." };

  try {
    const existingSnap = await getDocs(query(collection(db, "portalStudents"), where("email", "==", email), limit(5)));
    if (!existingSnap.empty) {
      const found = existingSnap.docs[0];
      await updateDoc(doc(db, "portalStudents", found.id), {
        name,
        phone,
        notes,
        course,
        price,
        paymentMethod: "PayPal",
        paymentStatus: "pending",
        updatedAt: serverTimestamp()
      });
      return { ok: true, message: "We found your student record and marked it for payment review." };
    }

    await addDoc(collection(db, "portalStudents"), {
      name,
      email,
      phone,
      notes,
      course,
      price,
      paymentMethod: "PayPal",
      paymentStatus: "pending",
      paid: false,
      status: "locked",
      tier: "FULL",
      accessCode: "",
      progress: {},
      completedLessons: [],
      createdAt: new Date().toISOString(),
      updatedAt: serverTimestamp()
    });

    return { ok: true, message: "Purchase request saved. Once payment is verified, your portal access will be activated and your access code will be issued." };
  } catch (error) {
    console.error("Purchase request failed:", error);
    return { ok: false, message: "Could not save your purchase request right now." };
  }
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
  updateStudentProgress,
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
  formatSeconds,
  getQuizQuestionsForLesson,
  getScenarioQuestionsForLesson,
  getActiveQuiz,
  clearActiveQuiz,
  submitPurchaseRequest
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
  updateStudentProgress,
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
  formatSeconds,
  getQuizQuestionsForLesson,
  getScenarioQuestionsForLesson,
  getActiveQuiz,
  clearActiveQuiz,
  submitPurchaseRequest
};

