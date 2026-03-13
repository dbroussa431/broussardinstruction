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

function renderDashboard() {
  const student = requireActiveStudent();
  if (!student) return;

  document.getElementById("studentName").textContent = student.name;
  document.getElementById("studentEmail").textContent = student.email;
  document.getElementById("studentType").textContent = student.codeType;
  document.getElementById("studentCode").textContent = `Code: ${student.code}`;

  const completed = Object.values(student.lessons).filter(l => l.passed).length;
  const percent = Math.round((completed / 8) * 100);
  document.getElementById("lessonCount").textContent = `${completed} / 8`;
  document.getElementById("progressFill").style.width = `${percent}%`;

  const listEl = document.getElementById("lessonList");
  listEl.innerHTML = "";
  for (let i = 1; i <= 8; i++) {
    const lesson = student.lessons[i];
    const access = isLessonAccessible(student, i);
    const lock = getLessonLockState(student, i);

    let badgeClass = "locked";
    let badgeText = "Locked";
    if (!access) {
      badgeClass = "locked";
      badgeText = "Complete previous lesson";
    } else if (lesson.passed) {
      badgeClass = "complete";
      badgeText = `Passed (${lesson.score}%)`;
    } else if (lock.locked && lock.kind === "timer") {
      badgeClass = "locked";
      badgeText = `Review lock: ${lock.text}`;
    } else if (lock.locked && lock.kind === "hard") {
      badgeClass = "locked";
      badgeText = "See instructor";
    } else if (lesson.contentViewed || lesson.scenarioCompleted) {
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
        <h3>${LESSON_TITLES[i]}</h3>
        <p>Attempts: ${lesson.attempts} ${lock.locked && lock.kind === "timer" ? `• Unlocks in ${lock.text}` : ""}</p>
      </div>
      <div><span class="badge ${badgeClass}">${badgeText}</span></div>
    `;
    if (access && !lock.locked) {
      row.addEventListener("click", () => {
        window.location.href = `lesson.html?lesson=${i}`;
      });
    }
    listEl.appendChild(row);
  }

  document.getElementById("logoutBtn").onclick = () => {
    clearActiveStudent();
    window.location.href = "index.html";
  };
}

function renderAdmin() {
  const table = document.getElementById("studentTableBody");
  if (!table) return;
  const state = getPortalState();
  table.innerHTML = "";

  state.students.forEach(student => {
    const completed = Object.values(student.lessons).filter(l => l.passed).length;
    const current = student.onlineComplete ? "Online Complete" : `Lesson ${student.currentLesson}`;
    let lockText = "No";
    for (let i = 1; i <= 8; i++) {
      const lock = getLessonLockState(student, i);
      if (lock.locked) {
        lockText = lock.kind === "hard" ? `Lesson ${i} - Instructor` : `Lesson ${i} - ${lock.text}`;
        break;
      }
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${student.name}</td>
      <td>${student.email}</td>
      <td>${student.code}</td>
      <td>${student.codeType}</td>
      <td>${student.paymentStatus}</td>
      <td>${current}</td>
      <td>${completed}/8</td>
      <td>${lockText}</td>
      <td>${student.onlineComplete ? "Yes" : "No"}</td>
    `;
    table.appendChild(row);
  });

  document.getElementById("adminCount").textContent = state.students.length;
  document.getElementById("adminPaid").textContent = state.students.filter(s => s.paymentStatus !== "Complimentary").length;
  document.getElementById("adminComplete").textContent = state.students.filter(s => s.onlineComplete).length;
}
const STORAGE_KEY = "bsaPortalStateV3";
const CURRENT_STUDENT_KEY = "bsaPortalCurrentStudent";
const PASSING_SCORE = 80;

function getPortalState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {
    students: [],
    codes: [],
    adminUnlocks: []
  };
}

function savePortalState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function random4() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function generateAccessCode(type) {
  return `BSA-${type}-${random4()}`;
}

