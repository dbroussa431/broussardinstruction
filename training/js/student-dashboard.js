import { db } from "./firebase-config.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const TOTAL_LESSONS = 8;

const lessonCatalog = [
  { id: "lesson1", title: "Lesson 1 - Firearm Safety Foundations", description: "Core safety rules and safe handling.", href: "lessons/lesson1.html" },
  { id: "lesson2", title: "Lesson 2 - Types of Handguns and Parts", description: "Revolvers, pistols, and major parts.", href: "lessons/lesson2.html" },
  { id: "lesson3", title: "Lesson 3 - Ammunition Knowledge", description: "Cartridge basics, caliber, and ammo safety.", href: "lessons/lesson3.html" },
  { id: "lesson4", title: "Lesson 4 - Fundamentals of Marksmanship", description: "Grip, stance, sights, and trigger press.", href: "lessons/lesson4.html" },
  { id: "lesson5", title: "Lesson 5 - Loading, Unloading, and Malfunctions", description: "Safe loading and malfunction handling.", href: "lessons/lesson5.html" },
  { id: "lesson6", title: "Lesson 6 - Cleaning, Storage, and Responsibility", description: "Maintenance, storage, and safe ownership.", href: "lessons/lesson6.html" },
  { id: "lesson7", title: "Lesson 7 - Law, Judgment, and Defensive Mindset", description: "Mindset, law, and responsible decisions.", href: "lessons/lesson7.html" },
  { id: "lesson8", title: "Lesson 8 - Final Review and Readiness", description: "Course wrap-up and readiness review.", href: "lessons/lesson8.html" }
];

const loadingView = document.getElementById("loadingView");
const errorView = document.getElementById("errorView");
const dashboardView = document.getElementById("dashboardView");
const errorTitle = document.getElementById("errorTitle");
const errorText = document.getElementById("errorText");

const welcomeTitle = document.getElementById("welcomeTitle");
const studentNameValue = document.getElementById("studentNameValue");
const accessCodeValue = document.getElementById("accessCodeValue");
const tierValue = document.getElementById("tierValue");
const statusValue = document.getElementById("statusValue");
const progressLabelText = document.getElementById("progressLabelText");
const progressFill = document.getElementById("progressFill");
const completedCountValue = document.getElementById("completedCountValue");
const totalLessonsValue = document.getElementById("totalLessonsValue");
const timeSpentValue = document.getElementById("timeSpentValue");
const lessonsGrid = document.getElementById("lessonsGrid");

const backToLoginBtn = document.getElementById("backToLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");

function clearSession() {
  sessionStorage.clear();
}

function getSession() {
  return {
    loggedIn: sessionStorage.getItem("bsaLoggedIn") === "true",
    studentId: sessionStorage.getItem("bsaStudentId") || "",
    accessCode: sessionStorage.getItem("bsaAccessCode") || "",
    tier: sessionStorage.getItem("bsaTier") || "",
    status: sessionStorage.getItem("bsaPortalStatus") || "",
    name: sessionStorage.getItem("bsaStudentName") || ""
  };
}

function showError(title, text) {
  loadingView.classList.add("hidden");
  dashboardView.classList.add("hidden");
  errorView.classList.remove("hidden");
  errorTitle.textContent = title;
  errorText.textContent = text;
}

function showDashboard() {
  loadingView.classList.add("hidden");
  errorView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
}

function normalizeStatus(value) {
  const s = String(value || "").trim().toLowerCase();
  return ["active", "locked", "expired"].includes(s) ? s : "active";
}

function getCompletedLessons(student) {
  if (Array.isArray(student.completedLessons) && student.completedLessons.length) {
    return student.completedLessons
      .map(v => String(v).trim().toLowerCase())
      .filter(v => /^lesson[1-8]$/.test(v));
  }

  if (student.progress && typeof student.progress === "object") {
    return Object.keys(student.progress)
      .filter(key => student.progress[key] === true)
      .map(key => String(key).trim().toLowerCase())
      .filter(v => /^lesson[1-8]$/.test(v));
  }

  return [];
}

