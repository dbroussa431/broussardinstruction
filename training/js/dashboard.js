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
const logoutBtn = document.getElementById("logoutBtn");

function redirectLogin() {
  window.location.href = "./index.html";
}

function getProgressPercent(count) {
  return Math.round((count / TOTAL_LESSONS) * 100);
}

function getBadge(state) {

  if (state.quizPassed) {
    return `<span class="lesson-badge passed">Passed • ${state.quizScore}%</span>`;
  }

  if (state.unlocked) {
    return `<span class="lesson-badge ready">Ready for Quiz</span>`;
  }

  return `<span class="lesson-badge locked">Locked</span>`;
}

function lessonButtons(lessonId, state) {

  if (state.quizPassed) {
    return `
    <div class="lesson-actions">
      <a class="lesson-btn primary" href="lesson.html?lesson=${lessonId}">Continue Lesson</a>
      <a class="lesson-btn" href="scenario.html?lesson=${lessonId}">Open Scenarios</a>
      <a class="lesson-btn" href="quiz.html?lesson=${lessonId}">Take Quiz</a>
      <a class="lesson-btn" href="quiz.html?lesson=${lessonId}&review=missed">Missed Questions</a>
    </div>
    `;
  }

  if (state.unlocked) {
    return `
    <div class="lesson-actions">
      <a class="lesson-btn primary" href="lesson.html?lesson=${lessonId}">Continue Lesson</a>
      <a class="lesson-btn" href="scenario.html?lesson=${lessonId}">Open Scenarios</a>
      <a class="lesson-btn" href="quiz.html?lesson=${lessonId}">Take Quiz</a>
    </div>
    `;
  }

  return `
  <div class="lesson-actions">
    <button class="lesson-btn disabled" disabled>Complete Previous Lesson</button>
  </div>
  `;
}

function renderLesson(lesson, state) {

  return `
  <div class="lesson-card">

    <div class="lesson-card-header">

      <div class="lesson-number">${lesson.id}</div>

      ${getBadge(state)}

    </div>

    <h4>${lesson.title}</h4>

    <p>${lesson.summary}</p>

    <div class="lesson-meta">

      <span>${lesson.estTime}</span>

      <span>20-question quiz</span>

      <span>${lesson.scenarios.length} scenarios</span>

      <span>Attempts: ${state.attempts || 0}</span>

    </div>

    ${lessonButtons(lesson.id, state)}

  </div>
  `;
}

function renderLessons(student) {

  let html = "";

  LESSONS.forEach(lesson => {

    const state = getStudentLessonState(student, lesson.id);

    html += renderLesson(lesson, state);

  });

  lessonGrid.innerHTML = html;

}

function updateDashboard(student) {

  const completed = getOverallCompletionCount(student);

  progressText.innerText = `${completed} / ${TOTAL_LESSONS} Lessons Passed`;

  progressBar.style.width = `${getProgressPercent(completed)}%`;

  tierPill.innerText = `Tier: ${student.tier}`;

  if (completed === TOTAL_LESSONS) {

    studentStatusText.innerText = "Online Prerequisite Completed";

    certificateStatusText.innerText = "Ready for In-Person Completion";

  } else {

    studentStatusText.innerText = "In Progress";

    certificateStatusText.innerText = "Handed in Person Only";

  }

}

async function init() {

  let student = getCurrentStudent();

  if (!student) {

    redirectLogin();

    return;

  }

  student = await refreshCurrentStudentFromFirestore();

  if (!student) {

    redirectLogin();

    return;

  }

  updateDashboard(student);

  renderLessons(student);

}

logoutBtn.addEventListener("click", () => {

  clearCurrentStudent();

  redirectLogin();

});

init();
