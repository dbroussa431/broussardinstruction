const SESSION_KEY = "bsaStudentSession";

const welcomeHeading = document.getElementById("welcomeHeading");
const studentName = document.getElementById("studentName");
const studentCode = document.getElementById("studentCode");
const portalStatus = document.getElementById("portalStatus");
const progressLabel = document.getElementById("progressLabel");
const courseName = document.getElementById("courseName");
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

function loadDashboard() {
  const session = getSession();

  if (!session) {
    goToLogin();
    return;
  }

  const name = session.studentName || "Student";

  welcomeHeading.textContent = `Welcome, ${name}`;
  studentName.textContent = name;
  studentCode.textContent = session.accessCode || "N/A";
  portalStatus.textContent = session.portalStatus || "Active";
  progressLabel.textContent = session.progressLabel || "Not Started";
  courseName.textContent = session.course || "Training Course";
}

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem(SESSION_KEY);
  goToLogin();
});

loadDashboard();
