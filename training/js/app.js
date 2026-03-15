const BSA = {
  // Login function with a more consistent and clear approach
  login: function(accessCode, studentName) {
    const msgEl = document.getElementById('loginMsg');
    const code = accessCode.trim().toUpperCase(); // Normalize code to uppercase

    // Debugging: log the attempt
    console.log("Login Attempt:", { accessCode, studentName });

    // Hardcoded check for now (can be replaced with real backend authentication)
    if (code === "BSAWEEKEND" && studentName === "JohnDoe") {
      localStorage.setItem("loggedIn", "true"); // Store login state in localStorage
      msgEl.classList.add("hidden"); // Hide error message on successful login
      return { ok: true };
    }

    msgEl.classList.remove("hidden");
    msgEl.textContent = "Invalid login credentials.";
    return { ok: false, message: "Invalid login credentials." };
  },

  // Check if user is logged in by retrieving login state from localStorage
  isLoggedIn: function() {
    const loggedInStatus = localStorage.getItem("loggedIn");
    if (!loggedInStatus) {
      console.error("localStorage is unavailable or login state not found.");
    }
    return loggedInStatus === "true";
  },

  // URL query string parameter helper
  qs: function(param) {
    return new URLSearchParams(window.location.search).get(param);
  },

  // Helper function to ensure consistent login state across devices
  syncLoginState: function() {
    // Check if loggedIn exists in localStorage
    const loggedInState = localStorage.getItem("loggedIn");
    if (loggedInState === "true") {
      console.log("User is logged in.");
    } else {
      console.log("User is not logged in.");
    }
  }
};

// Fresh state of the app when no data is available
function freshState() {
  return {
    student: null,
    attempts: {},
    lessonProgress: {},
    lastLogin: null
  };
}

// Load stored state from localStorage
function loadState() {
  try {
    const raw = localStorage.getItem("BSA_STATE"); // Using BSA_STATE for storage
    if (!raw) return freshState();
    return { ...freshState(), ...JSON.parse(raw) };
  } catch (e) {
    console.error("Error loading state:", e);
    return freshState();
  }
}

// Save updated state back to localStorage
function saveState(state) {
  try {
    localStorage.setItem("BSA_STATE", JSON.stringify(state)); // Store as BSA_STATE
  } catch (e) {
    console.error("Error saving state:", e);
  }
}

// Normalize access code for consistency
function normalizeCode(value) {
  return String(value || "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, "")
    .toUpperCase() // Ensure it's uppercase
    .trim();
}

// Normalize email for consistency (lowercase)
function normalizeEmail(value) {
  return String(value || "")
    .replace(/\u00A0/g, " ")
    .trim()
    .toLowerCase();
}

// Normalize student data for consistency and storage
function normalizeStudent(rawStudent) {
  const student = { ...(rawStudent || {}) };

  const normalizedProgress = {};
  if (student.progress && typeof student.progress === "object") {
    for (const [key, value] of Object.entries(student.progress)) {
      normalizedProgress[Number(key)] = { ...(value || {}) };
    }
  }

  return {
    id: student.id || "",
    name: String(student.name || "").trim(),
    email: normalizeEmail(student.email || ""),
    accessCode: normalizeCode(student.accessCode || ""),
    tier: String(student.tier || "FULL").toUpperCase(),
    paid: !!student.paid,
    status: String(student.status || "active"),
    progress: normalizedProgress,
    completedLessons: Array.isArray(student.completedLessons)
      ? [...new Set(student.completedLessons.map(Number).filter(Boolean))]
      : []
  };
}

// Set the current student to localStorage
function setCurrentStudent(student) {
  localStorage.setItem("BSA_STATE", JSON.stringify(normalizeStudent(student)));
}

// Get current student data from localStorage
function getCurrentStudent() {
  const raw = localStorage.getItem("BSA_STATE");
  return raw ? normalizeStudent(JSON.parse(raw)) : null;
}

// Clear active student from localStorage
function clearActiveStudent() {
  localStorage.removeItem("BSA_STATE");
}

// Refresh current student data by querying Firestore (Firebase)
async function refreshCurrentStudent() {
  const current = getCurrentStudent();
  if (!current || !current.id) return null;

  const ref = doc(db, "portalStudents", current.id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    clearActiveStudent();
    return null;
  }

  const fresh = normalizeStudent({ id: snap.id, ...snap.data() });
  setCurrentStudent(fresh);
  return fresh;
}

// Perform login based on access code and email
async function loginStudent(code, email = "") {
  const cleanCode = normalizeCode(code);
  const cleanEmail = normalizeEmail(email);

  if (!cleanCode || !cleanEmail) return null;

  const q = query(
    collection(db, "portalStudents"),
    where("accessCode", "==", cleanCode)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const matches = snapshot.docs.map((docSnap) =>
    normalizeStudent({ id: docSnap.id, ...docSnap.data() })
  );

  const student = matches.find((s) => normalizeEmail(s.email) === cleanEmail);

  if (!student) return null;

  setCurrentStudent(student);
  return student;
}

// Function to record lesson progress in localStorage
async function recordQuizResult(lessonId, score, details) {
  return updateCurrentStudent((student) => {
    student.progress ||= {};
    student.progress[lessonId] ||= {};

    const p = student.progress[lessonId];
    const passed = score >= PASSING_SCORE;
    const currentFails = Number(p.consecutiveFails || 0);
    const nextFails = passed ? 0 : currentFails + 1;

    p.attemptCount = Number(p.attemptCount || 0) + 1;
    p.quizScore = score;
    p.quizDetails = Array.isArray(details) ? details : [];
    p.quizPassed = passed;
    p.lastAttemptAt = new Date().toISOString();
    p.consecutiveFails = nextFails;

    p.lockUntil = null;
    p.adminLocked = false;

    if (!passed) {
      if (nextFails === 1) {
        p.lockUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      } else if (nextFails === 2) {
        p.lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      } else if (nextFails >= 3) {
        p.adminLocked = true;
        p.lockUntil = null;
      }
    }

    if (passed && !student.completedLessons.includes(lessonId)) {
      student.completedLessons.push(lessonId);
    }

    if (student.completedLessons.length >= TOTAL_LESSONS) {
      student.status = "online-complete";
    }
  });
}

return {
  login,
  isLoggedIn,
  qs,
  getCurrentStudent,
  setCurrentStudent,
  refreshCurrentStudent,
  recordQuizResult,
  saveState,
  loadState
};
