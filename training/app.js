
import { db } from "./firebase-config.js";
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
const PASSING_SCORE = 80;
const TOTAL_LESSONS = 8;

function getLessons() {
  return Array.isArray(window.LESSONS) ? window.LESSONS : [];
}

function uniqueNumberList(items = []) {
  return [...new Set(items.map(Number).filter((n) => Number.isFinite(n) && n > 0))].sort((a, b) => a - b);
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
    seenQuestionIds: Array.isArray(existing.seenQuestionIds) ? [...new Set(existing.seenQuestionIds.map(String))] : [],
    quizTimeSeconds: Number(existing.quizTimeSeconds || 0),
    totalQuizTimeSeconds: Number(existing.totalQuizTimeSeconds || 0),
    lastQuizTimeSeconds: Number(existing.lastQuizTimeSeconds || 0),
    attemptHistory: Array.isArray(existing.attemptHistory) ? existing.attemptHistory : [],
    currentStage: String(existing.currentStage || "not_started"),
    lastLessonVisited: Number(existing.lastLessonVisited || 0),
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
    ? uniqueNumberList(rawStudent.completedLessons)
    : Object.entries(progress)
        .filter(([, value]) => value && value.quizPassed)
        .map(([key]) => Number(key));

  return {
    id: String(rawStudent.id || "").trim(),
    name: String(rawStudent.name || "").trim() || "Student",
    email: String(rawStudent.email || "").trim().toLowerCase(),
    accessCode: String(rawStudent.accessCode || "").trim().toUpperCase(),
    tier: String(rawStudent.tier || "FULL").trim().toUpperCase(),
    paid: !!rawStudent.paid,
    status: String(rawStudent.status || "active").trim().toLowerCase(),
    allowAllLessons: rawStudent.allowAllLessons !== false,
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

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomSample(items, count) {
  return shuffle(items).slice(0, Math.min(count, items.length));
}

function isLessonAllowedByTier(lessonId, studentOrTier = getCurrentStudent()) {
  const student = typeof studentOrTier === "string"
    ? { tier: studentOrTier, paid: false, allowAllLessons: true }
    : (studentOrTier || getCurrentStudent());

  if (!student) return false;
  if (student.allowAllLessons !== false) return Number(lessonId) >= 1;
  if (student.tier === "FULL" || student.paid) return Number(lessonId) >= 1;
  return Number(lessonId) === 1;
}

function lessonSequenceUnlocked(lessonId, student = getCurrentStudent()) {
  if (!student) return false;
  if (!isLessonAllowedByTier(lessonId, student)) return false;
  if (lessonId <= 1) return true;
  return !!student.completedLessons.includes(lessonId - 1);
}

function getLessonProgress(lessonId, student = getCurrentStudent()) {
  if (!student) return freshProgressForLesson();
  return freshProgressForLesson(student.progress?.[lessonId] || {});
}

function getLessonStageLabel(progress) {
  if (progress.quizPassed) return "Passed";
  if (progress.currentStage === "quiz") return "In Quiz";
  if (progress.scenarioCompleted) return "Ready for Quiz";
  if (progress.currentStage === "scenario") return "In Scenarios";
  if (progress.contentViewed || progress.currentStage === "lesson") return "Reading Lesson";
  return "Not Started";
}

function lessonStatus(lessonId, student = getCurrentStudent()) {
  const progress = getLessonProgress(lessonId, student);

  if (!isLessonAllowedByTier(lessonId, student)) {
    return { locked: true, className: "locked", label: "Upgrade Required" };
  }

  if (!lessonSequenceUnlocked(lessonId, student)) {
    return { locked: true, className: "locked", label: "Locked" };
  }

  if (progress.quizPassed) {
    return { locked: false, className: "passed", label: `Passed • ${progress.quizScore || PASSING_SCORE}%` };
  }

  if (progress.currentStage === "quiz" || progress.scenarioCompleted) {
    return { locked: false, className: "active", label: "Quiz In Progress" };
  }

  if (progress.currentStage === "scenario") {
    return { locked: false, className: "active", label: "Scenario Review" };
  }

  if (progress.contentViewed) {
    return { locked: false, className: "ready", label: "Lesson Started" };
  }

  return { locked: false, className: "ready", label: "Start Lesson" };
}

function overallProgress(student = getCurrentStudent()) {
  const total = getLessons().length || TOTAL_LESSONS;
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

async function login(code) {
  const cleanCode = String(code || "").trim().toUpperCase();
  if (!cleanCode) {
    return { ok: false, message: "Please enter your access code." };
  }

  try {
    const q = query(
      collection(db, "portalStudents"),
      where("accessCode", "==", cleanCode)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { ok: false, message: "Invalid access code." };
    }

    const docSnap = snapshot.docs.find((item) => String(item.data()?.status || "active").toLowerCase() === "active") || snapshot.docs[0];
    const raw = { id: docSnap.id, ...docSnap.data() };
    if (String(raw.status || "active").toLowerCase() !== "active") {
      return { ok: false, message: "This access code is inactive." };
    }

    const student = cacheStudent(raw);

    await updateDoc(doc(db, "portalStudents", student.id), {
      lastLoginAt: serverTimestamp(),
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
  const merged = {
    ...existing,
    ...patch,
    seenQuestionIds: [...new Set([...(existing.seenQuestionIds || []), ...(patch.seenQuestionIds || [])])],
    totalQuizTimeSeconds: Number(existing.totalQuizTimeSeconds || 0) + Number(patch.additionalQuizTimeSeconds || 0),
    quizTimeSeconds: Number(existing.quizTimeSeconds || 0) + Number(patch.additionalQuizTimeSeconds || 0),
    lastQuizTimeSeconds: patch.lastQuizTimeSeconds != null ? Number(patch.lastQuizTimeSeconds || 0) : Number(existing.lastQuizTimeSeconds || 0),
    attemptHistory: Array.isArray(patch.attemptHistoryReplace)
      ? patch.attemptHistoryReplace
      : [...(existing.attemptHistory || []), ...(patch.attemptHistoryAppend || [])],
    currentStage: patch.currentStage || existing.currentStage,
    lastLessonVisited: Number(patch.lastLessonVisited || lessonId),
    lastActivityAt: new Date().toISOString()
  };

  delete merged.additionalQuizTimeSeconds;
  delete merged.attemptHistoryAppend;
  delete merged.attemptHistoryReplace;

  if (merged.quizPassed) {
    merged.currentStage = "passed";
    merged.completedAt = merged.completedAt || new Date().toISOString();
  }

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
  return updateStudentProgress(lessonId, {
    contentViewed: true,
    currentStage: progress.quizPassed ? "passed" : "lesson",
    lastLessonVisited: lessonId
  });
}

async function setScenarioCompleted(lessonId) {
  return updateStudentProgress(lessonId, {
    scenarioCompleted: true,
    currentStage: "quiz",
    lastLessonVisited: lessonId
  });
}

async function setLessonStage(lessonId, stage) {
  return updateStudentProgress(lessonId, {
    currentStage: stage,
    lastLessonVisited: lessonId
  });
}

function getAttemptCount(lessonId, student = getCurrentStudent()) {
  return Number(getLessonProgress(lessonId, student).attempts || 0);
}

function selectQuizQuestions(lessonId, count = 20, student = getCurrentStudent()) {
  const pool = Array.isArray(window.QUIZ_BANK?.[lessonId]) ? window.QUIZ_BANK[lessonId] : [];
  const progress = getLessonProgress(lessonId, student);
  const seenSet = new Set((progress.seenQuestionIds || []).map(String));

  const unseen = pool.filter((item) => !seenSet.has(String(item.id)));
  let chosen = [];

  if (unseen.length >= count) {
    chosen = randomSample(unseen, count);
  } else {
    chosen = [...shuffle(unseen)];
    const remaining = pool.filter((item) => !chosen.find((pick) => pick.id === item.id));
    chosen.push(...randomSample(remaining, count - chosen.length));
  }

  return chosen.map((question, idx) => {
    if (question.type === "tf") {
      return { ...question, _renderIndex: idx };
    }
    const originalChoices = question.choices.map((choice, choiceIndex) => ({
      text: choice,
      originalIndex: choiceIndex
    }));
    const shuffledChoices = shuffle(originalChoices);
    const remappedAnswer = shuffledChoices.findIndex((item) => item.originalIndex === question.answer);

    return {
      ...question,
      _renderIndex: idx,
      answer: remappedAnswer,
      choices: shuffledChoices.map((item) => item.text)
    };
  });
}

async function recordQuizResult(lessonId, payload = {}) {
  const {
    score = 0,
    details = [],
    questionIds = [],
    elapsedSeconds = 0
  } = payload;

  const current = getLessonProgress(lessonId);
  const attempts = Number(current.attempts || 0) + 1;

  return updateStudentProgress(lessonId, {
    attempts,
    quizScore: Number(score || 0),
    quizPassed: Number(score || 0) >= PASSING_SCORE,
    quizDetails: details,
    completedAt: new Date().toISOString(),
    seenQuestionIds: questionIds,
    lastQuizTimeSeconds: elapsedSeconds,
    additionalQuizTimeSeconds: elapsedSeconds,
    attemptHistoryAppend: [{
      attempt: attempts,
      score: Number(score || 0),
      elapsedSeconds: Number(elapsedSeconds || 0),
      at: new Date().toISOString(),
      questionIds: questionIds
    }],
    currentStage: Number(score || 0) >= PASSING_SCORE ? "passed" : "quiz",
    lastLessonVisited: lessonId
  });
}

function formatSeconds(totalSeconds = 0) {
  const total = Math.max(0, Number(totalSeconds || 0));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m ${secs}s`;
  }
  return `${mins}m ${secs}s`;
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
  setLessonStage,
  recordQuizResult,
  selectQuizQuestions,
  getAttemptCount,
  getLessonProgress,
  getLessonStageLabel,
  lessonStatus,
  overallProgress,
  allLessonsComplete,
  lessonSequenceUnlocked,
  isLessonAllowedByTier,
  qs,
  randomSample,
  shuffle,
  uniqueNumberList,
  formatSeconds,
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
  setLessonStage,
  recordQuizResult,
  selectQuizQuestions,
  getAttemptCount,
  getLessonProgress,
  getLessonStageLabel,
  lessonStatus,
  overallProgress,
  allLessonsComplete,
  lessonSequenceUnlocked,
  isLessonAllowedByTier,
  qs,
  randomSample,
  shuffle,
  uniqueNumberList,
  formatSeconds,
  requestLiveSessionAllowed
};
