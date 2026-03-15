import {
  getCurrentStudent,
  clearCurrentStudent,
  refreshCurrentStudentFromFirestore,
  getStudentLessonState,
  getOverallCompletionCount
} from "./app.js";

const LESSONS = window.LESSONS || [];
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
  if (state.quizPassed) {
    return `<span class="lesson-badge passed">Passed • ${state.quizScore}%</span>`;
  }

  if (state.unlocked) {
    return `<span class="lesson-badge ready">Ready for Quiz</span>`;
  }

  return `<span class="lesson-badge locked">Locked</span>`;
}

function getLessonButtons(lessonId, state) {
  if (state.quizPassed) {
    return `
      <div class="lesson-actions">
        <a class="lesson-btn primary" href="./lesson.html?lesson=${lessonId}">Continue Lesson</a>
        <a class="lesson-btn" href="./scenario.html?lesson=${lessonId}">Open Scenarios</a>
        <a class="lesson-btn" href="./quiz.html?lesson=${lessonId}">Take Quiz</a>
        <a class="lesson-btn" href="./quiz.html?lesson=${lessonId}&review=missed">See Missed Questions</a>
      </div>
    `;
  }

  if (state.unlocked) {
    return `
      <div class="lesson-actions">
        <a class="lesson-btn primary" href="./lesson.html?lesson=${lessonId}">Continue Lesson</a>
        <a class="lesson-btn" href="./scenario.html?lesson=${lessonId}">Open Scenarios</a>
        <a class="lesson-btn" href="./quiz.html?lesson=${lessonId}">Take Quiz</a>
      </div>
    `;
  }

  return `
    <div class="lesson-actions">
      <button class="lesson-btn disabled" type="button" disabled>Complete Previous Lesson First</button>
    </div>
  `;
}

function renderLessonCard(lesson, state) {
  return `
    <article class="lesson-card">
      <div class="lesson-card-header">
        <div class="lesson-number">${lesson.id}</div>
        ${getLessonBadge(state)}
      </div>

      <h4>${lesson.title}</h4>
      <p>${lesson.summary}</p>

      <div class="lesson-meta">
        <span>${lesson.estTime}</span>
        <span>20-question quiz</span>
        <span>${lesson.scenarios.length} scenarios</span>
        <span>Attempts: ${state.attempts || 0}</span>
      </div>

      ${getLessonButtons(lesson.id, state)}
    </article>
  `;
}

function renderLessons(student) {
  if (!lessonGrid) return;

  if (!LESSONS.length) {
    lessonGrid.innerHTML = `
      <article class="lesson-card">
        <h4>Lesson data not loaded</h4>
        <p>The dashboard loaded, but <code>data.js</code> did not provide lesson data.</p>
      </article>
    `;
    return;
  }

  lessonGrid.innerHTML = LESSONS.map((lesson) => {
    const state = getStudentLessonState(student, lesson.id);
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
  alert("Completion requires all 8 lessons, all scenario reviews, and a quiz score of at least 80% for each lesson.");
});

initDashboard();
