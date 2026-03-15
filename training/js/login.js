import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");

function showMessage(message, isError = false) {
  loginMessage.textContent = message;
  loginMessage.style.color = isError ? "#b00020" : "#1f6f3f";
}

function setLoading(isLoading) {
  loginBtn.disabled = isLoading;
  loginBtn.textContent = isLoading ? "Logging in..." : "Log In";
}

async function routeUser(user) {
  try {
    const studentRef = doc(db, "students", user.uid);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
      showMessage("Login worked, but no student record was found.", true);
      return;
    }

    const student = studentSnap.data();

    if (student.portalStatus && student.portalStatus.toLowerCase() !== "active") {
      showMessage("Your portal is not active yet. Please contact Broussard Shooting Academy.", true);
      return;
    }

    window.location.href = "./dashboard.html";
  } catch (error) {
    console.error("Routing error:", error);
    showMessage("Logged in, but failed to load your portal record.", true);
  }
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    await routeUser(user);
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showMessage("Enter your email and password.", true);
    return;
  }

  setLoading(true);
  showMessage("");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showMessage("Login successful. Redirecting...");
  } catch (error) {
    console.error("Login error:", error);

    let friendly = "Login failed. Please try again.";

    switch (error.code) {
      case "auth/invalid-email":
        friendly = "That email address is not valid.";
        break;
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        friendly = "Incorrect email or password.";
        break;
      case "auth/too-many-requests":
        friendly = "Too many attempts. Please wait a little and try again.";
        break;
      case "auth/network-request-failed":
        friendly = "Network error. Check your connection and try again.";
        break;
    }

    showMessage(friendly, true);
  } finally {
    setLoading(false);
  }
});
