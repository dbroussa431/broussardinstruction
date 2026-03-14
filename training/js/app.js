import { db } from "../firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CURRENT_STUDENT_KEY = "bsaPortalCurrentStudent";
const PASSING_SCORE = 80;
const TOTAL_LESSONS = 8;

const LESSON_TITLES = {
  1: "Firearm Safety Basics",
  2: "Defensive Mindset & Awareness",
  3: "Gun Operation & Ammunition",
  4: "Shooting Fundamentals",
  5: "Legal Use of Force",
  6: "Violent Encounters & Aftermath",
  7: "Home Defense Planning",
  8: "Final Review & Range Prep"
};

function normalizeStudent(rawStudent) {
  const student = { ...(rawStudent || {}) };

  return {
    id: student.id || "",
    name: String(student.name || "").trim(),
    email: String(student.email || "").trim().toLowerCase(),
    accessCode: String(student.accessCode || "").trim().toUpperCase(),
    tier: String(student.tier || "FULL").toUpperCase(),
    paid: !!student.paid,
    status: String(student.status || "active"),
    progress: student.progress && typeof student.progress === "object" ? { ...student.progress } : {},
    completedLessons: Array.isArray(student.completedLessons)
      ? [...new Set(student.completedLessons.map(Number).filter(Boolean))]
      : []
  };
}

function setCurrentStudent(student) {
  localStorage.setItem(CURRENT_STUDENT_KEY, JSON.stringify(normalizeStudent(student)));
}

function getCurrentStudent() {
  const raw = localStorage.getItem(CURRENT_STUDENT_KEY);
  return raw ? normalizeStudent(JSON.parse(raw)) : null;
}

function clearActiveStudent() {
  localStorage.removeItem(CURRENT_STUDENT_KEY);
}

async function refreshCurrentStudent() {
  const current = getCurrentStudent();
  if (!current || !current.id) return null;

  const ref = doc(db, "portalStudents", current.id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    clearActiveStudent();
    return null;
  }

  const fresh = normalizeStudent({ id: snap.id, ...snap.data() });
  setCurrentStudent(fresh);
  return fresh;
}

async function loginStudent(code, email = "") {
  const cleanCode = String(code || "").trim().toUpperCase();
  const cleanEmail = String(email || "").trim().toLowerCase();

  const q = query(
    collection(db, "portalStudents"),
    where("accessCode", "==", cleanCode),
    where("email", "==", cleanEmail)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];
  const student = normalizeStudent({ id: docSnap.id, ...docSnap.data() });
  setCurrentStudent(student);
  return student;
}

function getLessonProgress(lessonId) {
  const student = getCurrentStudent();
  if (!student) return {};
  return student.progress?.[lessonId] || {};
}

function getAttemptCount(lessonId) {
  const progress = getLessonProgress(lessonId);
  return Number(progress.attemptCount || 0);
}

function hasPassedLesson(student, lessonId) {
  return !!(
    student.progress?.[lessonId]?.quizPassed ||
    student.completedLessons.includes(lessonId)
  );
}

function completedLessonCount(student) {
  let count = 0;
  for (let i = 1; i <= TOTAL_LESSONS; i++) {
    if (hasPassedLesson(student, i)) count++;
  }
  return count;
}

function isLessonAccessible(student, lessonId) {
  if (lessonId <= 1) return true;
  return hasPassedLesson(student, lessonId - 1);
}

function getLessonLockState(student, lessonId) {
  const progress = student.progress?.[lessonId] || {};
  const attempts = Number(progress.attemptCount || 0);
  const passed = !!progress.quizPassed;

  if (passed) {
    return { locked: false, kind: null, text: "" };
  }

  if (attempts >= 2 && !passed) {
    return { locked: true, kind: "hard", text: "Re-read lesson before retry" };
  }

  return { locked: false, kind: null, text: "" };
}

async function updateCurrentStudent(mutator) {
  const current = await refreshCurrentStudent();
  if (!current || !current.id) return null;

  const updated = normalizeStudent(current);
  mutator(updated);

  const payload = {
    name: updated.name,
    email: updated.email,
    accessCode: updated.accessCode,
    tier: updated.tier,
    paid: updated.paid,
    status: updated.status,
    progress: updated.progress,
    completedLessons: updated.completedLessons
  };

  await updateDoc(doc(db, "portalStudents", updated.id), payload);
  setCurrentStudent(updated);
  return updated;
}

