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
const STUDENTS_COLLECTION = "portalStudents";
const TOTAL_LESSONS = 8;

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function nowIso() {
  return new Date().toISOString();
}

function uniqueSortedLessonNumbers(values = []) {
  return [...new Set(values.map(Number).filter((n) => Number.isFinite(n) && n > 0))].sort((a, b) => a - b);
}

function clampMinutes(value) {
  const num = Number(value || 0);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.round(num);
}

function normalizeProgress(progress) {
  const normalized = {};

  if (progress && typeof progress === "object") {
    for (const [key, value] of Object.entries(progress)) {
      const lessonNumber = Number(key);
      if (!Number.isFinite(lessonNumber) || lessonNumber < 1) continue;

      const scenarioPassedCount = Number(
        value?.scenarioPassedCount ??
        value?.scenariosPassedCount ??
        (value?.scenarioCompleted ? 2 : 0)
      );

      normalized[lessonNumber] = {
        contentViewed: !!value?.contentViewed,
        scenarioCompleted: !!value?.scenarioCompleted,
        scenarioPassedCount: Math.max(0, scenarioPassedCount),
        quizPassed: !!value?.quizPassed,
        quizScore: Number(value?.quizScore || 0),
        attempts: Number(value?.attempts || 0),
        missedQuestions: Array.isArray(value?.missedQuestions) ? value.missedQuestions : [],
        startedAt: value?.startedAt || "",
        completedAt: value?.completedAt || "",
        lessonTimeMinutes: clampMinutes(value?.lessonTimeMinutes),
        lessonStartedAt: value?.lessonStartedAt || "",
        lessonLastSeenAt: value?.lessonLastSeenAt || "",
        quizStartedAt: value?.quizStartedAt || "",
        quizCompletedAt: value?.quizCompletedAt || "",
        scenarioStartedAt: value?.scenarioStartedAt || "",
        scenarioCompletedAt: value?.scenarioCompletedAt || ""
      };
    }
  }

  return normalized;
}

function deriveCompletedLessons(progress = {}) {
  return Object.entries(progress)
    .filter(([, value]) => value?.quizPassed && value?.scenarioCompleted)
    .map(([lessonNumber]) => Number(lessonNumber))
    .filter(Boolean)
    .sort((a, b) => a - b);
}

function deriveProgressPercent(completedLessons = []) {
  return Math.round((completedLessons.length / TOTAL_LESSONS) * 100);
}

function deriveProgressLabel(completedLessons = []) {
  const count = completedLessons.length;
  if (count <= 0) return "Not Started";
  if (count >= TOTAL_LESSONS) return "Completed";
  return `Lesson ${count}`;
}

function deriveTotalOnlineMinutes(progress = {}) {
  return Object.values(progress).reduce((sum, lesson) => {
    return sum + clampMinutes(lesson?.lessonTimeMinutes);
  }, 0);
}

function formatAdminStatus(completedLessons = []) {
  const count = completedLessons.length;
  if (count <= 0) return "Not Started";
  if (count >= TOTAL_LESSONS) return "Completed";
  return `Lesson ${count} Complete`;
}