function createStudentCode({ name, email, tier, paid }) {
  const state = getPortalState();

  let code;
  do {
    code = generateAccessCode(tier);
  } while (state.students.some(s => s.code === code));

  const student = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    code,
    tier,
    amountDue: tier === "FULL" ? 150 : tier === "DISC" ? 100 : 0,
    paid: !!paid,
    progress: {},
    completedLessons: [],
    lessonLocks: {},
    failCounts: {},
    instructorOverrideRequired: {},
    status: "active",
    createdAt: new Date().toISOString()
  };

  state.students.push(student);
  savePortalState(state);
  return student;
}

function findStudentByCode(code, email = "") {
  const state = getPortalState();
  const cleanCode = String(code || "").trim().toUpperCase();
  const cleanEmail = String(email || "").trim().toLowerCase();

  return state.students.find(s =>
    s.code.toUpperCase() === cleanCode &&
    (!cleanEmail || s.email === cleanEmail)
  ) || null;
}

function setCurrentStudent(student) {
  localStorage.setItem(CURRENT_STUDENT_KEY, JSON.stringify(student));
}

function getCurrentStudent() {
  const raw = localStorage.getItem(CURRENT_STUDENT_KEY);
  return raw ? JSON.parse(raw) : null;
}

function refreshCurrentStudent() {
  const current = getCurrentStudent();
  if (!current) return null;
  const state = getPortalState();
  const fresh = state.students.find(s => s.id === current.id) || null;
  if (fresh) setCurrentStudent(fresh);
  return fresh;
}

function loginStudent(code, email = "") {
  const student = findStudentByCode(code, email);
  if (!student) return null;
  setCurrentStudent(student);
  return student;
}

function logoutStudent() {
  localStorage.removeItem(CURRENT_STUDENT_KEY);
}

function updateCurrentStudent(mutator) {
  const current = getCurrentStudent();
  if (!current) return null;

  const state = getPortalState();
  const idx = state.students.findIndex(s => s.id === current.id);
  if (idx === -1) return null;

  mutator(state.students[idx]);

  savePortalState(state);
  setCurrentStudent(state.students[idx]);
  return state.students[idx];
}

function getLessonProgress(lessonId) {
  const student = refreshCurrentStudent();
  if (!student) return {};
  return student.progress?.[lessonId] || {};
}

function setLessonContentViewed(lessonId) {
  updateCurrentStudent(student => {
    student.progress ||= {};
    student.progress[lessonId] ||= {};
    student.progress[lessonId].contentViewed = true;
  });
}

function setScenarioCompleted(lessonId) {
  updateCurrentStudent(student => {
    student.progress ||= {};
    student.progress[lessonId] ||= {};
    student.progress[lessonId].scenarioCompleted = true;
  });
}

function getAttemptCount(lessonId) {
  const progress = getLessonProgress(lessonId);
  return progress.attemptCount || 0;
}

function recordQuizResult(lessonId, score, details) {
  updateCurrentStudent(student => {
    student.progress ||= {};
    student.progress[lessonId] ||= {};

    const p = student.progress[lessonId];
    p.attemptCount = (p.attemptCount || 0) + 1;
    p.quizScore = score;
    p.quizDetails = details;
    p.quizPassed = score >= PASSING_SCORE;
    p.lastAttemptAt = new Date().toISOString();

    if (score >= PASSING_SCORE && !student.completedLessons.includes(lessonId)) {
      student.completedLessons.push(lessonId);
    }

    if (score < PASSING_SCORE) {
      student.failCounts ||= {};
      student.failCounts[lessonId] = (student.failCounts[lessonId] || 0) + 1;
      if (student.failCounts[lessonId] >= 2) {
        student.instructorOverrideRequired ||= {};
        student.instructorOverrideRequired[lessonId] = false;
      }
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

window.BSA = {
  PASSING_SCORE,
  getPortalState,
  savePortalState,
  createStudentCode,
  generateAccessCode,
  findStudentByCode,
  loginStudent,
  logoutStudent,
  getCurrentStudent,
  refreshCurrentStudent,
  getLessonProgress,
  setLessonContentViewed,
  setScenarioCompleted,
  getAttemptCount,
  recordQuizResult,
  randomSample,
  qs,
  requireLogin() {
    const student = refreshCurrentStudent();
    if (!student) {
      window.location.href = "index.html";
    }
  }
};