async function setLessonContentViewed(lessonId) {
  return updateCurrentStudent((student) => {
    student.progress ||= {};
    student.progress[lessonId] ||= {};
    student.progress[lessonId].contentViewed = true;
  });
}

async function setScenarioCompleted(lessonId) {
  return updateCurrentStudent((student) => {
    student.progress ||= {};
    student.progress[lessonId] ||= {};
    student.progress[lessonId].scenarioCompleted = true;
  });
}

async function recordQuizResult(lessonId, score, details) {
  return updateCurrentStudent((student) => {
    student.progress ||= {};
    student.progress[lessonId] ||= {};

    const p = student.progress[lessonId];
    p.attemptCount = Number(p.attemptCount || 0) + 1;
    p.quizScore = score;
    p.quizDetails = Array.isArray(details) ? details : [];
    p.quizPassed = score >= PASSING_SCORE;
    p.lastAttemptAt = new Date().toISOString();

    if (score >= PASSING_SCORE && !student.completedLessons.includes(lessonId)) {
      student.completedLessons.push(lessonId);
    }

    if (student.completedLessons.length >= TOTAL_LESSONS) {
      student.status = "online-complete";
    }
  });
}

function randomSample(arr, count) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function requireLogin() {
  const student = getCurrentStudent();
  if (!student) {
    window.location.href = "index.html";
  }
}

async function renderDashboard() {
  const student = await refreshCurrentStudent();
  if (!student) {
    window.location.href = "index.html";
    return;
  }

  const studentName = document.getElementById("studentName");
  const studentEmail = document.getElementById("studentEmail");
  const studentType = document.getElementById("studentType");
  const studentCode = document.getElementById("studentCode");
  const lessonCount = document.getElementById("lessonCount");
  const progressFill = document.getElementById("progressFill");
  const listEl = document.getElementById("lessonList");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!listEl) return;

  const completed = completedLessonCount(student);
  const percent = Math.round((completed / TOTAL_LESSONS) * 100);

  if (studentName) studentName.textContent = student.name || "Student";
  if (studentEmail) studentEmail.textContent = student.email || "—";
  if (studentType) studentType.textContent = `${student.tier} Access • ${student.paid ? "Paid" : "Unpaid"}`;
  if (studentCode) studentCode.textContent = `Code: ${student.accessCode}`;
  if (lessonCount) lessonCount.textContent = `${completed} / ${TOTAL_LESSONS}`;
  if (progressFill) progressFill.style.width = `${percent}%`;

  listEl.innerHTML = "";

  for (let i = 1; i <= TOTAL_LESSONS; i++) {
    const progress = student.progress?.[i] || {};
    const access = isLessonAccessible(student, i);
    const lock = getLessonLockState(student, i);

    let badgeClass = "locked";
    let badgeText = "Locked";

    if (!access) {
      badgeClass = "locked";
      badgeText = "Complete previous lesson";
    } else if (progress.quizPassed) {
      badgeClass = "complete";
      badgeText = `Passed (${progress.quizScore || PASSING_SCORE}%)`;
    } else if (lock.locked) {
      badgeClass = "locked";
      badgeText = lock.text;
    } else if (progress.contentViewed || progress.scenarioCompleted || progress.attemptCount > 0) {
      badgeClass = "inprogress";
      badgeText = "In progress";
    } else {
      badgeClass = "inprogress";
      badgeText = "Ready";
    }

    const row = document.createElement("div");
    row.className = "lesson-item";
    row.innerHTML = `
      <div class="lesson-meta">
        <h3>${i}. ${LESSON_TITLES[i]}</h3>
        <p>Attempts: ${Number(progress.attemptCount || 0)}</p>
      </div>
      <div><span class="badge ${badgeClass}">${badgeText}</span></div>
    `;

    if (access && !lock.locked) {
      row.style.cursor = "pointer";
      row.addEventListener("click", () => {
        window.location.href = `lesson.html?lesson=${i}`;
      });
    }

    listEl.appendChild(row);
  }

  if (logoutBtn) {
    logoutBtn.onclick = () => {
      clearActiveStudent();
      window.location.href = "index.html";
    };
  }
}

window.BSA = {
  PASSING_SCORE,
  loginStudent,
  getCurrentStudent,
  refreshCurrentStudent,
  getLessonProgress,
  setLessonContentViewed,
  setScenarioCompleted,
  getAttemptCount,
  recordQuizResult,
  randomSample,
  qs,
  requireLogin,
  renderDashboard
};

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("lessonList")) {
    renderDashboard();
  }
});
