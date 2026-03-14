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
const ADMIN_UNLOCK_CODE = "BSA-UNLOCK-2026"; // CHANGE THIS

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

  const normalizedProgress = {};
  if (student.progress && typeof student.progress === "object") {
    for (const [key, value] of Object.entries(student.progress)) {
      normalizedProgress[Number(key)] = { ...(value || {}) };
    }
  }

  return {
    id: student.id || "",
    name: String(student.name || "").trim(),
    email: String(student.email || "").trim().toLowerCase(),
    accessCode: String(student.accessCode || "").trim().toUpperCase(),
    tier: String(student.tier || "FULL").toUpperCase(),
    paid: !!student.paid,
    status: String(student.status || "active"),
    progress: normalizedProgress,
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

function getConsecutiveFails(lessonId) {
  const progress = getLessonProgress(lessonId);
  return Number(progress.consecutiveFails || 0);
}

function getLockRemainingMs(lessonId) {
  const progress = getLessonProgress(lessonId);
  if (!progress.lockUntil) return 0;

  const remaining = new Date(progress.lockUntil).getTime() - Date.now();
  return remaining > 0 ? remaining : 0;
}

function isAdminLocked(lessonId) {
  const progress = getLessonProgress(lessonId);
  return progress.adminLocked === true;
}

function formatCountdown(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
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

  if (progress.quizPassed) {
    return { locked: false, kind: null, text: "" };
  }

  if (progress.adminLocked) {
    return {
      locked: true,
      kind: "hard",
      text: "Instructor unlock required"
    };
  }

  const remaining = progress.lockUntil
    ? new Date(progress.lockUntil).getTime() - Date.now()
    : 0;

  if (remaining > 0) {
    const failCount = Number(progress.consecutiveFails || 0);
    return {
      locked: true,
      kind: failCount === 1 ? "short" : "day",
      text: failCount === 1 ? `15 min lock` : `24 hr lock`
    };
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

async function adminUnlockLesson(lessonId, codeEntered) {
  if (String(codeEntered || "").trim() !== ADMIN_UNLOCK_CODE) return false;

  await updateCurrentStudent((student) => {
    student.progress ||= {};
    student.progress[lessonId] ||= {};

    student.progress[lessonId].adminLocked = false;
    student.progress[lessonId].lockUntil = null;
    student.progress[lessonId].consecutiveFails = 0;
  });

  return true;
}

async function recordQuizResult(lessonId, score, details) {
  return updateCurrentStudent((student) => {
    student.progress ||= {};
    student.progress[lessonId] ||= {};

    const p = student.progress[lessonId];
    const passed = score >= PASSING_SCORE;
    const currentFails = Number(p.consecutiveFails || 0);
    const nextFails = passed ? 0 : currentFails + 1;

    p.attemptCount = Number(p.attemptCount || 0) + 1;
    p.quizScore = score;
    p.quizDetails = Array.isArray(details) ? details : [];
    p.quizPassed = passed;
    p.lastAttemptAt = new Date().toISOString();
    p.consecutiveFails = nextFails;

    // reset / set locks
    p.lockUntil = null;
    p.adminLocked = false;

    if (!passed) {
      if (nextFails === 1) {
        p.lockUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      } else if (nextFails === 2) {
        p.lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      } else if (nextFails >= 3) {
        p.adminLocked = true;
        p.lockUntil = null;
      }
    }

    if (passed && !student.completedLessons.includes(lessonId)) {
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

function getDashboardLessonStatus(student, lessonId) {
  const progress = student.progress?.[lessonId] || {};
  const access = isLessonAccessible(student, lessonId);
  const lock = getLessonLockState(student, lessonId);

  if (!access) {
    return {
      className: "locked",
      text: "Complete previous lesson"
    };
  }

  if (progress.quizPassed) {
    return {
      className: "passed",
      text: `Passed (${progress.quizScore || PASSING_SCORE}%)`
    };
  }

  if (lock.locked) {
    return {
      className: "locked",
      text: lock.text
    };
  }

  if (progress.contentViewed || progress.scenarioCompleted || Number(progress.attemptCount || 0) > 0) {
    return {
      className: "in-progress",
      text: "In Progress"
    };
  }

  return {
    className: "not-started",
    text: "Ready"
  };
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

  const estimatedTimes = {
    1: "18 min",
    2: "20 min",
    3: "22 min",
    4: "20 min",
    5: "24 min",
    6: "18 min",
    7: "16 min",
    8: "15 min"
  };

  const lessonDescriptions = {
    1: "Universal safety rules, muzzle direction, clearance checks, and safe handling principles.",
    2: "Color codes of awareness, avoidance, movement, barriers, and recognizing possible threats.",
    3: "Actions, magazines, ammunition basics, and common firearm understanding.",
    4: "Grip, sight alignment, target focus, and defensive accuracy concepts.",
    5: "Reasonable force, de-escalation, retreat principles, and defensive decision-making.",
    6: "Fight-or-flight effects, tunnel vision, auditory exclusion, memory gaps, and command presence.",
    7: "Safe rooms, communication plans, home hardening, and family defense considerations.",
    8: "Final knowledge review, range expectations, mindset, safety, and next-step preparation."
  };

  for (let i = 1; i <= TOTAL_LESSONS; i++) {
    const progress = student.progress?.[i] || {};
    const access = isLessonAccessible(student, i);
    const lock = getLessonLockState(student, i);

    let statusClass = "locked";
    let statusText = "Locked";

    if (!access) {
      statusClass = "locked";
      statusText = "Complete previous lesson";
    } else if (progress.quizPassed) {
      statusClass = "passed";
      statusText = `Passed • ${progress.quizScore || PASSING_SCORE}%`;
    } else if (lock.locked) {
      statusClass = "locked";
      statusText = lock.text || "Locked";
    } else if (progress.contentViewed || progress.scenarioCompleted || Number(progress.attemptCount || 0) > 0) {
      statusClass = "in-progress";
      statusText = "Ready for Quiz";
    } else {
      statusClass = "not-started";
      statusText = "Ready";
    }

    const card = document.createElement("div");
    card.className = "lesson-card";

    const canOpenLesson = access;
    const canOpenScenario = access && !lock.locked;
    const canOpenQuiz = access && !lock.locked;
    const passed = !!progress.quizPassed;

    card.innerHTML = `
      <div class="lesson-top">
        <div style="display:flex; gap:12px; align-items:flex-start;">
          <div class="lesson-num">${i}</div>
          <div>
            <h3 class="lesson-title">${LESSON_TITLES[i]}</h3>
            <p class="lesson-desc">${lessonDescriptions[i] || ""}</p>
          </div>
        </div>
        <span class="status ${statusClass}">${statusText}</span>
      </div>

      <div class="meta-row">
        <span class="chip">Estimated Time: ${estimatedTimes[i] || "20 min"}</span>
        <span class="chip">20-question quiz</span>
        <span class="chip">2 scenarios</span>
        <span class="chip">Attempts: ${Number(progress.attemptCount || 0)}</span>
      </div>

      <div class="lesson-actions">
        ${
          canOpenLesson
            ? `<button class="btn btn-blue" data-action="lesson" data-lesson="${i}">${passed ? "Review Lesson" : "Continue Lesson"}</button>`
            : `<button class="btn btn-blue" disabled>Complete Previous Lesson First</button>`
        }

        ${
          canOpenScenario
            ? `<button class="btn btn-outline" data-action="scenario" data-lesson="${i}">Open Scenarios</button>`
            : ``
        }

        ${
          canOpenQuiz
            ? `<button class="btn btn-outline" data-action="quiz" data-lesson="${i}">Take Quiz</button>`
            : ``
        }

        ${
          passed && progress.quizDetails?.some(x => !x.correct)
            ? `<button class="btn btn-ghost" data-action="review" data-lesson="${i}">See Missed Questions</button>`
            : ``
        }
      </div>
    `;

    card.querySelectorAll("button[data-action]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();

        const lessonId = Number(btn.dataset.lesson);
        const action = btn.dataset.action;

        if (action === "lesson") {
          window.location.href = `lesson.html?lesson=${lessonId}`;
        } else if (action === "scenario") {
          window.location.href = `scenario.html?lesson=${lessonId}`;
        } else if (action === "quiz") {
          window.location.href = `quiz.html?lesson=${lessonId}`;
        } else if (action === "review") {
          window.location.href = `quiz.html?lesson=${lessonId}&review=1`;
        }
      });
    });

    listEl.appendChild(card);
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
  getConsecutiveFails,
  getLockRemainingMs,
  isAdminLocked,
  adminUnlockLesson,
  recordQuizResult,
  randomSample,
  formatCountdown,
  qs,
  requireLogin,
  renderDashboard
};

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("lessonList")) {
    renderDashboard();
  }
});
