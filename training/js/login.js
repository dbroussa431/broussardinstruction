import { loginStudent, getCurrentStudent } from "./app.js";

const form = document.getElementById("loginForm");
const accessCodeInput = document.getElementById("accessCode");
const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");

function showMessage(message, type = "") {
  loginMessage.textContent = message;
  loginMessage.className = "form-message";
  if (type) {
    loginMessage.classList.add(type);
  }
}

function setLoading(isLoading) {
  loginBtn.disabled = isLoading;
  loginBtn.textContent = isLoading ? "Checking Code..." : "Login to Portal";
}

const existingStudent = getCurrentStudent();
if (existingStudent && existingStudent.accessCode && existingStudent.status === "active") {
  window.location.href = "./dashboard.html";
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const code = String(accessCodeInput?.value || "").trim();

  if (!code) {
    showMessage("Please enter your access code.", "error");
    accessCodeInput?.focus();
    return;
  }

  setLoading(true);
  showMessage("");

  try {
    const student = await loginStudent(code);

    if (!student) {
      showMessage("Invalid or inactive access code.", "error");
      return;
    }

    showMessage("Login successful. Redirecting...", "success");
    window.location.href = "./dashboard.html";
  } catch (error) {
    console.error("Login page error:", error);
    showMessage("Unable to log in right now. Please try again.", "error");
  } finally {
    setLoading(false);
  }
});
