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
    prompt: "Which focus level is the most dangerous public mindset because you are mentally unaware and easy to surprise?",
    options: ["Yellow", "Orange", "White", "Red"],
    answer: 2,
    explanation: "Condition white is inattentive and mentally absent. The chapter strongly warns against living there in public."
  },
  {
    prompt: "Which focus level should be your normal public baseline?",
    options: ["White", "Yellow", "Orange", "Red"],
    answer: 1,
    explanation: "Relaxed alert awareness is the correct daily public mindset."
  },
  {
    prompt: "If a specific person or situation begins to concern you, which focus level are you moving into?",
    options: ["White", "Yellow", "Orange", "Red"],
    answer: 2,
    explanation: "Orange means a specific concern has your attention."
  },
  {
    prompt: "What is the main lesson behind the chapter’s discussion of reaction time?",
    options: ["People always react faster than they act", "Awareness does not matter if you carry a gun", "The person already acting often has a time advantage", "The safest move is to ignore suspicious behavior"],
    answer: 2,
    explanation: "The chapter emphasizes that reacting is slower than already acting."
  },
  {
    prompt: "Why are parking lots, garages, and low-light transition areas emphasized in the chapter?",
    options: ["They are good places to practice shooting", "They reduce visibility and increase surprise opportunities", "They are always safe when people are nearby", "They only matter during the daytime"],
    answer: 1,
    explanation: "Low-light and transitional spaces create blind spots, distance from help, and delayed recognition."
  },
  {
    prompt: "What does 'don’t look like a victim' mean in this lesson?",
    options: ["Act aggressively toward strangers", "Walk distracted so no one notices you", "Project awareness, purpose, and confidence", "Show a weapon to discourage people"],
    answer: 2,
    explanation: "The chapter’s point is about posture, awareness, and avoiding the appearance of an easy target."
  },
  {
    prompt: "Which is the best example of situational awareness?",
    options: ["Knowing your exits, noticing who is near you, and watching environmental changes", "Reading text messages while walking to your car", "Ignoring a bad feeling because you do not want to seem rude", "Assuming every familiar place is automatically safe"],
    answer: 0,
    explanation: "Situational awareness is active observation, not passive assumption."
  },
  {
    prompt: "What is one major home-security lesson in this chapter?",
    options: ["Leave doors unlocked so you can move faster", "Think about your home the way a criminal might", "Do not use exterior lighting", "A home plan is unnecessary if you own a firearm"],
    answer: 1,
    explanation: "The chapter explicitly pushes the mindset of examining your home for weaknesses."
  },
  {
    prompt: "Why does the chapter say seconds count?",
    options: ["Because help may not arrive before the problem unfolds", "Because every threat waits politely", "Because training removes all delay", "Because only speed matters, not planning"],
    answer: 0,
    explanation: "Emergency events can happen very quickly. Awareness and preparation matter because time can be short."
  },
  {
    prompt: "If you hear a suspicious noise outside your home at night, which response is most in line with the chapter?",
    options: ["Rush outside immediately to challenge whoever is there", "Ignore it and hope it goes away", "Gather information and use a plan instead of acting impulsively", "Open the front door and stand in the doorway"],
    answer: 2,
    explanation: "The lesson favors awareness, planning, and safer information gathering over impulsive exposure."
  },
  {
    prompt: "What is the main purpose of the color-code system in Chapter 1?",
    options: ["To rank firearms by quality", "To describe mental alertness and response readiness", "To classify home alarms", "To identify ammunition types"],
    answer: 1,
    explanation: "The color code is a mindset and awareness model."
  },
  {
    prompt: "Which statement best matches the chapter’s overall message?",
    options: ["A firearm replaces the need for awareness", "Preparation begins after the danger starts", "Personal defense starts with awareness, judgment, and planning", "The safest person is the one who notices the least"],
    answer: 2,
    explanation: "That is the central theme of this chapter."
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
  quizContainer.innerHTML = questions.map((q, index) => {
    const optionsHtml = q.options.map((option, optionIndex) => {
      return `
        <label class="quiz-option">
          <input type="radio" name="q${index}" value="${optionIndex}" />
          ${option}
        </label>
      `;
    }).join("");

    return `
      <div class="quiz-question">
        <h4>${index + 1}. ${q.prompt}</h4>
        ${optionsHtml}
      </div>
    `;
  }).join("");
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
    <div style="margin-bottom:10px;">
      <strong>Score:</strong> ${correct}/${questions.length} (${percent}%)
    </div>
    <div style="margin-bottom:14px;" class="${passedQuiz ? "pass" : "fail"}">
      ${passedQuiz ? "Passed — you may complete Lesson 1." : "Not passed yet — review the lesson and try again."}
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

  if (!completedLessons.includes(LESSON_ID)) {
    completedLessons.push(LESSON_ID);
  }

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
