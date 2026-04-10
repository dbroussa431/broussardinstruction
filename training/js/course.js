import {
  initTracking,
  trackLessonView,
  trackManualActivity,
  logStage,
  stopTracking
} from "./tracking.js";

const SESSION_KEY = "bsaStudentSession";

const courseWelcome = document.getElementById("courseWelcome");
const courseStudentName = document.getElementById("courseStudentName");
const courseStudentCourse = document.getElementById("courseStudentCourse");
const courseStudentProgress = document.getElementById("courseStudentProgress");
const courseStudentStatus = document.getElementById("courseStudentStatus");
const logoutBtn = document.getElementById("logoutBtn");

function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Session parse error:", error);
    return null;
  }
}

function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function goToLogin() {
  window.location.href = "./index.html";
}

function deriveLessonNumber(session) {
  if (Number.isFinite(Number(session?.currentLessonNumber))) {
    return Number(session.currentLessonNumber);
  }

  if (typeof session?.currentLesson === "string") {
    const match = session.currentLesson.match(/(\d+)/);
    if (match) return Number(match[1]);
  }

  const completedLessons = Array.isArray(session?.completedLessons) ? session.completedLessons : [];
  return completedLessons.length + 1 || 1;
}

function deriveProgressLabel(session) {
  if (session?.progressLabel) return session.progressLabel;

  const completedLessons = Array.isArray(session?.completedLessons) ? session.completedLessons : [];
  if (completedLessons.length) {
    return `${completedLessons.length}/10`;
  }

  return "Not Started";
}

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

  if (courseWelcome) courseWelcome.textContent = `Welcome, ${name}`;
  if (courseStudentName) courseStudentName.textContent = name;
  if (courseStudentCourse) courseStudentCourse.textContent = course;
  if (courseStudentProgress) courseStudentProgress.textContent = progressLabel;
  if (courseStudentStatus) courseStudentStatus.textContent = portalStatus;

  if (studentId) {
    try {
      initTracking(studentId, lessonNumber);
      await trackLessonView();
      await logStage("Course Opened");
    } catch (error) {
      console.error("Course tracking init failed:", error);
    }
  }

  const refreshedSession = {
    ...session,
    studentName: name,
    course,
    portalStatus,
    progressLabel,
    currentLessonNumber: lessonNumber,
    lastCourseOpenedAt: new Date().toISOString()
  };

  saveSession(refreshedSession);
}

function bindActivityPings() {
  const events = ["click", "keydown", "mousemove", "scroll", "touchstart"];
  let throttle = false;

  const handler = async () => {
    if (throttle) return;
    throttle = true;

    try {
      await trackManualActivity();
    } catch (error) {
      console.error("Manual activity tracking failed:", error);
    }

    setTimeout(() => {
      throttle = false;
    }, 15000);
  };

  events.forEach((eventName) => {
    window.addEventListener(eventName, handler, { passive: true });
  });

  window.addEventListener("beforeunload", () => {
    stopTracking();
  });
}

logoutBtn?.addEventListener("click", () => {
  stopTracking();
  localStorage.removeItem(SESSION_KEY);
  goToLogin();
});

loadCourse();
bindActivityPings();
