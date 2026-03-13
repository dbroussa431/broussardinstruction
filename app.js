const BSA = (() => {
  const STORAGE_KEY = 'bsa_portal_v2';
  const PASSING_SCORE = 80;
  const ACCESS_CODES = {
    'BSAWEEKEND': { course: 'Online Prerequisite', discount: false },
    'BSAFREE': { course: 'Online Prerequisite', discount: true },
    'BSADISCOUNT': { course: 'Online Prerequisite', discount: true },
    'BSADEMO': { course: 'Demo Access', discount: true }
  };

  function freshState() {
    return {
      student: null,
      attempts: {},
      lessonProgress: {},
      lastLogin: null
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return freshState();
      return { ...freshState(), ...JSON.parse(raw) };
    } catch {
      return freshState();
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function login(code, name = '') {
    const normalized = String(code || '').trim().toUpperCase();
    const record = ACCESS_CODES[normalized];
    if (!record) return { ok: false, message: 'Invalid access code.' };
    const state = loadState();
    state.student = {
      code: normalized,
      name: name.trim() || 'Student',
      course: record.course,
      discount: !!record.discount
    };
    state.lastLogin = new Date().toISOString();
    saveState(state);
    return { ok: true };
  }

  function logout() {
    const state = loadState();
    state.student = null;
    saveState(state);
  }

  function requireLogin() {
    const state = loadState();
    if (!state.student) {
      window.location.href = 'login.html';
      return null;
    }
    return state;
  }

  function getStudent() {
    return loadState().student;
  }

  function setLessonContentViewed(lessonId) {
    const state = loadState();
    state.lessonProgress[lessonId] = state.lessonProgress[lessonId] || {};
    state.lessonProgress[lessonId].contentViewed = true;
    saveState(state);
  }

  function setScenarioCompleted(lessonId) {
    const state = loadState();
    state.lessonProgress[lessonId] = state.lessonProgress[lessonId] || {};
    state.lessonProgress[lessonId].scenarioCompleted = true;
    saveState(state);
  }

  function recordQuizResult(lessonId, score, details) {
    const state = loadState();
    state.lessonProgress[lessonId] = state.lessonProgress[lessonId] || {};
    state.attempts[lessonId] = (state.attempts[lessonId] || 0) + 1;
    state.lessonProgress[lessonId].quizScore = score;
    state.lessonProgress[lessonId].quizPassed = score >= PASSING_SCORE;
    state.lessonProgress[lessonId].quizDetails = details;
    state.lessonProgress[lessonId].completedAt = new Date().toISOString();
    state.lessonProgress[lessonId].attempts = state.attempts[lessonId];
    if (score >= PASSING_SCORE) {
      delete state.lessonProgress[lessonId].lockedUntil;
    } else {
      state.lessonProgress[lessonId].lockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    }
    saveState(state);
  }

  function getAttemptCount(lessonId) {
    return loadState().attempts[lessonId] || 0;
  }

  function getLessonProgress(lessonId) {
    return loadState().lessonProgress[lessonId] || {};
  }

  function getLockRemainingMs(lessonId) {
    const progress = getLessonProgress(lessonId);
    if (!progress.lockedUntil) return 0;
    const ms = new Date(progress.lockedUntil).getTime() - Date.now();
    return Math.max(0, ms);
  }

  function isLessonLockedByTimer(lessonId) {
    return getLockRemainingMs(lessonId) > 0;
  }

  function formatCountdown(ms) {
    const totalSeconds = Math.ceil(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${String(minutes).padStart(2,'0')}m ${String(seconds).padStart(2,'0')}s`;
  }

  function lessonStatus(lessonId) {
    const lesson = LESSONS.find(l => l.id === lessonId);
    const state = loadState();
    const progress = state.lessonProgress[lessonId] || {};
    if (lessonId > 1) {
      const prev = state.lessonProgress[lessonId - 1] || {};
      if (!prev.quizPassed) return { label: 'Locked', className: 'locked', locked: true };
    }
    const lockRemaining = getLockRemainingMs(lessonId);
    if (lockRemaining > 0) {
      return {
        label: `24-Hour Review Lock • ${formatCountdown(lockRemaining)}`,
        className: 'locked',
        locked: true,
        timedLock: true,
        lockedUntil: progress.lockedUntil
      };
    }
    if (progress.quizPassed) return { label: `Passed • ${progress.quizScore}%`, className: 'passed', locked: false };
    if (progress.contentViewed || progress.scenarioCompleted) return { label: 'Ready for Quiz', className: 'in-progress', locked: false };
    return { label: 'Not Started', className: 'not-started', locked: false };
  }

  function overallProgress() {
    const state = loadState();
    const passed = LESSONS.filter(l => state.lessonProgress[l.id]?.quizPassed).length;
    return {
      passed,
      total: LESSONS.length,
      percent: Math.round((passed / LESSONS.length) * 100)
    };
  }

  function allLessonsComplete() {
    return overallProgress().passed === LESSONS.length;
  }

  function randomSample(arr, n) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, Math.min(n, copy.length));
  }

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
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
    getAttemptCount,
    getLessonProgress,
    getLockRemainingMs,
    isLessonLockedByTimer,
    formatCountdown,
    lessonStatus,
    overallProgress,
    allLessonsComplete,
    randomSample,
    qs
  };
})();
