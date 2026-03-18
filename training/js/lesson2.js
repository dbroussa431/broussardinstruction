import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const LESSON_ID = "lesson2";
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
    prompt: "Which of the following best states Rule 1 of the universal safety rules?",
    options: [
      "Only treat range guns as loaded",
      "Treat every firearm as if it is loaded",
      "Treat all revolvers as loaded but not semi-autos",
      "Assume a gun is unloaded until you hear otherwise"
    ],
    answer: 1,
    explanation: "Rule 1 is to treat every firearm as if it is loaded."
  },
  {
    prompt: "Why is it unsafe to rely only on someone else saying a gun is unloaded?",
    options: [
      "Because revolvers are always loaded",
      "Because the rules require you to verify condition yourself",
      "Because unloaded guns cannot malfunction",
      "Because it only matters on a range"
    ],
    answer: 1,
    explanation: "The chapter makes clear that reassurance does not replace verification."
  },
  {
    prompt: "Which statement about semi-autos is correct?",
    options: [
      "Magazine removed always means chamber empty",
      "If the slide is forward, the gun must be unloaded",
      "A semi-auto can still have a round chambered after the magazine is removed",
      "Semi-autos do not need inspection before handling"
    ],
    answer: 2,
    explanation: "Removing the magazine does not guarantee the chamber is empty."
  },
  {
    prompt: "Which ammunition component is responsible for ignition when struck?",
    options: ["Casing", "Primer", "Projectile", "Magazine"],
    answer: 1,
    explanation: "The primer is the ignition component."
  },
  {
    prompt: "What leaves the barrel when a round is fired?",
    options: ["The casing", "The primer", "The projectile", "The magazine spring"],
    answer: 2,
    explanation: "The projectile exits the barrel."
  },
  {
    prompt: "Why does Chapter 2 discuss revolver and semi-auto parts in detail?",
    options: [
      "Because naming parts is the entire purpose of self-defense training",
      "Because students need mechanical understanding to handle firearms safely and correctly",
      "Because all guns operate exactly the same",
      "Because firearm parts matter only to gunsmiths"
    ],
    answer: 1,
    explanation: "Mechanical understanding supports safe handling and correct operation."
  },
  {
    prompt: "A click with no shot fired should be treated as:",
    options: [
      "Proof that the gun is unloaded",
      "A normal event that needs no attention",
      "A potential malfunction or ammunition problem",
      "Evidence that the trigger was not pressed"
    ],
    answer: 2,
    explanation: "A click instead of a bang indicates a stoppage or ammunition issue."
  },
  {
    prompt: "What is one main lesson about choosing a defensive firearm?",
    options: [
      "The biggest handgun is always the best choice",
      "Brand reputation is the only thing that matters",
      "Fit, control, purpose, and user ability matter",
      "A gun is suitable if it looks impressive"
    ],
    answer: 2,
    explanation: "The chapter stresses practical fit and intended use."
  },
  {
    prompt: "Why is mixing ammunition types carelessly a bad idea?",
    options: [
      "Because all ammunition performs the same way",
      "Because different loads and calibers can create confusion and safety problems",
      "Because magazines automatically sort ammunition",
      "Because only birdshot is safe indoors"
    ],
    answer: 1,
    explanation: "Students must understand what they are loading and using."
  },
  {
    prompt: "What is the chapter’s overall message about maintenance?",
    options: [
      "A defensive firearm should be ignored until it stops working",
      "Reliability depends in part on proper inspection, cleaning, and maintenance",
      "Only new guns need maintenance",
      "Cleaning is mostly cosmetic"
    ],
    answer: 1,
    explanation: "Reliability requires more than ownership."
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