function normalizeStudent(rawStudent) {
  const student = { ...(rawStudent || {}) };
  const progress = normalizeProgress(student.progress);
  const completedLessons = Array.isArray(student.completedLessons) && student.completedLessons.length
    ? uniqueSortedLessonNumbers(student.completedLessons)
    : deriveCompletedLessons(progress);

  return {
    id: String(student.id || "").trim(),
    name: String(student.name || "").trim(),
    email: String(student.email || "").trim().toLowerCase(),
    accessCode: String(student.accessCode || "").trim().toUpperCase(),
    tier: String(student.tier || "FREE").trim().toUpperCase(),
    paid: !!student.paid,
    status: String(student.status || student.portalStatus || "active").trim().toLowerCase(),
    portalStatus: String(student.portalStatus || student.status || "active").trim().toLowerCase(),
    courseVersion: String(student.courseVersion || "2026-03").trim(),
    progress,
    completedLessons,
    progressPercent: Number(student.progressPercent ?? deriveProgressPercent(completedLessons)),
    progressLabel: String(student.progressLabel || deriveProgressLabel(completedLessons)).trim(),
    adminProgressLabel: String(student.adminProgressLabel || formatAdminStatus(completedLessons)).trim(),
    startDate: String(student.startDate || "").trim(),
    completionDate: String(student.completionDate || "").trim(),
    totalOnlineMinutes: clampMinutes(student.totalOnlineMinutes ?? deriveTotalOnlineMinutes(progress))
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
      collection(db, STUDENTS_COLLECTION),
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
    const ref = doc(db, STUDENTS_COLLECTION, current.id);
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
    scenarioPassedCount: Number(progress.scenarioPassedCount || 0),
    quizPassed: !!progress.quizPassed,
    quizScore: Number(progress.quizScore || 0),
    attempts: Number(progress.attempts || 0),
    missedQuestions: Array.isArray(progress.missedQuestions) ? progress.missedQuestions : [],
    startedAt: progress.startedAt || "",
    completedAt: progress.completedAt || "",
    lessonTimeMinutes: clampMinutes(progress.lessonTimeMinutes),
    lessonStartedAt: progress.lessonStartedAt || "",
    lessonLastSeenAt: progress.lessonLastSeenAt || "",
    quizStartedAt: progress.quizStartedAt || "",
    quizCompletedAt: progress.quizCompletedAt || "",
    scenarioStartedAt: progress.scenarioStartedAt || "",
    scenarioCompletedAt: progress.scenarioCompletedAt || ""
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
  const completed = Array.isArray(student?.completedLessons) && student.completedLessons.includes(Number(lessonNumber));

  return {
    ...progress,
    completed,
    unlocked: isLessonUnlocked(student, lessonNumber)
  };
}

function buildDerivedStudent(current, nextProgress) {
  const completedLessons = deriveCompletedLessons(nextProgress);
  const progressPercent = deriveProgressPercent(completedLessons);
  const progressLabel = deriveProgressLabel(completedLessons);
  const adminProgressLabel = formatAdminStatus(completedLessons);
  const totalOnlineMinutes = deriveTotalOnlineMinutes(nextProgress);

  let startDate = current.startDate || "";
  const anyQuizPassed = Object.values(nextProgress).some((lesson) => lesson?.quizPassed);

  if (!startDate && anyQuizPassed) {
    startDate = todayString();
  }

  let completionDate = current.completionDate || "";
  if (completedLessons.length >= TOTAL_LESSONS && !completionDate) {
    completionDate = todayString();
  }

  return {
    completedLessons,
    progressPercent,
    progressLabel,
    adminProgressLabel,
    startDate,
    completionDate,
    totalOnlineMinutes
  };
}

async function saveStudentProgress(lessonNumber, updates = {}) {
  const current = getCurrentStudent();
  if (!current || !current.id) return null;

  const key = Number(lessonNumber);
  const existing = getLessonProgress(current, key);

  const mergedLesson = {
    ...existing,
    ...updates
  };

  mergedLesson.quizPassed = !!mergedLesson.quizPassed;
  mergedLesson.scenarioCompleted = !!mergedLesson.scenarioCompleted;
  mergedLesson.quizScore = Number(mergedLesson.quizScore || 0);
  mergedLesson.attempts = Number(mergedLesson.attempts || 0);
  mergedLesson.scenarioPassedCount = Number(
    mergedLesson.scenarioPassedCount ??
    (mergedLesson.scenarioCompleted ? 2 : 0)
  );

  mergedLesson.lessonTimeMinutes = clampMinutes(mergedLesson.lessonTimeMinutes);

  if (mergedLesson.quizPassed && !mergedLesson.startedAt) {
    mergedLesson.startedAt = todayString();
  }

  if (mergedLesson.quizPassed && mergedLesson.scenarioCompleted && !mergedLesson.completedAt) {
    mergedLesson.completedAt = todayString();
  }

  const nextProgress = {
    ...current.progress,
    [key]: mergedLesson
  };

  const derived = buildDerivedStudent(current, nextProgress);

  const payload = {
    progress: nextProgress,
    completedLessons: derived.completedLessons,
    progressPercent: derived.progressPercent,
    progressLabel: derived.progressLabel,
    adminProgressLabel: derived.adminProgressLabel,
    startDate: derived.startDate,
    completionDate: derived.completionDate,
    totalOnlineMinutes: derived.totalOnlineMinutes,
    updatedAt: serverTimestamp()
  };

  try {
    const ref = doc(db, STUDENTS_COLLECTION, current.id);
    await updateDoc(ref, payload);

    return setCurrentStudent({
      ...current,
      progress: nextProgress,
      completedLessons: derived.completedLessons,
      progressPercent: derived.progressPercent,
      progressLabel: derived.progressLabel,
      adminProgressLabel: derived.adminProgressLabel,
      startDate: derived.startDate,
      completionDate: derived.completionDate,
      totalOnlineMinutes: derived.totalOnlineMinutes
    });
  } catch (error) {
    console.error("Failed to save student progress:", error);
    return current;
  }
}

async function markLessonContentViewed(lessonNumber) {
  const current = getCurrentStudent();
  const existing = getLessonProgress(current, lessonNumber);

  return saveStudentProgress(lessonNumber, {
    contentViewed: true,
    lessonStartedAt: existing.lessonStartedAt || nowIso(),
    lessonLastSeenAt: nowIso()
  });
}

async function recordLessonTime(lessonNumber, minutesToAdd = 1) {
  const current = getCurrentStudent();
  const existing = getLessonProgress(current, lessonNumber);

  return saveStudentProgress(lessonNumber, {
    lessonTimeMinutes: clampMinutes(existing.lessonTimeMinutes + minutesToAdd),
    lessonStartedAt: existing.lessonStartedAt || nowIso(),
    lessonLastSeenAt: nowIso()
  });
}

async function markLessonScenariosComplete(lessonNumber, scenarioPassedCount = 2) {
  const current = getCurrentStudent();
  const existing = getLessonProgress(current, lessonNumber);

  return saveStudentProgress(lessonNumber, {
    scenarioCompleted: true,
    scenarioPassedCount: Math.max(2, Number(scenarioPassedCount || 2)),
    scenarioStartedAt: existing.scenarioStartedAt || nowIso(),
    scenarioCompletedAt: nowIso()
  });
}

async function markLessonQuizStarted(lessonNumber) {
  const current = getCurrentStudent();
  const existing = getLessonProgress(current, lessonNumber);

  return saveStudentProgress(lessonNumber, {
    quizStartedAt: existing.quizStartedAt || nowIso()
  });
}

async function markLessonQuizResult(lessonNumber, quizScore, attempts = null, missedQuestions = []) {
  const score = Number(quizScore || 0);
  const passed = score >= 80;

  const current = getCurrentStudent();
  const existing = getLessonProgress(current, lessonNumber);

  return saveStudentProgress(lessonNumber, {
    quizPassed: passed,
    quizScore: score,
    attempts: attempts == null ? Number(existing.attempts || 0) + 1 : Number(attempts || 0),
    missedQuestions: Array.isArray(missedQuestions) ? missedQuestions : [],
    quizStartedAt: existing.quizStartedAt || nowIso(),
    quizCompletedAt: nowIso()
  });
}

window.BSA = {
  loginStudent,
  getCurrentStudent,
  clearCurrentStudent,
  refreshCurrentStudentFromFirestore,
  getLessonProgress,
  getStudentLessonState,
  getOverallCompletionCount,
  saveStudentProgress,
  markLessonContentViewed,
  recordLessonTime,
  markLessonScenariosComplete,
  markLessonQuizStarted,
  markLessonQuizResult
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
  saveStudentProgress,
  markLessonContentViewed,
  recordLessonTime,
  markLessonScenariosComplete,
  markLessonQuizStarted,
  markLessonQuizResult
};
