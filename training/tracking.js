/**
 * tracking.js — BSA Student Activity & Time Tracking
 * =====================================================================
 * Tracks lesson activity, quiz time, stage progression, and final
 * evaluation results to Firestore.
 *
 * All Firestore writes go through safeUpdate() for consistent error
 * handling. The 15-second auto-timer pauses when the tab is hidden
 * (Page Visibility API) and caps each tick at MAX_TICK_SECONDS to
 * prevent runaway accumulation from sleep/wake cycles.
 *
 * USAGE:
 *   initTracking(studentId, lessonNumber)  — call once per page load
 *   stopTracking()                         — call on beforeunload
 *   All other exports are called by quiz.html, scenario.html, etc.
 * =====================================================================
 */
 
import { db } from "./firebase-config.js";
import {
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  increment
} from "./firebase-firestore-shim.js";
// NOTE: Import from your local Firebase shim or bundled SDK rather than
// the CDN URL. This removes the external network dependency and ensures
// consistent versioning with firebase-config.js.
// If you are using the CDN directly everywhere, replace the import above
// with the versioned CDN URL you use in firebase-config.js.
 
// ─── Constants ────────────────────────────────────────────────────────────────
 
/** Maximum seconds credited per timer tick — caps sleep/wake drift */
const MAX_TICK_SECONDS = 60;
 
/** Timer interval in milliseconds */
const TICK_INTERVAL_MS = 15_000;
 
/** Development mode — set to true locally to enable verbose logging */
const DEV_MODE = false;
 
// ─── Tracking state ───────────────────────────────────────────────────────────
 
/**
 * Module-level singleton. Safe because each page does a full reload
 * between lessons (no SPA navigation in this portal).
 * initTracking() always calls stopTracking() first to clear any
 * previous timer before setting new state.
 *
 * @type {{
 *   studentId: string|null,
 *   lessonNumber: number|null,
 *   timerHandle: number|null,
 *   lastTickMs: number|null,
 *   isRunning: boolean
 * }}
 */
let state = {
  studentId:    null,
  lessonNumber: null,
  timerHandle:  null,
  lastTickMs:   null,
  isRunning:    false,
};
 
// ─── Internal utilities ───────────────────────────────────────────────────────
 
function log(...args) {
  if (DEV_MODE) console.log("[BSA Tracking]", ...args);
}
 
function hasContext() {
  return (
    typeof state.studentId === "string" &&
    state.studentId.trim() !== "" &&
    Number.isFinite(state.lessonNumber)
  );
}
 
function getLessonKey() {
  return state.lessonNumber;
}
 
/** Returns a Firestore document reference synchronously. No async needed. */
function getStudentRef() {
  if (!state.studentId) return null;
  return doc(db, "portalStudents", state.studentId);
}
 
/** Dotted Firestore path for a field inside a lesson's progress map. */
function progressPath(field) {
  return `progress.${getLessonKey()}.${field}`;
}
 
/**
 * Base fields written on every update.
 * NOTE: lastLoginAt is intentionally NOT included here — it should only
 * be written on actual login, not on every activity ping.
 */
function baseUpdate() {
  return {
    updatedAt:            serverTimestamp(),
    currentLessonNumber:  getLessonKey(),
    lastActivityAt:       serverTimestamp(),
  };
}
 
/**
 * Writes a payload to the student document.
 * All Firestore writes go through this — single error-handling path.
 *
 * @param {object} payload
 * @returns {Promise<boolean>}
 */
async function safeUpdate(payload) {
  const ref = getStudentRef();
  if (!ref) return false;
 
  try {
    await updateDoc(ref, payload);
    return true;
  } catch (err) {
    console.error("[BSA Tracking] Firestore update failed:", err);
    return false;
  }
}
 
/**
 * Normalizes a final evaluation result string to a known value.
 * @param {string} result
 * @returns {"passed"|"failed"|"critical"|"unknown"}
 */
