import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const LESSON_ID = "lesson2";
const LESSON_NUMBER = 2;
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
    prompt: "Which statement correctly states Rule 1?",
    options: [
      "Treat every firearm as if it is loaded",
      "Assume range guns are unloaded",
      "Treat only handguns as loaded",
      "Treat guns as safe after the magazine is removed"
    ],
    answer: 0,
    explanation: "Rule 1 applies to all firearms."
  },
  {
    prompt: "Why must you verify a firearm yourself even if someone says it is unloaded?",
    options: [
      "Because only revolvers can be trusted",
      "Because the rules require personal verification",
      "Because unloaded guns cannot hurt anyone",
      "Because that rule applies only in a gun store"
    ],
    answer: 1,
    explanation: "The chapter does not allow casual trust to replace safe verification."
  },
  {
    prompt: "Which statement about semi-autos is true?",
    options: [
      "Magazine removed always means chamber empty",
      "Slide forward always means unloaded",
      "A semi-auto may still have a chambered round after magazine removal",
      "Semi-autos never need visual inspection"
    ],
    answer: 2,
    explanation: "A removed magazine does not guarantee the chamber is empty."
  },
  {
    prompt: "What is the primer’s job?",
    options: [
      "To hold the magazine in place",
      "To ignite the powder when struck",
      "To act as the projectile",
      "To reduce recoil"
    ],
    answer: 1,
    explanation: "The primer is the ignition component."
  },
  {
    prompt: "What leaves the barrel when the firearm is fired?",
    options: ["Magazine", "Casing", "Projectile", "Slide"],
    answer: 2,
    explanation: "The projectile leaves the barrel."
  },
  {
    prompt: "Why does the chapter explain revolver and semi-auto parts?",
    options: [
      "Because part names are more important than safety",
      "Because mechanical understanding supports safe handling",
      "Because all guns operate exactly the same",
      "Because only collectors need to know"
    ],
    answer: 1,
    explanation: "You handle firearms more safely when you understand how they function."
  },
  {
    prompt: "A click instead of a bang should be treated as:",
    options: [
      "Proof the gun is unloaded",
      "A potential malfunction or ammunition issue",
      "A sign the firearm is ready to holster immediately",
      "A harmless sound"
    ],
    answer: 1,
    explanation: "The chapter treats this as a stoppage or ammunition problem."
  },
  {
    prompt: "What is one key principle when choosing a defensive firearm?",
    options: [
      "The largest firearm is always best",
      "Fit, control, purpose, and user ability matter",
      "Brand alone determines suitability",
      "Weight never matters"
    ],
    answer: 1,
    explanation: "The book emphasizes practical use, fit, and control."
  },
  {
    prompt: "Why is mixing ammunition types carelessly dangerous?",
    options: [
      "Because all ammunition behaves exactly the same",
      "Because confusion over caliber or load can create safety and judgment problems",
      "Because shells automatically sort themselves",
      "Because only slugs are safe for storage"
    ],
    answer: 1,
    explanation: "Students must know what they are loading and why."
  },
  {
    prompt: "What is the chapter’s message about maintenance and storage?",
    options: [
      "Defensive firearms should be ignored unless they fail",
      "Reliability depends in part on proper maintenance, inspection, and storage",
      "Cleaning is cosmetic only",
      "New guns never need checking"
    ],
    answer: 1,
    explanation: "Reliability and readiness depend on proper care."
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
      ${passedQuiz ? "Passed — you may complete Lesson 2." : "Not passed yet — review and try again."}
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
    alert("Lesson 2 is locked. Complete Lesson 1 first.");
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
