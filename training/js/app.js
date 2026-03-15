import { db, auth } from "./firebase-config.js"; // Import Firestore and Auth
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"; // Firebase Auth method

const BSA = {
  // Login function with Firebase Auth and Firestore query
  login: async function(accessCode, studentEmail) {
    const msgEl = document.getElementById('loginMsg');
    const code = accessCode.trim().toUpperCase();  // Normalize code to uppercase

    console.log("Login Attempt:", { accessCode, studentEmail });

    // Query Firestore for student data using the access code
    const q = query(
      collection(db, "portalStudents"), // Firestore collection
      where("accessCode", "==", code)   // Query accessCode
    );

    // Fetch student data from Firestore
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      msgEl.classList.remove("hidden");
      msgEl.textContent = "Invalid login credentials.";
      return { ok: false, message: "Invalid login credentials." };
    }

    // Find the student from Firestore by email match
    const matches = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    const student = matches.find(s => s.email.toLowerCase() === studentEmail.toLowerCase());

    if (!student) {
      msgEl.classList.remove("hidden");
      msgEl.textContent = "Student not found.";
      return { ok: false, message: "Student not found." };
    }

    // Successful login, save student data in localStorage
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("student", JSON.stringify(student));
    msgEl.classList.add("hidden"); // Hide error message
    return { ok: true, student }; // Return student data on success
  },

  // Check if user is logged in (via localStorage)
  isLoggedIn: function() {
    const loggedInStatus = localStorage.getItem("loggedIn");
    return loggedInStatus === "true";
  },

  // Get current student data from localStorage
  getCurrentStudent: function() {
    const student = JSON.parse(localStorage.getItem("student"));
    return student || null;
  },

  // Logout the current student
  logout: function() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("student");
  },

  // Helper to get query string params from the URL
  qs: function(param) {
    return new URLSearchParams(window.location.search).get(param);
  },

  // Debug: Function to simulate Firebase authentication using email/password
  debugLoginWithEmail: async function(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Logged in with email:", user.email);
      return { ok: true, user };
    } catch (error) {
      console.error("Error signing in:", error.message);
      return { ok: false, message: error.message };
    }
  }
};

// Listen for DOM content loaded
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in and proceed accordingly
  if (BSA.isLoggedIn()) {
    window.location.href = "dashboard.html"; // Redirect to dashboard if logged in
  } else {
    // Handle login form submission
    document.getElementById('loginForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const accessCode = document.getElementById('accessCode').value;
      const studentEmail = document.getElementById('studentEmail').value;
      
      const result = BSA.login(accessCode, studentEmail);
      
      if (!result.ok) {
        console.log(result.message);  // Error handling
      } else {
        window.location.href = "dashboard.html"; // Redirect to dashboard on successful login
      }
    });
  }
});
