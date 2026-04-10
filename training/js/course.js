import {
  initTracking,
  trackLessonView,
  trackManualActivity,
  logStage,
  stopTracking,
  trackQuizStart,
  trackLessonComplete,
  trackFinalResult
} from "./tracking.js";

const SESSION_KEY = "bsaStudentSession";

// ======================
// DOM
// ======================

const courseWelcome = document.getElementById("courseWelcome");
const courseStudentName = document.getElementById("courseStudentName");
const courseStudentCourse = document.getElementById("courseStudentCourse");
const courseStudentProgress = document.getElementById("courseStudentProgress");
const courseStudentStatus = document.getElementById("courseStudentStatus");
const logoutBtn = document.getElementById("logoutBtn");

// ======================
// SESSION
// ======================

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function goToLogin() {
  window.location.href = "./index.html";
}

// ======================
// DERIVED DATA
// ======================

function deriveLessonNumber(session) {
  if (Number.isFinite(Number(session?.currentLessonNumber))) {
    return Number(session.currentLessonNumber);
  }

  if (typeof session?.currentLesson === "string") {
    const match = session.currentLesson.match(/(\d+)/);
    if (match) return Number(match[1]);
  }

  const completedLessons = Array.isArray(session?.completedLessons)
    ? session.completedLessons
    : [];

  return completedLessons.length + 1 || 1;
}

function deriveProgressLabel(session) {
  if (session?.progressLabel) return session.progressLabel;

  const completedLessons = Array.isArray(session?.completedLessons)
    ? session.completedLessons
    : [];

  if (completedLessons.length) {
    return `${completedLessons.length}/10`;
  }

  return "Not Started";
}

// ======================
// INIT COURSE
// ======================

async function loadCourse() {
  const session = getSession();

  if (!session) {
    goToLogin();
    return;
  }

  const name = session.studentName || session.name || "Student";
  const course = session.course || "Training Course";
  const portalStatus = session.portalStatus || session.status || "Active";
  const progressLabel = deriveProgressLabel(session);
  const lessonNumber = deriveLessonNumber(session);
  const studentId = session.studentId || session.id || null;

  // UI
  if (courseWelcome) courseWelcome.textContent = `Welcome, ${name}`;
  if (courseStudentName) courseStudentName.textContent = name;
  if (courseStudentCourse) courseStudentCourse.textContent = course;
  if (courseStudentProgress) courseStudentProgress.textContent = progressLabel;
  if (courseStudentStatus) courseStudentStatus.textContent = portalStatus;

  // 🔥 START TRACKING
  if (studentId) {
    try {
      initTracking(studentId, lessonNumber);
      await trackLessonView();
      await logStage("Course Opened");
    } catch (error) {
      console.error("Tracking init failed:", error);
    }
  }

  // SAVE SESSION
  saveSession({
    ...session,
    studentName: name,
    course,
    portalStatus,
    progressLabel,
    currentLessonNumber: lessonNumber,
    lastCourseOpenedAt: new Date().toISOString()
  });
}

// ======================
// AUTO ACTIVITY TRACKING
// ======================

function bindActivityPings() {
  const events = ["click", "keydown", "mousemove", "scroll", "touchstart"];
  let throttle = false;

  const handler = async () => {
    if (throttle) return;
    throttle = true;

    try {
      await trackManualActivity();
    } catch (error) {
      console.error("Activity tracking failed:", error);
    }

    setTimeout(() => (throttle = false), 15000);
  };

  events.forEach((event) =>
    window.addEventListener(event, handler, { passive: true })
  );

  window.addEventListener("beforeunload", () => {
    stopTracking();
  });
}

// ======================
// 🔥 CRITICAL: EVENT HOOKS
// ======================

function bindLessonEvents() {

  // QUIZ START
  document.querySelectorAll(".start-quiz-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      await trackQuizStart();
      await logStage("Quiz Started");
    });
  });

  // LESSON COMPLETE
  document.querySelectorAll(".complete-lesson-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      await trackLessonComplete();
      await logStage("Lesson Completed");
    });
  });

  // FINAL PASS
  document.querySelectorAll(".final-pass-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      await trackFinalResult("passed");
      await logStage("Final Passed");
    });
  });

  // FINAL FAIL
  document.querySelectorAll(".final-fail-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      await trackFinalResult("failed");
      await logStage("Final Failed");
    });
  });
}

// ======================
// LOGOUT
// ======================

logoutBtn?.addEventListener("click", () => {
  stopTracking();
  localStorage.removeItem(SESSION_KEY);
  goToLogin();
});

// ======================
// INIT
// ======================

document.addEventListener("DOMContentLoaded", () => {
  loadCourse();
  bindActivityPings();
  bindLessonEvents();
});