function getTimeSpentSeconds(student) {
  if (typeof student.totalTimeSpentSeconds === "number") return student.totalTimeSpentSeconds;
  if (typeof student.timeSpentSeconds === "number") return student.timeSpentSeconds;
  if (typeof student.totalSecondsSpent === "number") return student.totalSecondsSpent;
  if (typeof student.minutesSpent === "number") return student.minutesSpent * 60;
  return 0;
}

function formatSeconds(seconds) {
  const total = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

function computeLessonStates(completedLessons, studentStatus) {
  const completedSet = new Set(completedLessons);
  const normalizedStatus = normalizeStatus(studentStatus);
  let firstIncompleteFound = false;

  return lessonCatalog.map((lesson) => {
    const completed = completedSet.has(lesson.id.toLowerCase());
    let unlocked = false;

    if (normalizedStatus !== "active") {
      unlocked = completed;
    } else if (completed) {
      unlocked = true;
    } else if (!firstIncompleteFound) {
      unlocked = true;
      firstIncompleteFound = true;
    }

    return {
      ...lesson,
      completed,
      unlocked,
      locked: !unlocked
    };
  });
}

function renderLessons(lessonStates) {
  lessonsGrid.innerHTML = lessonStates.map((lesson) => {
    let pillClass = "locked";
    let pillText = "Locked";

    if (lesson.completed) {
      pillClass = "completed";
      pillText = "Completed";
    } else if (lesson.unlocked) {
      pillClass = "active";
      pillText = "Ready";
    }

    const actionHtml = lesson.completed
      ? `<a class="go-btn" href="${lesson.href}">Review Lesson</a>`
      : lesson.unlocked
        ? `<a class="go-btn" href="${lesson.href}">Start Lesson</a>`
        : `<button class="disabled-btn" type="button" disabled>Locked</button>`;

    return `
      <div class="lesson-card">
        <div class="lesson-top">
          <h3 class="lesson-title">${lesson.title}</h3>
          <span class="pill ${pillClass}">${pillText}</span>
        </div>
        <p class="lesson-desc">${lesson.description}</p>
        <div class="lesson-action">${actionHtml}</div>
      </div>
    `;
  }).join("");
}

async function loadDashboard() {
  const session = getSession();

  if (!session.loggedIn || !session.studentId || !session.accessCode) {
    showError("Session not found", "Please go back and log in again.");
    return;
  }

  try {
    const ref = doc(db, "portalStudents", session.studentId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      showError("Student record not found", "Your dashboard record could not be loaded.");
      return;
    }

    const data = snap.data() || {};
    const storedCode = String(data.accessCode || "").trim().toUpperCase();
    const sessionCode = String(session.accessCode || "").trim().toUpperCase();

    if (storedCode !== sessionCode) {
      showError("Access mismatch", "Your current access code does not match the student record. Please log in again.");
      return;
    }

    const studentName = data.name || session.name || "Student";
    const tier = String(data.tier || session.tier || "").toUpperCase();
    const status = normalizeStatus(data.status || session.status);
    const completedLessons = getCompletedLessons(data);
    const completedCount = completedLessons.length;
    const timeSpent = getTimeSpentSeconds(data);

    welcomeTitle.textContent = `Welcome, ${studentName}`;
    studentNameValue.textContent = studentName;
    accessCodeValue.textContent = storedCode;
    tierValue.textContent = tier || "—";
    statusValue.textContent = status;
    progressLabelText.textContent = `Completed ${completedCount} of ${TOTAL_LESSONS} lessons`;
    progressFill.style.width = `${Math.round((completedCount / TOTAL_LESSONS) * 100)}%`;
    completedCountValue.textContent = String(completedCount);
    totalLessonsValue.textContent = String(TOTAL_LESSONS);
    timeSpentValue.textContent = formatSeconds(timeSpent);

    const lessonStates = computeLessonStates(completedLessons, status);
    renderLessons(lessonStates);

    showDashboard();
  } catch (error) {
    console.error(error);
    showError("Unable to load dashboard", "There was a problem loading your training dashboard.");
  }
}

backToLoginBtn?.addEventListener("click", () => {
  clearSession();
  window.location.href = "index.html";
});

logoutBtn?.addEventListener("click", () => {
  clearSession();
  window.location.href = "index.html";
});

refreshBtn?.addEventListener("click", () => {
  window.location.reload();
});

loadDashboard();
