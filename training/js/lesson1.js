import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const LESSON_ID = "lesson1";
const LESSON_NUMBER = 1;
const PASS_PERCENT = 80;

const backBtn = document.getElementById("backBtn");
const quizForm = document.getElementById("quizForm");
const quizContainer = document.getElementById("quizContainer");
const quizResult = document.getElementById("quizResult");
const markCompleteBtn = document.getElementById("markCompleteBtn");

const startTime = Date.now();
let studentRef = null;
let studentData = null;
let passedQuiz = false;

const questions = [
  {
    prompt: "What is the main idea of Chapter 1?",
    options: [
      "A firearm alone solves most defensive problems",
      "Personal defense begins with awareness, planning, and judgment",
      "Home defense is mostly about alarms and locks",
      "Speed matters more than preparation"
    ],
    answer: 1,
    explanation: "The chapter teaches that awareness, planning, and judgment come before tools."
  },
  {
    prompt: "Which focus level is the worst public mindset because you are mentally absent and easy to surprise?",
    options: ["Yellow", "Orange", "White", "Red"],
    answer: 2,
    explanation: "Condition white is inattentive and unsafe in public."
  },
  {
    prompt: "Which focus level should be your normal public baseline?",
    options: ["White", "Yellow", "Orange", "Red"],
    answer: 1,
    explanation: "Relaxed alert awareness is the proper public baseline."
  },
  {
    prompt: "If one specific person or circumstance starts to concern you, which focus level best fits that moment?",
    options: ["White", "Yellow", "Orange", "Red"],
    answer: 2,
    explanation: "Orange means a specific concern has your attention."
  },
  {
    prompt: "Why does the chapter emphasize low-light and transition areas like garages and walkways?",
    options: [
      "Because they are ideal places to stop and check your phone",
      "Because they increase visibility and simplify movement",
      "Because they reduce visibility and create surprise opportunities",
      "Because crime only happens there"
    ],
    answer: 2,
    explanation: "Low-light and transitional spaces increase uncertainty and delay recognition."
  },
  {
    prompt: "What is the lesson behind reaction time versus action time?",
    options: [
      "Reacting is usually faster than acting",
      "If you wait too long to notice trouble, you lose valuable time",
      "Training removes all delay",
      "The first person to speak controls the situation"
    ],
    answer: 1,
    explanation: "Recognition delay is costly. Awareness buys time."
  },
  {
    prompt: "What does 'don’t look like a victim' mean in this lesson?",
    options: [
      "Act hostile toward everyone",
      "Display a weapon to look serious",
      "Project awareness, purpose, and confidence",
      "Avoid eye contact at all costs"
    ],
    answer: 2,
    explanation: "The chapter stresses posture, awareness, and purposeful movement."
  },
  {
    prompt: "Which is the best example of situational awareness?",
    options: [
      "Knowing exits, noticing people, and monitoring change around you",
      "Texting while walking because you know the area",
      "Ignoring a bad feeling unless something obvious happens",
      "Assuming familiar places are automatically safe"
    ],
    answer: 0,
    explanation: "Situational awareness is active observation and understanding."
  },
  {
    prompt: "What home-security mindset does the chapter encourage?",
    options: [
      "Think about your home the way a criminal might examine it",
      "Leave lights off to avoid drawing attention",
      "Trust that familiar neighborhoods do not need security planning",
      "Rely only on luck if something happens"
    ],
    answer: 0,
    explanation: "The chapter pushes you to identify vulnerabilities before someone else does."
  },
  {
    prompt: "Why does the chapter say seconds count?",
    options: [
      "Because outside help may not arrive before the critical moment passes",
      "Because all attacks last exactly one minute",
      "Because panic is the fastest path to survival",
      "Because equipment replaces planning"
    ],
    answer: 0,
    explanation: "Events can unfold fast, and preparedness matters because time may be short."
  }
];