function normalizeFinalResult(result) {
  const s = String(result ?? "").trim().toLowerCase();
  if (!s)                  return "unknown";
  if (s.includes("pass"))  return "passed";
  if (s.includes("crit"))  return "critical";
  if (s.includes("fail"))  return "failed";
  return "unknown";
}
 
// ─── Page Visibility API — pause timer when tab is hidden ─────────────────────
 
let _tabVisible = !document.hidden;
 
document.addEventListener("visibilitychange", () => {
  _tabVisible = !document.hidden;
 
  if (_tabVisible && state.isRunning) {
    // Tab became visible again — reset tick base so hidden time is not counted
    state.lastTickMs = Date.now();
    log("Tab visible — tick base reset.");
  } else {
    log("Tab hidden — time accumulation paused.");
  }
});
 
// ─── Timer ────────────────────────────────────────────────────────────────────
 
function clearTimer() {
  if (state.timerHandle !== null) {
    clearInterval(state.timerHandle);
    state.timerHandle = null;
  }
}
 
function startTimer() {
  clearTimer();
  state.lastTickMs = Date.now();
 
  state.timerHandle = setInterval(async () => {
    if (!_tabVisible) return; // tab hidden — skip this tick
    try {
      await tickTimeSlice();
    } catch (err) {
      console.error("[BSA Tracking] Timer tick failed:", err);
    }
  }, TICK_INTERVAL_MS);
}
 
/**
 * Writes elapsed seconds since last tick to Firestore.
 * Caps at MAX_TICK_SECONDS to prevent sleep/wake runaway accumulation.
 */
async function tickTimeSlice() {
  if (!hasContext()) return;
 
  const now     = Date.now();
  const rawSecs = Math.floor((now - state.lastTickMs) / 1000);
 
  // Cap to prevent inflated times from sleep/wake or browser throttling
  const elapsed = Math.min(Math.max(rawSecs, 1), MAX_TICK_SECONDS);
 
  state.lastTickMs = now;
 
  await safeUpdate({
    ...baseUpdate(),
    [progressPath("totalQuizTimeSeconds")]: increment(elapsed),
    totalQuizTimeSeconds:                   increment(elapsed),
    [progressPath("lastActivityAt")]:        serverTimestamp(),
  });
 
  log(`Tick: +${elapsed}s`);
}
 
// ─── Public API ───────────────────────────────────────────────────────────────
 
/**
 * Initialize tracking for a student and lesson.
 * Always stops any previous tracking session first.
 *
 * @param {string} studentId   - Firestore document ID
 * @param {number} lessonNumber - lesson ID (integer)
 */
export function initTracking(studentId, lessonNumber) {
  // Always clean up previous session before re-initializing
  stopTracking();
 
  state.studentId    = typeof studentId === "string" ? studentId.trim() : null;
  state.lessonNumber = Number(lessonNumber);
 
  if (!hasContext()) {
    console.warn("[BSA Tracking] initTracking: invalid studentId or lessonNumber.", {
      studentId,
      lessonNumber,
    });
    return;
  }
 
  state.isRunning = true;
  startTimer();
 
  log("Initialized.", { studentId: state.studentId, lesson: state.lessonNumber });
}
 
/**
 * Stop the tracking timer. Call on beforeunload or when leaving a page.
 * Safe to call multiple times.
 */
export function stopTracking() {
  clearTimer();
  state.isRunning = false;
  log("Stopped.");
}
 
/**
 * Fully reset tracking state. Use when logging out or switching students.
 */
export function resetTracking() {
  stopTracking();
  state = {
    studentId:    null,
    lessonNumber: null,
    timerHandle:  null,
    lastTickMs:   null,
    isRunning:    false,
  };
  log("Reset.");
}
 
// ─── Activity ─────────────────────────────────────────────────────────────────
 
/**
 * Record manual user activity (answer click, scroll, etc.).
 * Throttled by the caller — this just writes the timestamp.
 */
