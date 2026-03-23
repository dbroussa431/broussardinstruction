const BSA = (() => {
  const STORAGE_KEY = 'bsa_portal_v3';
  const PASSING_SCORE = 80;
  const QUIZ_SIZE = 20;
  const SCENARIO_SIZE = 2;

  const ACCESS_CODES = {
    BSAWEEKEND: { course: 'Online Prerequisite', discount: false },
    BSAFREE: { course: 'Online Prerequisite', discount: true },
    BSADISCOUNT: { course: 'Online Prerequisite', discount: true },
    BSADEMO: { course: 'Demo Access', discount: true }
  };

  function freshState() {
    return {
      student: null,
      attempts: {},
      lessonProgress: {},
      activeScenarioSets: {},
      activeQuizSets: {},
      lastLogin: null
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return freshState();
      return { ...freshState(), ...JSON.parse(raw) };
    } catch (error) {
      console.error('Failed to load portal state:', error);
      return freshState();
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function normalizeCode(code) {
    return String(code || '').trim().toUpperCase();
  }

  function login(code, name = '') {
    const normalized = normalizeCode(code);
    const record = ACCESS_CODES[normalized];
    if (!record) return { ok: false, message: 'Invalid access code.' };

    const state = loadState();
    state.student = {
      code: normalized,
      name: String(name || '').trim() || 'Student',
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

  function getLessonById(lessonId) {
    return (window.LESSONS || []).find((lesson) => lesson.id === Number(lessonId)) || null;
  }

  function getLessonProgress(lessonId) {
    const state = loadState();
    return state.lessonProgress[String(lessonId)] || {};
  }

  function updateLessonProgress(lessonId, patch) {
    const state = loadState();
    const key = String(lessonId);
    state.lessonProgress[key] = {
      ...(state.lessonProgress[key] || {}),
      ...patch
    };
    saveState(state);
    return state.lessonProgress[key];
  }

  function setLessonContentViewed(lessonId) {
    updateLessonProgress(lessonId, { contentViewed: true, lastViewedAt: new Date().toISOString() });
  }

  function setScenarioCompleted(lessonId) {
    updateLessonProgress(lessonId, { scenarioCompleted: true, scenarioCompletedAt: new Date().toISOString() });
  }

  function getAttemptCount(lessonId) {
    const state = loadState();
    return Number(state.attempts[String(lessonId)] || 0);
  }

  function shuffledCopy(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function randomSample(items, count) {
    return shuffledCopy(Array.isArray(items) ? items : []).slice(0, Math.min(count, (items || []).length));
  }

  function ensureScenarioSet(lessonId) {
    const state = loadState();
    const key = String(lessonId);
    if (!state.activeScenarioSets[key]) {
      const lesson = getLessonById(lessonId);
      const scenarios = Array.isArray(lesson?.scenarios) ? lesson.scenarios : [];
      state.activeScenarioSets[key] = randomSample(scenarios, SCENARIO_SIZE);
      saveState(state);
    }
    return state.activeScenarioSets[key] || [];
  }

  function resetScenarioSet(lessonId) {
    const state = loadState();
    delete state.activeScenarioSets[String(lessonId)];
    saveState(state);
  }

  function ensureQuizSet(lessonId) {
    const state = loadState();
    const key = String(lessonId);
    if (!state.activeQuizSets[key]) {
      const pool = Array.isArray(window.QUIZ_BANK?.[lessonId]) ? window.QUIZ_BANK[lessonId] : [];
      state.activeQuizSets[key] = randomSample(pool, QUIZ_SIZE);
      saveState(state);
    }
    return state.activeQuizSets[key] || [];
  }

  function resetQuizSet(lessonId) {
    const state = loadState();
    delete state.activeQuizSets[String(lessonId)];
    saveState(state);
  }

  function recordQuizResult(lessonId, score, details) {
    const state = loadState();
    const key = String(lessonId);
    state.attempts[key] = Number(state.attempts[key] || 0) + 1;
    state.lessonProgress[key] = {
      ...(state.lessonProgress[key] || {}),
      contentViewed: true,
      scenarioCompleted: true,
      quizScore: score,
      quizPassed: score >= PASSING_SCORE,
      quizDetails: details,
      completedAt: new Date().toISOString(),
      attempts: state.attempts[key]
    };
    delete state.activeQuizSets[key];
    saveState(state);
    return state.lessonProgress[key];
  }

  function lessonUnlocked(lessonId) {
    if (Number(lessonId) <= 1) return true;
    return !!getLessonProgress(Number(lessonId) - 1).quizPassed;
  }

  function lessonStatus(lessonId) {
    const progress = getLessonProgress(lessonId);
    if (!lessonUnlocked(lessonId)) {
      return { label: 'Complete Previous Lesson First', className: 'locked', locked: true };
    }
    if (progress.quizPassed) {
      return { label: `Passed • ${progress.quizScore}%`, className: 'passed', locked: false };
    }
    if (progress.scenarioCompleted) {
      return { label: 'Ready for Quiz', className: 'in-progress', locked: false };
    }
    if (progress.contentViewed) {
      return { label: 'Scenario Review Next', className: 'in-progress', locked: false };
    }
    return { label: 'Not Started', className: 'not-started', locked: false };
  }

  function overallProgress() {
    const lessons = Array.isArray(window.LESSONS) ? window.LESSONS : [];
    const passed = lessons.filter((lesson) => getLessonProgress(lesson.id).quizPassed).length;
    const total = lessons.length;
    return {
      passed,
      total,
      percent: total ? Math.round((passed / total) * 100) : 0
    };
  }

  function allLessonsComplete() {
    const progress = overallProgress();
    return progress.total > 0 && progress.passed === progress.total;
  }

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  return {
    PASSING_SCORE,
    QUIZ_SIZE,
    SCENARIO_SIZE,
    ACCESS_CODES,
    loadState,
    saveState,
    login,
    logout,
    requireLogin,
    getStudent,
    getLessonById,
    getLessonProgress,
    setLessonContentViewed,
    setScenarioCompleted,
    getAttemptCount,
    randomSample,
    ensureScenarioSet,
    resetScenarioSet,
    ensureQuizSet,
    resetQuizSet,
    recordQuizResult,
    lessonUnlocked,
    lessonStatus,
    overallProgress,
    allLessonsComplete,
    qs
  };
})();
