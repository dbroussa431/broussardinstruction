const SESSION_KEY = "bsaStudentSession";

const courseWelcome = document.getElementById("courseWelcome");
const courseStudentName = document.getElementById("courseStudentName");
const courseStudentCourse = document.getElementById("courseStudentCourse");
const courseStudentProgress = document.getElementById("courseStudentProgress");
const courseStudentStatus = document.getElementById("courseStudentStatus");
const logoutBtn = document.getElementById("logoutBtn");

function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Session parse error:", error);
    return null;
  }
}

function goToLogin() {
  window.location.href = "./index.html";
}

function loadCourse() {
  const session = getSession();

  if (!session) {
    goToLogin();
    return;
  }

  const name = session.studentName || "Student";

  courseWelcome.textContent = `Welcome, ${name}`;
  courseStudentName.textContent = name;
  courseStudentCourse.textContent = session.course || "Training Course";
  courseStudentProgress.textContent = session.progressLabel || "Not Started";
  courseStudentStatus.textContent = session.portalStatus || "Active";
}

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem(SESSION_KEY);
  goToLogin();
});

loadCourse();
