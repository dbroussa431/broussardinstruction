import { getCurrentStudent } from "./app.js";

const studentName = document.getElementById("studentName");
const studentEmail = document.getElementById("studentEmail");
const studentCode = document.getElementById("studentCode");
const studentTier = document.getElementById("studentTier");
const studentStatus = document.getElementById("studentStatus");
const studentLessons = document.getElementById("studentLessons");
const logoutBtn = document.getElementById("logoutBtn");

function redirectToLogin() {
  window.location.href = "./index.html";
}

function renderStudent(student) {
  if (!student) return;

  studentName.textContent = student.name || "Student";
  studentEmail.textContent = student.email || "No email on file";
  studentCode.textContent = student.accessCode || "N/A";
  studentTier.textContent = student.tier || "FREE";
  studentStatus.textContent = student.status || "active";
  studentLessons.textContent = Array.isArray(student.completedLessons)
    ? student.completedLessons.length
    : 0;
}

async function initDashboard() {
  const cachedStudent = getCurrentStudent();

  if (!cachedStudent || !cachedStudent.accessCode) {
    redirectToLogin();
    return;
  }

  renderStudent(cachedStudent);

  const refreshedStudent = await refreshCurrentStudentFromFirestore();

  if (!refreshedStudent || refreshedStudent.status !== "active") {
    clearCurrentStudent();
    redirectToLogin();
    return;
  }

  renderStudent(refreshedStudent);
}

logoutBtn?.addEventListener("click", () => {
  clearCurrentStudent();
  redirectToLogin();
});

initDashboard();
