const BSA = {
  // Login functionality with correct localStorage handling
  login: function(accessCode, studentName) {
    const msgEl = document.getElementById('loginMsg');
    const code = accessCode.trim().toUpperCase();  // Normalize input

    // Debugging: Log login attempts
    console.log("Login Attempt:", { accessCode, studentName });

    // Check for valid login (for now, hardcoded)
    if (code === "BSAWEEKEND" && studentName === "JohnDoe") {
      localStorage.setItem("loggedIn", true);  // Store login state in localStorage
      msgEl.classList.add("hidden"); // Hide any error message
      return { ok: true };
    }

    // If login fails
    msgEl.classList.remove("hidden");
    msgEl.textContent = "Invalid login credentials.";
    return { ok: false, message: "Invalid login credentials." };
  },

  // Check if user is logged in
  isLoggedIn: function() {
    const loggedInStatus = localStorage.getItem("loggedIn");
    // Log error if localStorage is unavailable
    if (!loggedInStatus) {
      console.error("localStorage is unavailable or login state not found.");
    }
    return loggedInStatus === "true";
  },

  // Helper to get query string parameters
  qs: function(param) {
    return new URLSearchParams(window.location.search).get(param);
  }
};

// Ensure we start with a fresh state if no data exists in localStorage
function freshState() {
  return {
    student: null,
    attempts: {},
    lessonProgress: {},
    lastLogin: null
  };
}

// Load the stored state from localStorage or start fresh
function loadState() {
  try {
    const raw = localStorage.getItem("BSA_STATE"); // Changed the STORAGE_KEY for clarity
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
    localStorage.setItem("BSA_STATE", JSON.stringify(state));  // Store as BSA_STATE
  } catch (e) {
    console.error("Error saving state:", e);
  }
}

// Normalize and sanitize access code to uppercase
function normalizeCode(value) {
  return String(value || "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, "")
    .toUpperCase()  // Ensure it's in uppercase
    .trim();
}

// Normalize email to lowercase and clean up
function normalizeEmail(value) {
  return String(value || "")
    .replace(/\u00A0/g, " ")
    .trim()
    .toLowerCase();
}

// Normalize student data for consistency
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

// Perform login based on code and email
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

// Debugging function to track login attempts in console
async function debugLoginStudent(code, email = "") {
  const cleanCode = normalizeCode(code);
  const cleanEmail = normalizeEmail(email);

  console.log("LOGIN ATTEMPT");
  console.log("Entered code:", cleanCode);
  console.log("Entered email:", cleanEmail);

  const q = query(
    collection(db, "portalStudents"),
    where("accessCode", "==", cleanCode)
  );

  const snapshot = await getDocs(q);
  console.log("Matching code records:", snapshot.size);

  const matches = snapshot.docs.map((docSnap) =>
    normalizeStudent({ id: docSnap.id, ...docSnap.data() })
  );

  console.log("Matched records:", matches);

  const student = matches.find((s) => normalizeEmail(s.email) === cleanEmail);
  console.log("Final student:", student);

  return student;
}

// Record lesson progress in localStorage
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
