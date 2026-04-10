import { db } from "./firebase-config.js";
import {
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// =========================
// SESSION TRACKING STATE
// =========================

let sessionStart = Date.now();
let currentLesson = null;
let studentId = null;
let lessonStartTime = null;

// =========================
// INIT TRACKING
// =========================

export function initTracking(userId, lessonNumber) {
  studentId = userId;
  currentLesson = lessonNumber;

  sessionStart = Date.now();
  lessonStartTime = Date.now();

  trackActivity(); // initial ping

  console.log("Tracking started:", userId, lessonNumber);
}

// =========================
// TRACK GENERAL ACTIVITY
// =========================

export async function trackActivity() {
  if (!studentId) return;

  try {
    const studentRef = doc(db, "portalStudents", studentId);

    await updateDoc(studentRef, {
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

  } catch (err) {
    console.error("Activity tracking failed:", err);
  }
}

// =========================
// TRACK LESSON VIEW
// =========================

export async function trackLessonView() {
  if (!studentId || !currentLesson) return;

  try {
    const studentRef = doc(db, "portalStudents", studentId);

    await updateDoc(studentRef, {
      [`progress.${currentLesson}.contentViewed`]: true,
      [`progress.${currentLesson}.lastActivityAt`]: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    });

  } catch (err) {
    console.error("Lesson view tracking failed:", err);
  }
}

// =========================
// TRACK QUIZ START
// =========================

export async function trackQuizStart() {
  if (!studentId || !currentLesson) return;

  try {
    const studentRef = doc(db, "portalStudents", studentId);

    await updateDoc(studentRef, {
      [`progress.${currentLesson}.attempts`]: increment(1),
      [`progress.${currentLesson}.lastActivityAt`]: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    });

  } catch (err) {
    console.error("Quiz start tracking failed:", err);
  }
}

// =========================
// TRACK QUIZ TIME
// =========================

export async function trackQuizTime(seconds) {
  if (!studentId || !currentLesson) return;

  try {
    const studentRef = doc(db, "portalStudents", studentId);

    await updateDoc(studentRef, {
      [`progress.${currentLesson}.quizTimeSeconds`]: increment(seconds),
      totalQuizTimeSeconds: increment(seconds),
      lastLoginAt: serverTimestamp()
    });

  } catch (err) {
    console.error("Quiz time tracking failed:", err);
  }
}

// =========================
// TRACK LESSON COMPLETE
// =========================

export async function trackLessonComplete() {
  if (!studentId || !currentLesson) return;

  try {
    const studentRef = doc(db, "portalStudents", studentId);
    const studentSnap = await getDoc(studentRef);
    const data = studentSnap.data();

    const completedLessons = data.completedLessons || [];

    if (!completedLessons.includes(currentLesson)) {
      completedLessons.push(currentLesson);
    }

    await updateDoc(studentRef, {
      completedLessons: completedLessons,
      currentLessonNumber: currentLesson + 1,
      [`progress.${currentLesson}.completedAt`]: serverTimestamp(),
      [`progress.${currentLesson}.lastActivityAt`]: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    });

  } catch (err) {
    console.error("Lesson complete tracking failed:", err);
  }
}

// =========================
// TRACK FINAL EVALUATION
// =========================

export async function trackFinalResult(result) {
  if (!studentId) return;

  try {
    const studentRef = doc(db, "portalStudents", studentId);

    await updateDoc(studentRef, {
      finalEvaluationStatus: result,
      lastLoginAt: serverTimestamp()
    });

  } catch (err) {
    console.error("Final result tracking failed:", err);
  }
}

// =========================
// AUTO TIME TRACKER
// =========================

setInterval(() => {
  if (!studentId || !lessonStartTime) return;

  const now = Date.now();
  const seconds = Math.floor((now - lessonStartTime) / 1000);

  if (seconds >= 10) {
    trackQuizTime(seconds);
    lessonStartTime = now;
  }

}, 10000);
