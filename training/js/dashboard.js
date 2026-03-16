import {
  getCurrentStudent,
  clearCurrentStudent,
  refreshCurrentStudentFromFirestore,
  getStudentLessonState,
  getOverallCompletionCount
} from "./app.js";

import { LESSONS } from "./data.js";

const TOTAL_LESSONS = LESSONS.length || 8;

const lessonGrid = document.getElementById("lessonGrid");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const studentStatusText = document.getElementById("studentStatusText");
const certificateStatusText = document.getElementById("certificateStatusText");
const tierPill = document.getElementById("tierPill");
const welcomeHeadline = document.getElementById("welcomeHeadline");
const logoutBtn = document.getElementById("logoutBtn");
const requestLiveSessionBtn = document.getElementById("requestLiveSessionBtn");
const viewRequirementsBtn = document.getElementById("viewRequirementsBtn");

function redirectToLogin() {
  window.location.href = "./index.html";
}

function getStudentDisplayName(student) {
  const fullName = String(student?.name || "").trim();
  if (!fullName) return "Student";
  return fullName.split(" ")[0];
}

function getProgressPercent(count) {
  if (!TOTAL_LESSONS) return 0;
  return Math.max(0, Math.min(100, Math.round((count / TOTAL_LESSONS) * 100)));
}

function getLessonBadge(state) {
  if (state.completed) {
    return `<span class="lesson-badge passed">Completed</span>`;
  }

  if (state.quizPassed && !state.scenarioCompleted) {
    return `<span class="lesson-badge ready">Quiz Passed • Scenarios Pending</span>`;
  }

  if (!state.quizPassed && state.scenarioCompleted) {
    return `<span class="lesson-badge ready">Scenarios Done • Quiz Pending</span>`;
  }

  if (state.unlocked) {
    return `<span class="lesson-badge ready">Ready</span>`;
  }

  return `<span class="lesson-badge locked">Locked</span>`;
}

function getLessonButtons(lessonNumber, state) {
  if (!state.unlocked) {
    return `
      <div class="lesson-actions">
        <button class="lesson-btn disabled" type="button" disabled>Complete Previous Lesson First</button>
      </div>
    `;
  }

  const scenarioLabel = state.scenarioCompleted ? "Review Scenarios" : "Open Scenarios";
  const quizDisabled = !state.scenarioCompleted;
  const quizHref = quizDisabled ? "#" : `./quiz.html?lesson=${lessonNumber}`;

  return `
    <div class="lesson-actions">
      <a class="lesson-btn primary" href="./lesson.html?lesson=${lessonNumber}">Open Lesson</a>
      <a class="lesson-btn" href="./scenario.html?lesson=${lessonNumber}">${scenarioLabel}</a>
      ${
        quizDisabled
          ? `<button class="lesson-btn disabled" type="button" disabled>Finish Scenarios First</button>`
          : `<a class="lesson-btn" href="${quizHref}">${state.quizPassed ? "Retake Quiz" : "Take Quiz"}</a>`
      }
      ${
        state.quizPassed
          ? `<a class="lesson-btn" href="./quiz.html?lesson=${lessonNumber}&review=missed">See Missed Questions</a>`
          : ``
      }
    </div>
  `;
}

function renderLessonCard(lesson, state) {
  const lessonNumber = Number(lesson.lessonNumber);
  const description = String(lesson.description || "");
  const estimatedMinutes = Number(lesson.estimatedMinutes || 20);
  const quizQuestionCount =
    Number(lesson.quizDrawCount || lesson.quizQuestionCount || lesson.quizCount || 20);
  const scenarioPoolCount = Array.isArray(lesson.scenarios) ? lesson.scenarios.length : 0;

  return `
    <article class="lesson-card">
      <div class="lesson-card-header">
        <div class="lesson-number">${lessonNumber}</div>
        ${getLessonBadge(state)}
      </div>

      <h4>${lesson.title}</h4>
      <p>${description}</p>

      <div class="lesson-meta">
        <span>Estimated Time: ${estimatedMinutes} min</span>
        <span>${quizQuestionCount}-question quiz draw</span>
        <span>2 random scenarios from ${scenarioPoolCount || 2}</span>
        <span>Attempts: ${state.attempts || 0}</span>
      </div>

      ${getLessonButtons(lessonNumber, state)}
    </article>
  `;
}

function renderLessons(student) {
  if (!lessonGrid) return;

  lessonGrid.innerHTML = LESSONS.map((lesson) => {
    const state = getStudentLessonState(student, lesson.lessonNumber);
    return renderLessonCard(lesson, state);
  }).join("");
}

function updateHero(student, completedCount) {
  const firstName = getStudentDisplayName(student);

  if (welcomeHeadline) {
    welcomeHeadline.textContent =
      `${firstName}, train on your schedule. Finish your lessons. Then meet in person for live review and range qualification.`;
  }

  if (tierPill) {
    tierPill.textContent = `Tier: ${String(student?.tier || "FREE").toUpperCase()}`;
  }

  if (progressText) {
    progressText.textContent = `${completedCount} / ${TOTAL_LESSONS} Lessons Passed`;
  }

  if (progressBar) {
    progressBar.style.width = `${getProgressPercent(completedCount)}%`;
  }

  if (completedCount >= TOTAL_LESSONS) {
    if (studentStatusText) studentStatusText.textContent = "Online Prerequisite Completed";
    if (certificateStatusText) certificateStatusText.textContent = "Ready for In-Person Completion";
    if (requestLiveSessionBtn) requestLiveSessionBtn.disabled = false;
  } else {
    if (studentStatusText) studentStatusText.textContent = "In Progress";
    if (certificateStatusText) certificateStatusText.textContent = "Handed in Person Only";
    if (requestLiveSessionBtn) requestLiveSessionBtn.disabled = true;
  }
}

async function initDashboard() {
  let student = getCurrentStudent();

  if (!student || !student.accessCode) {
    redirectToLogin();
    return;
  }

  student = await refreshCurrentStudentFromFirestore();

  if (!student || student.status !== "active") {
    clearCurrentStudent();
    redirectToLogin();
    return;
  }

  const completedCount = getOverallCompletionCount(student);

  updateHero(student, completedCount);
  renderLessons(student);
}

logoutBtn?.addEventListener("click", () => {
  clearCurrentStudent();
  redirectToLogin();
});

requestLiveSessionBtn?.addEventListener("click", () => {
  alert("Live review scheduling can be connected next.");
});

viewRequirementsBtn?.addEventListener("click", () => {
  alert("Completion requires all 8 lessons, both randomized scenarios per lesson, and a quiz score of at least 80% for each lesson.");
});

initDashboard();
