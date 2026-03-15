const BSA = {
  login: function(accessCode, studentName) {
    // Simulate login logic (replace with actual backend authentication)
    if (accessCode === "BSAWEEKEND" && studentName === "JohnDoe") {
      localStorage.setItem("loggedIn", true);
      return { ok: true };
    }
    return { ok: false, message: "Invalid login credentials." };
  },
  isLoggedIn: function() {
    return localStorage.getItem("loggedIn") === "true";
  },
  qs: function(param) {
    return new URLSearchParams(window.location.search).get(param);
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
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return freshState();
      return { ...freshState(), ...JSON.parse(raw) };
    } catch {
      return freshState();
    }
  }

  // Save updated state to localStorage
  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // Normalize and convert the access code to uppercase
  function normalizeCode(value) {
    return String(value || "")
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, "")
      .toUpperCase()  // Ensure it's in uppercase
      .trim();
  }

  // Normalize email to lowercase for consistency
  function normalizeEmail(value) {
    return String(value || "")
      .replace(/\u00A0/g, " ")
      .trim()
      .toLowerCase();
  }

  // Normalize student data to store in localStorage
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

  // Set current student to localStorage
  function setCurrentStudent(student) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeStudent(student)));
  }

  // Get current student from localStorage
  function getCurrentStudent() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeStudent(JSON.parse(raw)) : null;
  }

  // Clear active student from localStorage
  function clearActiveStudent() {
    localStorage.removeItem(STORAGE_KEY);
  }

  // Refresh current student data by querying Firestore
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

  // Log in the student by verifying the access code and email
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

  // Helper function to debug login attempt (for debugging purposes only)
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

  // Function to record lesson progress and score in the system
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
    PASSING_SCORE,
    ACCESS_CODES,
    loadState,
    saveState,
    login,
    logout,
    requireLogin,
    getStudent,
    setLessonContentViewed,
    setScenarioCompleted,
    recordQuizResult,
    debugLoginStudent,
    getCurrentStudent
  };
})();
