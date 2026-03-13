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

const STORAGE_KEY = "bsaPortalStateV3";
const CURRENT_STUDENT_KEY = "bsaPortalCurrentStudent";
const PASSING_SCORE = 80;
const TOTAL_LESSONS = 8;

function randomId() {
  return (crypto && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function random4() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function generateAccessCode(type) {
  return `BSA-${String(type || "FULL").toUpperCase()}-${random4()}`;
}

function tierLabel(tier) {
  const t = String(tier || "FULL").toUpperCase();
  if (t === "DISC") return "Discount";
  if (t === "FREE") return "Complimentary";
  return "Full";
}

function paymentLabel(student) {
  if (String(student.tier || "").toUpperCase() === "FREE") return "Complimentary";
  return student.paid ? "Paid" : "Unpaid";
}

function createEmptyProgress() {
  return {};
}

function normalizeStudent(rawStudent) {
  const student = { ...(rawStudent || {}) };

  const tier =
    student.tier ||
    student.codeType ||
    "FULL";

  const paid =
    typeof student.paid === "boolean"
      ? student.paid
      : student.paymentStatus
        ? String(student.paymentStatus).toLowerCase() === "paid"
        : String(tier).toUpperCase() === "FREE";

  const progress = student.progress && typeof student.progress === "object"
    ? { ...student.progress }
    : createEmptyProgress();

  // Migrate old `lessons` model into `progress`
  if (student.lessons && typeof student.lessons === "object") {
    for (const [lessonKey, lessonValue] of Object.entries(student.lessons)) {
      const lessonId = Number(lessonKey);
      if (!lessonId) continue;
      progress[lessonId] ||= {};
      progress[lessonId].contentViewed = !!lessonValue.contentViewed;
      progress[lessonId].scenarioCompleted = !!lessonValue.scenarioCompleted;
      progress[lessonId].attemptCount = Number(lessonValue.attempts || lessonValue.attemptCount || 0);
      progress[lessonId].quizScore =
        typeof lessonValue.score === "number"
          ? lessonValue.score
          : (typeof lessonValue.quizScore === "number" ? lessonValue.quizScore : null);
      progress[lessonId].quizPassed = !!lessonValue.passed || !!lessonValue.quizPassed;
      progress[lessonId].quizDetails = lessonValue.quizDetails || [];
    }
  }

  const completedLessons = Array.isArray(student.completedLessons)
    ? [...new Set(student.completedLessons.map(Number).filter(Boolean))]
    : [];

  // Backfill completed lessons from migrated progress
  for (let i = 1; i <= TOTAL_LESSONS; i++) {
    if (progress[i]?.quizPassed && !completedLessons.includes(i)) {
      completedLessons.push(i);
    }
  }

  return {
    id: student.id || randomId(),
    name: String(student.name || "").trim(),
    email: String(student.email || "").trim().toLowerCase(),
    code: String(student.code || "").trim().toUpperCase(),
    tier: String(tier).toUpperCase(),
    amountDue:
      typeof student.amountDue === "number"
        ? student.amountDue
        : String(tier).toUpperCase() === "FULL"
          ? 150
          : String(tier).toUpperCase() === "DISC"
            ? 100
            : 0,
    paid,
    progress,
    completedLessons,
    lessonLocks: student.lessonLocks && typeof student.lessonLocks === "object" ? { ...student.lessonLocks } : {},
    failCounts: student.failCounts && typeof student.failCounts === "object" ? { ...student.failCounts } : {},
    instructorOverrideRequired:
      student.instructorOverrideRequired && typeof student.instructorOverrideRequired === "object"
        ? { ...student.instructorOverrideRequired }
        : {},
    status: student.status || "active",
    createdAt: student.createdAt || new Date().toISOString()
  };
}

function getPortalState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? JSON.parse(raw) : {
    students: [],
    codes: [],
    adminUnlocks: []
  };

  const normalized = {
    students: Array.isArray(parsed.students) ? parsed.students.map(normalizeStudent) : [],
    codes: Array.isArray(parsed.codes) ? parsed.codes : [],
    adminUnlocks: Array.isArray(parsed.adminUnlocks) ? parsed.adminUnlocks : []
  };

  return normalized;
}

function savePortalState(state) {
  const normalized = {
    students: Array.isArray(state.students) ? state.students.map(normalizeStudent) : [],
    codes: Array.isArray(state.codes) ? state.codes : [],
    adminUnlocks: Array.isArray(state.adminUnlocks) ? state.adminUnlocks : []
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
}

function syncPortalState() {
  const state = getPortalState();
  savePortalState(state);
  return state;
}

function createStudentCode({ name, email, tier, paid }) {
  const state = getPortalState();

  let code;
  do {
    code = generateAccessCode(tier);
  } while (state.students.some(s => s.code === code));

  const student = normalizeStudent({
    id: randomId(),
    name: String(name || "").trim(),
    email: String(email || "").trim().toLowerCase(),
    code,
    tier,
    paid: !!paid,
    progress: {},
    completedLessons: [],
    lessonLocks: {},
    failCounts: {},
    instructorOverrideRequired: {},
    status: "active",
    createdAt: new Date().toISOString()
  });

  state.students.push(student);
  savePortalState(state);
  return student;
}

function findStudentByCode(code, email = "") {
  const state = getPortalState();
  const cleanCode = String(code || "").trim().toUpperCase();
  const cleanEmail = String(email || "").trim().toLowerCase();

  return state.students.find(s =>
    s.code === cleanCode &&
    (!cleanEmail || s.email === cleanEmail)
  ) || null;
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

function logoutStudent() {
  clearActiveStudent();
}

function refreshCurrentStudent() {
  const current = getCurrentStudent();
  if (!current) return null;

  const state = getPortalState();
  const fresh = state.students.find(s => s.id === current.id) || null;

  if (fresh) setCurrentStudent(fresh);
  return fresh;
}

function requireActiveStudent() {
  return refreshCurrentStudent();
}

function loginStudent(code, email = "") {
  const student = findStudentByCode(code, email);
  if (!student) return null;
  setCurrentStudent(student);
  return student;
}

function updateCurrentStudent(mutator) {
  const current = getCurrentStudent();
  if (!current) return null;

  const state = getPortalState();
  const idx = state.students.findIndex(s => s.id === current.id);
  if (idx === -1) return null;

  mutator(state.students[idx]);
  state.students[idx] = normalizeStudent(state.students[idx]);

  savePortalState(state);
  setCurrentStudent(state.students[idx]);
  return state.students[idx];
}

function getLessonProgress(lessonId) {
  const student = refreshCurrentStudent();
  if (!student) return {};
  return student.progress?.[lessonId] || {};
}

function getAttemptCount(lessonId) {
  const progress = getLessonProgress(lessonId);
  return Number(progress.attemptCount || 0);
}

function hasPassedLesson(student, lessonId) {
  const s = normalizeStudent(student);
  return !!(s.progress?.[lessonId]?.quizPassed || s.completedLessons.includes(lessonId));
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
  const s = normalizeStudent(student);
  const progress = s.progress?.[lessonId] || {};
  const attempts = Number(progress.attemptCount || 0);
  const passed = !!progress.quizPassed;

  if (passed) {
    return { locked: false, kind: null, text: "" };
  }

  if (s.instructorOverrideRequired?.[lessonId] === true) {
    return { locked: true, kind: "hard", text: "Instructor review required" };
  }

  if (attempts >= 2 && !passed) {
    return { locked: true, kind: "hard", text: "Instructor review required" };
  }

  return { locked: false, kind: null, text: "" };
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

function recordQuizResult(lessonId, score, details) {
  updateCurrentStudent(student => {
    student.progress ||= {};
    student.progress[lessonId] ||= {};

    const p = student.progress[lessonId];
    p.attemptCount = Number(p.attemptCount || 0) + 1;
    p.quizScore = score;
    p.quizDetails = Array.isArray(details) ? details : [];
    p.quizPassed = score >= PASSING_SCORE;
    p.lastAttemptAt = new Date().toISOString();

    if (score >= PASSING_SCORE) {
      if (!student.completedLessons.includes(lessonId)) {
        student.completedLessons.push(lessonId);
      }
      if (student.instructorOverrideRequired) {
        delete student.instructorOverrideRequired[lessonId];
      }
    } else {
      student.failCounts ||= {};
      student.failCounts[lessonId] = Number(student.failCounts[lessonId] || 0) + 1;

      if (student.failCounts[lessonId] >= 2) {
        student.instructorOverrideRequired ||= {};
        student.instructorOverrideRequired[lessonId] = true;
      }
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

function renderDashboard() {
  const student = requireActiveStudent();
  if (!student) return;

  const studentName = document.getElementById("studentName");
  const studentEmail = document.getElementById("studentEmail");
  const studentType = document.getElementById("studentType");
  const studentCode = document.getElementById("studentCode");
  const lessonCount = document.getElementById("lessonCount");
  const progressFill = document.getElementById("progressFill");
  const listEl = document.getElementById("lessonList");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!studentName || !listEl) return;

  studentName.textContent = student.name || "Student";
  if (studentEmail) studentEmail.textContent = student.email || "—";
  if (studentType) {
    studentType.textContent = `${tierLabel(student.tier)} Access • ${paymentLabel(student)}`;
  }
  if (studentCode) {
    studentCode.textContent = `Code: ${student.code}`;
  }

  const completed = completedLessonCount(student);
  const percent = Math.round((completed / TOTAL_LESSONS) * 100);

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
    } else if (lock.locked && lock.kind === "hard") {
      badgeClass = "locked";
      badgeText = "See instructor";
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

function renderAdmin() {
  const table = document.getElementById("studentTableBody");
  if (!table) return;

  const state = getPortalState();
  table.innerHTML = "";

  state.students.forEach(student => {
    const completed = completedLessonCount(student);
    const current = completed >= TOTAL_LESSONS
      ? "Online Complete"
      : `Lesson ${Math.min(completed + 1, TOTAL_LESSONS)}`;

    let lockText = "No";
    for (let i = 1; i <= TOTAL_LESSONS; i++) {
      const lock = getLessonLockState(student, i);
      if (lock.locked) {
        lockText = `Lesson ${i} - ${lock.text}`;
        break;
      }
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${student.name || ""}</td>
      <td>${student.email || ""}</td>
      <td>${student.code || ""}</td>
      <td>${tierLabel(student.tier)}</td>
      <td>${paymentLabel(student)}</td>
      <td>${current}</td>
      <td>${completed}/${TOTAL_LESSONS}</td>
      <td>${lockText}</td>
      <td>${completed >= TOTAL_LESSONS ? "Yes" : "No"}</td>
    `;
    table.appendChild(row);
  });

  const adminCount = document.getElementById("adminCount");
  const adminPaid = document.getElementById("adminPaid");
  const adminComplete = document.getElementById("adminComplete");

  if (adminCount) adminCount.textContent = state.students.length;
  if (adminPaid) adminPaid.textContent = state.students.filter(s => s.paid || s.tier === "FREE").length;
  if (adminComplete) adminComplete.textContent = state.students.filter(s => completedLessonCount(s) >= TOTAL_LESSONS).length;
}

window.BSA = {
  PASSING_SCORE,
  getPortalState,
  savePortalState,
  syncPortalState,
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
  renderDashboard,
  renderAdmin,
  requireLogin() {
    const student = refreshCurrentStudent();
    if (!student) {
      window.location.href = "index.html";
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  syncPortalState();

  if (document.getElementById("lessonList")) {
    renderDashboard();
  }

  if (document.getElementById("studentTableBody")) {
    renderAdmin();
  }
});
