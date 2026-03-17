import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const lessonContent = document.getElementById("lessonContent");
const lessonTitle = document.getElementById("lessonTitle");
const lessonStatus = document.getElementById("lessonStatus");
const markCompleteBtn = document.getElementById("markCompleteBtn");
const backBtn = document.getElementById("backBtn");

const lessonId = document.body.dataset.lessonId;
let studentRef = null;
let startTime = Date.now();
let studentData = null;

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

function getTimeSpentSeconds(student) {
  if (typeof student.totalTimeSpentSeconds === "number") return student.totalTimeSpentSeconds;
  return 0;
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

async function loadLesson() {
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

  studentData = snap.data();

  const completedLessons = getCompletedLessons(studentData);
  const completed = completedLessons.includes(lessonId.toLowerCase());

  lessonStatus.textContent = completed ? "Completed" : "In Progress";
  markCompleteBtn.textContent = completed ? "Save Time and Return" : "Mark Complete";
}

async function saveLessonProgress(markCompleted) {
  if (!studentRef || !studentData) return;

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
  const progress = getProgressObject(studentData);
  const completedLessons = getCompletedLessons(studentData);

  if (markCompleted) {
    progress[lessonId] = true;
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
    }
  }

  const updatedTime = getTimeSpentSeconds(studentData) + elapsedSeconds;

  await updateDoc(studentRef, {
    progress,
    completedLessons,
    totalTimeSpentSeconds: updatedTime,
    updatedAt: new Date().toISOString()
  });
}

markCompleteBtn?.addEventListener("click", async () => {
  markCompleteBtn.disabled = true;
  markCompleteBtn.textContent = "Saving...";

  try {
    await saveLessonProgress(true);
    window.location.href = "../dashboard.html";
  } catch (error) {
    console.error(error);
    markCompleteBtn.disabled = false;
    markCompleteBtn.textContent = "Mark Complete";
  }
});

backBtn?.addEventListener("click", async () => {
  try {
    await saveLessonProgress(false);
  } catch (error) {
    console.error(error);
  }
  window.location.href = "../dashboard.html";
});

loadLesson();
