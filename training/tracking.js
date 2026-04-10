import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  increment,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let trackingState = {
  studentId: null,
  lessonNumber: null,
  timerHandle: null,
  startedAtMs: null,
  lastTickMs: null
};

function validStudentAndLesson() {
  return !!trackingState.studentId && Number.isFinite(Number(trackingState.lessonNumber));
}

export function initTracking(studentId, lessonNumber) {
  trackingState.studentId = studentId || null;
  trackingState.lessonNumber = Number(lessonNumber);
  trackingState.startedAtMs = Date.now();
  trackingState.lastTickMs = Date.now();

  if (!validStudentAndLesson()) {
    console.warn("Tracking not initialized: missing studentId or lessonNumber.");
    return;
  }

  if (trackingState.timerHandle) {
    clearInterval(trackingState.timerHandle);
  }

  trackingState.timerHandle = setInterval(async () => {
    try {
      await trackTimeSlice();
    } catch (error) {
      console.error("Tracking interval failed:", error);
    }
  }, 15000);
}

export function stopTracking() {
  if (trackingState.timerHandle) {
    clearInterval(trackingState.timerHandle);
    trackingState.timerHandle = null;
  }
}

async function getStudentDocRef() {
  if (!trackingState.studentId) return null;
  return doc(db, "portalStudents", trackingState.studentId);
}

async function trackTimeSlice() {
  if (!validStudentAndLesson()) return;

  const now = Date.now();
  const elapsedSeconds = Math.max(1, Math.floor((now - trackingState.lastTickMs) / 1000));
  trackingState.lastTickMs = now;

  const studentRef = await getStudentDocRef();
  if (!studentRef) return;

  await updateDoc(studentRef, {
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    currentLessonNumber: trackingState.lessonNumber,
    [`progress.${trackingState.lessonNumber}.lastActivityAt`]: serverTimestamp(),
    [`progress.${trackingState.lessonNumber}.totalQuizTimeSeconds`]: increment(elapsedSeconds),
    totalQuizTimeSeconds: increment(elapsedSeconds)
  });
}

export async function trackLessonView() {
  if (!validStudentAndLesson()) return;

  const studentRef = await getStudentDocRef();
  if (!studentRef) return;

  await updateDoc(studentRef, {
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    currentLessonNumber: trackingState.lessonNumber,
    [`progress.${trackingState.lessonNumber}.contentViewed`]: true,
    [`progress.${trackingState.lessonNumber}.lastActivityAt`]: serverTimestamp()
  });
}

export async function trackQuizStart() {
  if (!validStudentAndLesson()) return;

  const studentRef = await getStudentDocRef();
  if (!studentRef) return;

  await updateDoc(studentRef, {
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    currentLessonNumber: trackingState.lessonNumber,
    [`progress.${trackingState.lessonNumber}.attempts`]: increment(1),
    [`progress.${trackingState.lessonNumber}.lastActivityAt`]: serverTimestamp()
  });
}

export async function trackLessonComplete() {
  if (!validStudentAndLesson()) return;

  const studentRef = await getStudentDocRef();
  if (!studentRef) return;

  const snap = await getDoc(studentRef);
  const data = snap.exists() ? (snap.data() || {}) : {};
  const completedLessons = Array.isArray(data.completedLessons) ? [...data.completedLessons] : [];

  if (!completedLessons.includes(trackingState.lessonNumber)) {
    completedLessons.push(trackingState.lessonNumber);
    completedLessons.sort((a, b) => Number(a) - Number(b));
  }

  await updateDoc(studentRef, {
    completedLessons,
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
    currentLessonNumber: trackingState.lessonNumber + 1,
    [`progress.${trackingState.lessonNumber}.completedAt`]: serverTimestamp(),
    [`progress.${trackingState.lessonNumber}.lastActivityAt`]: serverTimestamp()
  });
}

export async function trackFinalResult(result) {
  if (!trackingState.studentId) return;

  const safeResult = String(result || "").trim().toLowerCase();
  const studentRef = await getStudentDocRef();
  if (!studentRef) return;

  await updateDoc(studentRef, {
    finalEvaluationStatus: safeResult || "unknown",
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp()
  });
}

export async function logStage(stageLabel) {
  if (!validStudentAndLesson()) return;

  const safeStage = String(stageLabel || "").trim();
  if (!safeStage) return;

  const studentRef = await getStudentDocRef();
  if (!studentRef) return;

  await updateDoc(studentRef, {
    currentStage: safeStage,
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
    [`progress.${trackingState.lessonNumber}.stage`]: safeStage,
    [`progress.${trackingState.lessonNumber}.lastActivityAt`]: serverTimestamp()
  });
}

export async function trackManualActivity() {
  if (!validStudentAndLesson()) return;

  const studentRef = await getStudentDocRef();
  if (!studentRef) return;

  await updateDoc(studentRef, {
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
    currentLessonNumber: trackingState.lessonNumber,
    [`progress.${trackingState.lessonNumber}.lastActivityAt`]: serverTimestamp()
  });
}
