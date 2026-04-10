import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// ========================================
// TRACKING STATE
// ========================================
let trackingState = {
  studentId: null,
  lessonNumber: null,
  timerHandle: null,
  startedAtMs: null,
  lastTickMs: null
};

// ========================================
// INTERNAL HELPERS
// ========================================
function hasValidTrackingContext() {
  return !!trackingState.studentId && Number.isFinite(Number(trackingState.lessonNumber));
}

function getLessonKey() {
  return Number(trackingState.lessonNumber);
}

function resetTimerBase() {
  trackingState.startedAtMs = Date.now();
  trackingState.lastTickMs = Date.now();
}

function clearTrackingTimer() {
  if (trackingState.timerHandle) {
    clearInterval(trackingState.timerHandle);
    trackingState.timerHandle = null;
  }
}

function setTrackingTimer() {
  clearTrackingTimer();

  trackingState.timerHandle = setInterval(async () => {
    try {
      await trackTimeSlice();
    } catch (error) {
      console.error("Tracking interval failed:", error);
    }
  }, 15000);
}

function buildBaseUpdate() {
  return {
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    currentLessonNumber: getLessonKey()
  };
}

function buildProgressPath(field) {
  return `progress.${getLessonKey()}.${field}`;
}

function normalizeFinalResult(result) {
  const safe = String(result || "").trim().toLowerCase();

  if (!safe) return "unknown";
  if (safe.includes("pass")) return "passed";
  if (safe.includes("fail")) return "failed";
  if (safe.includes("critical")) return "critical";

  return safe;
}

async function getStudentDocRef() {
  if (!trackingState.studentId) return null;
  return doc(db, "portalStudents", trackingState.studentId);
}

async function safeUpdate(payload) {
  const studentRef = await getStudentDocRef();
  if (!studentRef) return false;

  try {
    await updateDoc(studentRef, payload);
    return true;
  } catch (error) {
    console.error("Tracking update failed:", error);
    return false;
  }
}

// ========================================
// INIT / STOP / RESET
// ========================================
export function initTracking(studentId, lessonNumber) {
  trackingState.studentId = studentId || null;
  trackingState.lessonNumber = Number(lessonNumber);

  if (!hasValidTrackingContext()) {
    console.warn("Tracking not initialized: missing studentId or lessonNumber.");
    clearTrackingTimer();
    return;
  }

  resetTimerBase();
  setTrackingTimer();

  console.log("Tracking started:", trackingState.studentId, trackingState.lessonNumber);
}

export function stopTracking() {
  clearTrackingTimer();
}

export function resetTracking() {
  clearTrackingTimer();
  trackingState = {
    studentId: null,
    lessonNumber: null,
    timerHandle: null,
    startedAtMs: null,
    lastTickMs: null
  };
}

// ========================================
// AUTO TIME SLICE
// ========================================
async function trackTimeSlice() {
  if (!hasValidTrackingContext()) return;

  const now = Date.now();
  const elapsedSeconds = Math.max(1, Math.floor((now - trackingState.lastTickMs) / 1000));

  if (elapsedSeconds < 1) return;

  trackingState.lastTickMs = now;

  await safeUpdate({
    ...buildBaseUpdate(),
    [buildProgressPath("lastActivityAt")]: serverTimestamp(),
    [buildProgressPath("totalQuizTimeSeconds")]: increment(elapsedSeconds),
    totalQuizTimeSeconds: increment(elapsedSeconds)
  });
}

// ========================================
// GENERAL ACTIVITY
// ========================================
export async function trackActivity() {
  if (!trackingState.studentId) return;

  await safeUpdate({
    ...buildBaseUpdate()
  });
}

export async function trackManualActivity() {
  if (!hasValidTrackingContext()) return;

  await safeUpdate({
    ...buildBaseUpdate(),
    [buildProgressPath("lastActivityAt")]: serverTimestamp()
  });
}

// ========================================
// LESSON VIEW
// ========================================
export async function trackLessonView() {
  if (!hasValidTrackingContext()) return;

  await safeUpdate({
    ...buildBaseUpdate(),
    currentStage: "Lesson Opened",
    [buildProgressPath("contentViewed")]: true,
    [buildProgressPath("stage")]: "Lesson Opened",
    [buildProgressPath("lastActivityAt")]: serverTimestamp()
  });
}

// ========================================
// QUIZ START
// ========================================
export async function trackQuizStart() {
  if (!hasValidTrackingContext()) return;

  resetTimerBase();

  await safeUpdate({
    ...buildBaseUpdate(),
    currentStage: "Quiz Started",
    [buildProgressPath("attempts")]: increment(1),
    [buildProgressPath("stage")]: "Quiz Started",
    [buildProgressPath("lastActivityAt")]: serverTimestamp()
  });
}

// ========================================
// EXPLICIT QUIZ TIME TRACK
// ========================================
export async function trackQuizTime(seconds) {
  if (!hasValidTrackingContext()) return;

  const safeSeconds = Math.max(0, Number(seconds || 0));
  if (!safeSeconds) return;

  await safeUpdate({
    ...buildBaseUpdate(),
    [buildProgressPath("totalQuizTimeSeconds")]: increment(safeSeconds),
    totalQuizTimeSeconds: increment(safeSeconds),
    [buildProgressPath("lastActivityAt")]: serverTimestamp()
  });
}

// ========================================
// LESSON COMPLETE
// ========================================
export async function trackLessonComplete() {
  if (!hasValidTrackingContext()) return;

  const studentRef = await getStudentDocRef();
  if (!studentRef) return;

  try {
    const snap = await getDoc(studentRef);
    const data = snap.exists() ? (snap.data() || {}) : {};
    const completedLessons = Array.isArray(data.completedLessons) ? [...data.completedLessons] : [];

    if (!completedLessons.includes(getLessonKey())) {
      completedLessons.push(getLessonKey());
      completedLessons.sort((a, b) => Number(a) - Number(b));
    }

    await updateDoc(studentRef, {
      ...buildBaseUpdate(),
      completedLessons,
      currentLessonNumber: getLessonKey() + 1,
      currentStage: "Lesson Completed",
      [buildProgressPath("completedAt")]: serverTimestamp(),
      [buildProgressPath("stage")]: "Lesson Completed",
      [buildProgressPath("lastActivityAt")]: serverTimestamp()
    });
  } catch (error) {
    console.error("Lesson complete tracking failed:", error);
  }
}

// ========================================
// FINAL RESULT
// ========================================
export async function trackFinalResult(result) {
  if (!trackingState.studentId) return;

  const safeResult = normalizeFinalResult(result);

  await safeUpdate({
    ...buildBaseUpdate(),
    finalEvaluationStatus: safeResult,
    currentStage: safeResult === "passed"
      ? "Final Passed"
      : safeResult === "critical"
        ? "Critical Fail"
        : "Final Failed"
  });
}

// ========================================
// STAGE LOGGING
// ========================================
export async function logStage(stageLabel) {
  if (!hasValidTrackingContext()) return;

  const safeStage = String(stageLabel || "").trim();
  if (!safeStage) return;

  await safeUpdate({
    ...buildBaseUpdate(),
    currentStage: safeStage,
    [buildProgressPath("stage")]: safeStage,
    [buildProgressPath("lastActivityAt")]: serverTimestamp()
  });
}
