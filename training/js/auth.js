const ACCESS_CODES = [
  { code: "BSA-FULL-4821", type: "FULL", paidLabel: "Paid $150", boundTo: null, active: true },
  { code: "BSA-FULL-5937", type: "FULL", paidLabel: "Paid $150", boundTo: null, active: true },
  { code: "BSA-DISC-1184", type: "DISCOUNT", paidLabel: "Paid $100", boundTo: null, active: true },
  { code: "BSA-DISC-2271", type: "DISCOUNT", paidLabel: "Paid $100", boundTo: null, active: true },
  { code: "BSA-FREE-7742", type: "FREE", paidLabel: "Complimentary", boundTo: null, active: true },
  { code: "BSA-FREE-8805", type: "FREE", paidLabel: "Complimentary", boundTo: null, active: true }
];

const ADMIN_UNLOCK_CODES = {
  1: "BSA-UNLOCK-01",
  2: "BSA-UNLOCK-02",
  3: "BSA-UNLOCK-03",
  4: "BSA-UNLOCK-04",
  5: "BSA-UNLOCK-05",
  6: "BSA-UNLOCK-06",
  7: "BSA-UNLOCK-07",
  8: "BSA-UNLOCK-08"
};

function getPortalState() {
  const raw = localStorage.getItem("bsaPortalStateV3");
  if (raw) return JSON.parse(raw);
  const initial = { students: [], codes: ACCESS_CODES };
  localStorage.setItem("bsaPortalStateV3", JSON.stringify(initial));
  return initial;
}

function savePortalState(state) {
  localStorage.setItem("bsaPortalStateV3", JSON.stringify(state));
}

function getActiveStudent() {
  const raw = localStorage.getItem("bsaActiveStudentV3");
  return raw ? JSON.parse(raw) : null;
}

function setActiveStudent(studentId) {
  localStorage.setItem("bsaActiveStudentV3", JSON.stringify({ studentId }));
}

function clearActiveStudent() {
  localStorage.removeItem("bsaActiveStudentV3");
}

function requireActiveStudent() {
  const active = getActiveStudent();
  if (!active) {
    window.location.href = "index.html";
    return null;
  }
  const state = getPortalState();
  const student = state.students.find(s => s.id === active.studentId);
  if (!student) {
    clearActiveStudent();
    window.location.href = "index.html";
    return null;
  }
  return student;
}

function makeStudentRecord(name, email, codeRecord) {
  const lessons = {};
  for (let i = 1; i <= 8; i++) {
    lessons[i] = {
      contentViewed: false,
      scenarioCompleted: false,
      passed: false,
      score: null,
      attempts: 0,
      lockUntil: null,
      hardLocked: false,
      requiresInstructor: false,
      lastMissed: []
    };
  }
  return {
    id: "stu_" + Date.now() + "_" + Math.floor(Math.random() * 100000),
    name,
    email,
    code: codeRecord.code,
    codeType: codeRecord.type,
    paymentStatus: codeRecord.paidLabel,
    createdAt: new Date().toISOString(),
    currentLesson: 1,
    onlineComplete: false,
    rangeScheduled: false,
    rangeComplete: false,
    certificateIssued: false,
    lessons
  };
}

function loginStudent(name, email, code) {
  const state = getPortalState();
  const cleanCode = String(code || "").trim().toUpperCase();
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanName = String(name || "").trim();

  const codeRecord = state.codes.find(c => c.code === cleanCode && c.active);
  if (!codeRecord) return { ok: false, message: "Invalid access code." };

  if (codeRecord.boundTo && codeRecord.boundTo.email !== cleanEmail) {
    return { ok: false, message: "This code is already assigned. Contact instructor." };
  }

  let student = state.students.find(s => s.email === cleanEmail && s.code === cleanCode);
  if (!student) {
    student = makeStudentRecord(cleanName || "Student", cleanEmail, codeRecord);
    state.students.push(student);
    codeRecord.boundTo = { studentId: student.id, name: student.name, email: student.email };
    savePortalState(state);
  }

  setActiveStudent(student.id);
  return { ok: true, student };
}

function getCountdownText(lockUntil) {
  const ms = Math.max(0, new Date(lockUntil).getTime() - Date.now());
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2,"0")}m ${String(s).padStart(2,"0")}s`;
  return `${m}m ${String(s).padStart(2,"0")}s`;
}

function updateStudent(mutator) {
  const active = getActiveStudent();
  const state = getPortalState();
  const idx = state.students.findIndex(s => s.id === active.studentId);
  if (idx === -1) return null;
  mutator(state.students[idx]);
  savePortalState(state);
  return state.students[idx];
}

function markLessonViewed(lessonId) {
  return updateStudent(student => {
    student.lessons[lessonId].contentViewed = true;
    if (student.currentLesson < lessonId) student.currentLesson = lessonId;
  });
}

function markScenarioDone(lessonId) {
  return updateStudent(student => {
    student.lessons[lessonId].scenarioCompleted = true;
  });
}

function isLessonAccessible(student, lessonId) {
  if (lessonId === 1) return true;
  return !!student.lessons[lessonId - 1].passed;
}

function getLessonLockState(student, lessonId) {
  const lesson = student.lessons[lessonId];
  if (lesson.hardLocked) return { locked: true, kind: "hard", text: "Instructor review required" };
  if (lesson.lockUntil) {
    const ms = new Date(lesson.lockUntil).getTime() - Date.now();
    if (ms > 0) return { locked: true, kind: "timer", text: getCountdownText(lesson.lockUntil), lockUntil: lesson.lockUntil };
    lesson.lockUntil = null;
  }
  return { locked: false };
}

function recordQuizResult(lessonId, score, missed) {
  return updateStudent(student => {
    const lesson = student.lessons[lessonId];
    lesson.score = score;
    lesson.lastMissed = missed || [];
    lesson.attempts += 1;
    if (score >= 80) {
      lesson.passed = true;
      lesson.lockUntil = null;
      lesson.hardLocked = false;
      lesson.requiresInstructor = false;
      if (student.currentLesson <= lessonId && lessonId < 8) {
        student.currentLesson = lessonId + 1;
      }
      student.onlineComplete = Object.values(student.lessons).every(l => l.passed);
    } else {
      lesson.passed = false;
      if (lesson.attempts === 1) {
        lesson.lockUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      } else if (lesson.attempts === 2) {
        lesson.lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      } else if (lesson.attempts >= 3) {
        lesson.hardLocked = true;
        lesson.requiresInstructor = true;
        lesson.lockUntil = null;
      }
    }
  });
}

function instructorUnlock(lessonId, code) {
  const expected = ADMIN_UNLOCK_CODES[lessonId];
  if (String(code || "").trim().toUpperCase() !== expected) {
    throw new Error("Invalid instructor unlock code.");
  }
  return updateStudent(student => {
    const lesson = student.lessons[lessonId];
    lesson.hardLocked = false;
    lesson.requiresInstructor = false;
    lesson.lockUntil = null;
    lesson.attempts = 0;
    lesson.lastMissed = [];
  });
}