export async function trackManualActivity() {
  if (!hasContext()) return;
 
  await safeUpdate({
    ...baseUpdate(),
    [progressPath("lastActivityAt")]: serverTimestamp(),
  });
}
 
// ─── Lesson view ──────────────────────────────────────────────────────────────
 
/**
 * Record that the student opened and viewed lesson content.
 */
export async function trackLessonView() {
  if (!hasContext()) return;
 
  await safeUpdate({
    ...baseUpdate(),
    currentStage:                       "Lesson Opened",
    [progressPath("contentViewed")]:    true,
    [progressPath("stage")]:            "Lesson Opened",
    [progressPath("lastActivityAt")]:   serverTimestamp(),
  });
 
  log("Lesson viewed.");
}
 
// ─── Quiz start ───────────────────────────────────────────────────────────────
 
/**
 * Record that the student started a quiz or final evaluation.
 * Resets the tick base so quiz time is measured from this point.
 */
export async function trackQuizStart() {
  if (!hasContext()) return;
 
  // Reset tick base so time counts from quiz open, not lesson open
  state.lastTickMs = Date.now();
 
  await safeUpdate({
    ...baseUpdate(),
    currentStage:                     "Quiz Started",
    [progressPath("attempts")]:       increment(1),
    [progressPath("stage")]:          "Quiz Started",
    [progressPath("lastActivityAt")]: serverTimestamp(),
  });
 
  log("Quiz started.");
}
 
// ─── Lesson complete ──────────────────────────────────────────────────────────
 
/**
 * Record that the student completed a lesson.
 * Uses arrayUnion to atomically append the lesson ID — safe for
 * concurrent sessions (mobile + desktop) without read-modify-write.
 */
export async function trackLessonComplete() {
  if (!hasContext()) return;
 
  const ref = getStudentRef();
  if (!ref) return;
 
  try {
    await updateDoc(ref, {
      ...baseUpdate(),
      // arrayUnion is atomic — no read-modify-write race condition
      completedLessons:                     arrayUnion(getLessonKey()),
      currentLessonNumber:                  getLessonKey() + 1,
      currentStage:                         "Lesson Completed",
      [progressPath("completedAt")]:        serverTimestamp(),
      [progressPath("stage")]:             "Lesson Completed",
      [progressPath("lastActivityAt")]:     serverTimestamp(),
    });
 
    log("Lesson complete.", getLessonKey());
  } catch (err) {
    console.error("[BSA Tracking] trackLessonComplete failed:", err);
  }
}
 
// ─── Final evaluation result ──────────────────────────────────────────────────
 
/**
 * Record the final evaluation outcome.
 *
 * @param {"passed"|"failed"|"critical"} result
 */
export async function trackFinalResult(result) {
  if (!state.studentId) return;
 
  const safeResult = normalizeFinalResult(result);
 
  const stageLabel =
    safeResult === "passed"   ? "Final Passed"  :
    safeResult === "critical" ? "Critical Fail" :
    safeResult === "failed"   ? "Final Failed"  :
                                "Final — Unknown Result";
 
  await safeUpdate({
    ...baseUpdate(),
    finalEvaluationStatus: safeResult,
    currentStage:          stageLabel,
    [progressPath("stage")]:           stageLabel,
    [progressPath("lastActivityAt")]:  serverTimestamp(),
  });
 
  log("Final result recorded:", safeResult);
}
 
// ─── Stage logging ────────────────────────────────────────────────────────────
 
/**
 * Write a named stage label to the student record and lesson progress.
 * Used for "Scenario Started", "Quiz Completed", etc.
 *
 * @param {string} stageLabel
 */
export async function logStage(stageLabel) {
  if (!hasContext()) return;
 
  const safe = String(stageLabel ?? "").trim();
  if (!safe) return;
 
  await safeUpdate({
    ...baseUpdate(),
    currentStage:                     safe,
    [progressPath("stage")]:          safe,
    [progressPath("lastActivityAt")]: serverTimestamp(),
  });
 
  log("Stage:", safe);
}
