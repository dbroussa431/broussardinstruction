import { loginStudent } from "./app.js";

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

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const code = accessCodeInput?.value?.trim() || "";

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
      setLoading(false);
      return;
    }

    showMessage("Login successful. Redirecting...", "success");

    // Change this if your dashboard file name/path is different
    window.location.href = "./dashboard.html";
  } catch (error) {
    console.error("Login page error:", error);
    showMessage("Unable to log in right now. Please try again.", "error");
  } finally {
    setLoading(false);
  }
});