function getSession() {
  return {
    loggedIn: sessionStorage.getItem("bsaLoggedIn") === "true",
    studentId: sessionStorage.getItem("bsaStudentId") || "",
    accessCode: sessionStorage.getItem("bsaAccessCode") || ""
  };
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

function getProgressObject(student) {
  const progress = student.progress && typeof student.progress === "object"
    ? { ...student.progress }
    : {};

  for (let i = 1; i <= 8; i += 1) {
    const key = `lesson${i}`;
    if (typeof progress[key] !== "boolean") progress[key] = false;
  }

  return progress;
}

function getTimeSpentSeconds(student) {
  if (typeof student.totalTimeSpentSeconds === "number") return student.totalTimeSpentSeconds;
  if (typeof student.timeSpentSeconds === "number") return student.timeSpentSeconds;
  if (typeof student.totalSecondsSpent === "number") return student.totalSecondsSpent;
  if (typeof student.minutesSpent === "number") return student.minutesSpent * 60;
  return 0;
}

function isLessonUnlocked(lessonNumber, student) {
  const completed = getCompletedLessons(student);
  if (lessonNumber <= 1) return true;
  return completed.includes(`lesson${lessonNumber - 1}`);
}

function renderQuiz() {
  quizContainer.innerHTML = questions.map((q, index) => `
    <div class="quiz-question">
      <h4>${index + 1}. ${q.prompt}</h4>
      ${q.options.map((option, optionIndex) => `
        <label class="quiz-option">
          <input type="radio" name="q${index}" value="${optionIndex}" />
          ${option}
        </label>
      `).join("")}
    </div>
  `).join("");
}

function gradeQuiz() {
  let correct = 0;
  let feedback = "";

  questions.forEach((q, index) => {
    const selected = document.querySelector(`input[name="q${index}"]:checked`);
    const selectedValue = selected ? Number(selected.value) : -1;
    const isCorrect = selectedValue === q.answer;
    if (isCorrect) correct += 1;

    feedback += `
      <div style="margin-bottom:12px;">
        <strong>Question ${index + 1}:</strong>
        <span class="${isCorrect ? "pass" : "fail"}">${isCorrect ? "Correct" : "Incorrect"}</span><br>
        <span class="muted">${q.explanation}</span>
      </div>
    `;
  });

  const percent = Math.round((correct / questions.length) * 100);
  passedQuiz = percent >= PASS_PERCENT;

  quizResult.style.display = "block";
  quizResult.innerHTML = `
    <div style="margin-bottom:10px;"><strong>Score:</strong> ${correct}/${questions.length} (${percent}%)</div>
    <div style="margin-bottom:14px;" class="${passedQuiz ? "pass" : "fail"}">
      ${passedQuiz ? "Passed — you may complete Lesson 1." : "Not passed yet — review and try again."}
    </div>
    ${feedback}
  `;

  markCompleteBtn.disabled = !passedQuiz;
}

async function loadStudent() {
  const session = getSession();
  if (!session.loggedIn || !session.studentId || !session.accessCode) {
    window.location.href = "../index.html";
    return;
  }

  studentRef = doc(db, "portalStudents", session.studentId);
  const snap = await getDoc(studentRef);
  if (!snap.exists()) {
    window.location.href = "../index.html";
    return;
  }

  studentData = snap.data() || {};

  if (!isLessonUnlocked(LESSON_NUMBER, studentData)) {
    alert("This lesson is still locked. Complete the previous lesson first.");
    window.location.href = "../dashboard.html";
  }
}

async function saveLessonCompletion() {
  if (!studentRef || !studentData) return;

  const elapsedSeconds = Math.max(60, Math.floor((Date.now() - startTime) / 1000));
  const progress = getProgressObject(studentData);
  const completedLessons = getCompletedLessons(studentData);

  progress[LESSON_ID] = true;
  if (!completedLessons.includes(LESSON_ID)) completedLessons.push(LESSON_ID);

  await updateDoc(studentRef, {
    progress,
    completedLessons,
    progressLabel: `Completed ${completedLessons.length} of 8 lessons`,
    totalTimeSpentSeconds: getTimeSpentSeconds(studentData) + elapsedSeconds,
    updatedAt: new Date().toISOString()
  });
}

quizForm.addEventListener("submit", (event) => {
  event.preventDefault();
  gradeQuiz();
});

markCompleteBtn.addEventListener("click", async () => {
  markCompleteBtn.disabled = true;
  markCompleteBtn.textContent = "Saving...";
  try {
    await saveLessonCompletion();
    window.location.href = "../dashboard.html";
  } catch (error) {
    console.error(error);
    markCompleteBtn.disabled = false;
    markCompleteBtn.textContent = "Mark Lesson Complete";
  }
});

backBtn.addEventListener("click", () => {
  window.location.href = "../dashboard.html";
});

renderQuiz();
await loadStudent();
