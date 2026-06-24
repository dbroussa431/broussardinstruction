/**
 * teacher-assistant.js — BSA Lesson Instructor Support Panel
 * =====================================================================
 * Provides a floating "Ask Instructor" panel on lesson pages.
 * Answers questions about lesson content using window.LESSONS data.
 * Refuses to give direct quiz answers.
 *
 * PAGES: lesson.html only.
 * Does NOT conflict with ai.js (which runs on dashboard.html).
 * This file is for lesson-context Q&A; ai.js is for doctrine training.
 *
 * USAGE: Load as a classic <script> after data.js on lesson.html.
 *   <script src="data.js"></script>
 *   <script src="teacher-assistant.js"></script>
 * =====================================================================
 */
 
(function () {
  "use strict";
 
  // ─── Page context ──────────────────────────────────────────────────
  const params   = new URLSearchParams(window.location.search);
  const LESSON_ID = Number(params.get("lesson") || 0);
 
  // Derive final lesson ID from data so magic numbers aren't hardcoded
  const LESSONS     = Array.isArray(window.LESSONS) ? window.LESSONS : [];
  const FINAL_ID    = LESSONS.length ? LESSONS.at(-1).id : 10;
  // Lessons immediately before the final get special responses
  const SPECIAL_IDS = LESSONS.length >= 3
    ? LESSONS.slice(-3, -1).map(l => l.id)
    : [];
 
  // ─── Build DOM via DOM methods (no innerHTML for the structure) ────
 
  // Root container
  const root = document.createElement("div");
  root.id = "taRoot";
  root.setAttribute("data-ta", "");
 
  // ── Toggle button ────────────────────────────────────────────────
  const toggle = document.createElement("button");
  toggle.id = "taToggle";
  toggle.type = "button";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", "taPanel");
  toggle.setAttribute("aria-label", "Open instructor support panel");
 
  const avatar = document.createElement("span");
  avatar.className   = "ta-avatar";
  avatar.textContent = "DB";
  avatar.setAttribute("aria-hidden", "true");
 
  const label = document.createElement("span");
  label.className   = "ta-label";
  label.textContent = "Ask Instructor";
 
  toggle.appendChild(avatar);
  toggle.appendChild(label);
 
  // ── Panel ────────────────────────────────────────────────────────
  const panel = document.createElement("div");
  panel.id = "taPanel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "false");
  panel.setAttribute("aria-labelledby", "taPanelTitle");
  panel.setAttribute("aria-hidden", "true");
  panel.classList.add("ta-hidden");
 
  // Panel header
  const head = document.createElement("div");
  head.className = "ta-head";
 
  const headText = document.createElement("div");
 
  const titleEl = document.createElement("strong");
  titleEl.id          = "taPanelTitle";
  titleEl.textContent = "Instructor Support";
 
  const subEl = document.createElement("div");
  subEl.className   = "ta-sub";
  subEl.textContent = "David A. Broussard, Sr.";
 
  headText.appendChild(titleEl);
  headText.appendChild(subEl);
 
  const closeBtn = document.createElement("button");
  closeBtn.id        = "taClose";
  closeBtn.type      = "button";
  closeBtn.className = "ta-close";
  closeBtn.setAttribute("aria-label", "Close instructor support panel");
  closeBtn.textContent = "\u2715"; // ×
 
  head.appendChild(headText);
  head.appendChild(closeBtn);
 
  // Messages container
  const messages = document.createElement("div");
  messages.id        = "taMessages";
  messages.className = "ta-messages";
  messages.setAttribute("role", "log");
  messages.setAttribute("aria-live", "polite");
  messages.setAttribute("aria-label", "Instructor conversation");
  messages.setAttribute("aria-atomic", "false");
 
  // Boot message
  const bootMsg = document.createElement("div");
  bootMsg.className   = "ta-msg ta-msg-assistant";
  bootMsg.textContent = "Ask a lesson question and I'll help explain the concept. I will not give direct quiz answers.";
  messages.appendChild(bootMsg);
 
  // Form
  const form = document.createElement("form");
  form.id        = "taForm";
  form.className = "ta-form";
  form.setAttribute("aria-label", "Ask instructor a question");
  form.noValidate = true;
 
  // Visually hidden label for the input
  const inputLabel = document.createElement("label");
  inputLabel.htmlFor   = "taInput";
  inputLabel.className = "ta-sr-only";
  inputLabel.textContent = "Your question";
 
  const inputEl = document.createElement("input");
  inputEl.id           = "taInput";
  inputEl.type         = "text";
  inputEl.autocomplete = "off";
  inputEl.setAttribute("autocorrect", "off");
  inputEl.setAttribute("spellcheck", "false");
  inputEl.placeholder  = "Ask about the lesson\u2026";
 
  const sendBtn = document.createElement("button");
  sendBtn.type      = "submit";
  sendBtn.className = "ta-send";
  sendBtn.setAttribute("aria-label", "Send question");
  sendBtn.textContent = "Send";
 
  // Typing indicator (hidden until used)
  const typingIndicator = document.createElement("div");
  typingIndicator.id        = "taTyping";
  typingIndicator.className = "ta-msg ta-msg-assistant ta-typing ta-hidden-el";
  typingIndicator.setAttribute("aria-label", "Instructor is typing");
  typingIndicator.setAttribute("aria-hidden", "true");
  typingIndicator.innerHTML =
    '<span class="ta-dot"></span><span class="ta-dot"></span><span class="ta-dot"></span>';
 
  form.appendChild(inputLabel);
  form.appendChild(inputEl);
  form.appendChild(sendBtn);
 
  panel.appendChild(head);
  panel.appendChild(messages);
  panel.appendChild(typingIndicator);
  panel.appendChild(form);
 
  root.appendChild(toggle);
  root.appendChild(panel);
  document.body.appendChild(root);
 
  // ─── Styles ─────────────────────────────────────────────────────────
  // Injected at runtime so teacher-assistant.js stays self-contained.
  // All selectors are scoped under [data-ta] to avoid global conflicts.
 
  const style = document.createElement("style");
  style.id = "ta-styles";
  style.textContent = `
    [data-ta] {
      position: fixed;
      right: 18px;
      bottom: 18px;
      z-index: 9999;
      font-family: Arial, Helvetica, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0;
    }
 
    /* ── Toggle button ─────────────────────────────── */
    #taToggle {
      display: flex;
      align-items: center;
      gap: 10px;
      border: 0;
      background: #1f468c;
      color: #fff;
      padding: 12px 16px;
      border-radius: 999px;
      box-shadow: 0 12px 28px rgba(19, 40, 78, .24);
      cursor: pointer;
      font-weight: 800;
      font-size: 0.95rem;
      transition: background 0.18s ease;
    }
 
    #taToggle:hover { background: #183872; }
 
    #taToggle:focus-visible {
      outline: 3px solid #d8a62a;
      outline-offset: 3px;
    }
 
    .ta-avatar {
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      background: #d8a62a;
      color: #111;
      font-size: 0.84rem;
      font-weight: 900;
      flex-shrink: 0;
    }
 
    .ta-label { white-space: nowrap; }
 
    /* ── Panel ─────────────────────────────────────── */
    #taPanel {
      width: min(380px, calc(100vw - 24px));
      height: 500px;
      background: #fff;
      border: 1px solid #d9e0ec;
      border-radius: 18px;
      box-shadow: 0 18px 45px rgba(19, 40, 78, .22);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      margin-bottom: 12px;
      transform-origin: bottom right;
      transition: opacity 0.18s ease, transform 0.18s ease;
    }
 
    #taPanel.ta-hidden {
      display: none;
    }
 
    /* ── Header ────────────────────────────────────── */
    .ta-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 16px;
      background: linear-gradient(135deg, #17356b, #1f468c);
      color: #fff;
      flex-shrink: 0;
    }
 
    .ta-sub {
      font-size: 0.84rem;
      opacity: 0.88;
      margin-top: 4px;
    }
 
    .ta-close {
      border: 0;
      background: rgba(255, 255, 255, .15);
      color: #fff;
      width: 34px;
      height: 34px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 1rem;
      display: grid;
      place-items: center;
      transition: background 0.15s;
      flex-shrink: 0;
    }
 
    .ta-close:hover { background: rgba(255, 255, 255, .28); }
 
    .ta-close:focus-visible {
      outline: 2px solid #d8a62a;
      outline-offset: 2px;
    }
 
    /* ── Messages ──────────────────────────────────── */
    .ta-messages {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      background: #f7f9fd;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
 
    .ta-msg {
      max-width: 88%;
      padding: 10px 12px;
      border-radius: 14px;
      line-height: 1.5;
      font-size: 0.92rem;
      word-break: break-word;
      animation: taFadeIn 0.18s ease;
    }
 
    .ta-msg-user {
      background: #1f468c;
      color: #fff;
      margin-left: auto;
      border-bottom-right-radius: 4px;
    }
 
    .ta-msg-assistant {
      background: #fff;
      color: #142033;
      border: 1px solid #d9e0ec;
      border-bottom-left-radius: 4px;
    }
 
    /* ── Typing indicator ──────────────────────────── */
    .ta-typing {
      display: flex;
      gap: 5px;
      align-items: center;
      padding: 12px 14px;
    }
 
    .ta-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #9aaccc;
      animation: taDotPulse 1.2s ease-in-out infinite;
    }
 
    .ta-dot:nth-child(2) { animation-delay: 0.2s; }
    .ta-dot:nth-child(3) { animation-delay: 0.4s; }
 
    .ta-hidden-el { display: none; }
 
    /* ── Form ──────────────────────────────────────── */
    .ta-form {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 10px;
      padding: 12px;
      border-top: 1px solid #d9e0ec;
      background: #fff;
      flex-shrink: 0;
    }
 
    /* Visually hidden label */
    .ta-sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
 
    #taInput {
      border: 1px solid #d9e0ec;
      border-radius: 12px;
      padding: 11px 14px;
      font: inherit;
      font-size: 0.92rem;
      color: #1f2f4d;
      background: #fff;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
 
    #taInput:focus {
      outline: none;
      border-color: #3478b9;
      box-shadow: 0 0 0 3px rgba(52, 120, 185, .15);
    }
 
    .ta-send {
      border: 0;
      border-radius: 12px;
      background: #d8a62a;
      color: #111;
      font-weight: 800;
      font-size: 0.92rem;
      padding: 0 16px;
      cursor: pointer;
      transition: background 0.15s;
      white-space: nowrap;
    }
 
    .ta-send:hover:not(:disabled) { background: #c49522; }
 
    .ta-send:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
 
    .ta-send:focus-visible {
      outline: 2px solid #1f468c;
      outline-offset: 2px;
    }
 
    /* ── Animations ────────────────────────────────── */
    @keyframes taFadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
 
    @keyframes taDotPulse {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
      40%           { transform: scale(1.1); opacity: 1; }
    }
  `;
 
  // Only inject once — guard against double-load
  if (!document.getElementById("ta-styles")) {
    document.head.appendChild(style);
  }
 
  // ─── Panel open / close ───────────────────────────────────────────
 
  function openPanel() {
    panel.classList.remove("ta-hidden");
    panel.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close instructor support panel");
    inputEl.focus();
  }
 
  function closePanel() {
    panel.classList.add("ta-hidden");
    panel.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open instructor support panel");
    toggle.focus();
  }
 
  function isPanelOpen() {
    return !panel.classList.contains("ta-hidden");
  }
 
  toggle.addEventListener("click", () => {
    if (isPanelOpen()) closePanel(); else openPanel();
  });
 
  closeBtn.addEventListener("click", closePanel);
 
  // Escape key closes the panel
  panel.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePanel();
  });
 
  // ─── Message rendering ────────────────────────────────────────────
 
  /**
   * Append a message bubble to the conversation.
   * Uses textContent — no XSS risk from lesson data.
   *
   * @param {string} text
   * @param {"user"|"assistant"} who
   */
  function addMessage(text, who) {
    const div = document.createElement("div");
    div.className   = `ta-msg ta-msg-${who}`;
    div.textContent = String(text ?? "");
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }
 
  function showTyping() {
    typingIndicator.classList.remove("ta-hidden-el");
    typingIndicator.removeAttribute("aria-hidden");
    messages.scrollTop = messages.scrollHeight;
  }
 
  function hideTyping() {
    typingIndicator.classList.add("ta-hidden-el");
    typingIndicator.setAttribute("aria-hidden", "true");
  }
 
  // ─── Lesson context ───────────────────────────────────────────────
 
  function getLessonData() {
    return LESSONS.find(l => l.id === LESSON_ID) || null;
  }
 
  // ─── Section matching — improved overlap scoring ──────────────────
 
  /**
   * Tokenize a string into meaningful words (length > 2).
   * @param {string} str
   * @returns {string[]}
   */
  function tokenize(str) {
    return String(str || "")
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 2);
  }
 
  /**
   * Score how many tokens from the question appear in a target string.
   * Requires at least 2 overlapping tokens to be considered a match,
   * preventing single-word false positives (e.g. "use" matching "Use of Force").
   *
   * @param {string} question
   * @param {string} target
   * @returns {number}
   */
  function overlapScore(question, target) {
    const qTokens  = tokenize(question);
    const tText    = String(target || "").toLowerCase();
    let score = 0;
    for (const t of qTokens) {
      if (tText.includes(t)) score++;
    }
    return score;
  }
 
  /**
   * Find the best-matching section in the current lesson.
   * Returns null if no section scores at least 2 token overlaps.
   *
   * @param {string} question
   * @param {object} lesson
   * @returns {{heading: string, body: string}|null}
   */
  function findBestSection(question, lesson) {
    let best      = null;
    let bestScore = 1; // minimum threshold — must beat 1 to qualify
 
    for (const section of lesson.sections || []) {
      const headingScore = overlapScore(question, section.heading) * 2; // heading match weighted higher
      const bodyScore    = overlapScore(question, (section.body || []).join(" "));
      const total        = headingScore + bodyScore;
 
      if (total > bestScore) {
        bestScore = total;
        best = {
          heading: String(section.heading || ""),
          body:    (section.body || []).join(" "),
        };
      }
    }
 
    return best;
  }
 
  // ─── Quiz answer refusal phrases ──────────────────────────────────
 
  const QUIZ_REFUSALS = [
    "what is the answer",
    "give me the answer",
    "which option",
    "what option",
    "correct answer",
    "quiz answer",
    "what letter",
    "just tell me",
    "tell me the answer",
  ];
 
  function isQuizRequest(text) {
    const q = text.toLowerCase().trim();
    return QUIZ_REFUSALS.some(p => q.includes(p));
  }
 
  // ─── Special lesson responses — derived from data, not hardcoded IDs
 
  const SPECIAL_RESPONSES = {
    [FINAL_ID]:
      "For the final evaluation, concentrate on lawful judgment, restraint, and responsible decision-making. I can explain concepts, but I will not give direct answers.",
  };
 
  // Build special responses for the two lessons before the final
  if (SPECIAL_IDS[0]) {
    SPECIAL_RESPONSES[SPECIAL_IDS[0]] =
      "For Louisiana law, focus on where carry is restricted, notification requirements, impairment restrictions, and the difference between lawful carry and lawful use of force.";
  }
 
  if (SPECIAL_IDS[1]) {
    SPECIAL_RESPONSES[SPECIAL_IDS[1]] =
      "For mental readiness, focus on warning signs, crisis response, substance impairment, and your responsibility to reduce access to firearms during a crisis.";
  }
 
  // ─── Answer engine ────────────────────────────────────────────────
 
  /**
   * Build a response string for the student's question.
   * All returned strings are plain text — safe for textContent insertion.
   *
   * @param {string} userText
   * @returns {string}
   */
  function buildAnswer(userText) {
    const text   = String(userText || "").trim();
    const lower  = text.toLowerCase();
    const lesson = getLessonData();
 
    // 1. Refuse quiz answer requests
    if (isQuizRequest(lower)) {
      return "I can help explain the concept, but I will not give direct quiz answers. Ask me what the rule means or what principle the lesson is teaching.";
    }
 
    // 2. No lesson data available
    if (!lesson) {
      return "Ask me about the lesson you are currently viewing and I'll help explain the concept.";
    }
 
    // 3. Summary request
    if (lower.includes("summary") || lower.includes("gist") || lower.includes("overview")) {
      return `${lesson.title}: ${lesson.summary}`;
    }
 
    // 4. Section content match — requires meaningful token overlap
    const section = findBestSection(lower, lesson);
    if (section) {
      return `${section.heading}: ${section.body}`;
    }
 
    // 5. Special lesson fallback (Louisiana law, mental readiness, final)
    if (SPECIAL_RESPONSES[LESSON_ID]) {
      return SPECIAL_RESPONSES[LESSON_ID];
    }
 
    // 6. Generic fallback
    return "I can explain the lesson concept if you ask about a specific topic from this page, like awareness, force law, stress, mental health, or responsibility.";
  }
 
  // ─── Form submit ──────────────────────────────────────────────────
 
  form.addEventListener("submit", (e) => {
    e.preventDefault();
 
    const text = inputEl.value.trim();
    if (!text) return;
 
    // Show user message and clear input
    addMessage(text, "user");
    inputEl.value    = "";
    sendBtn.disabled = true;
 
    // Show typing indicator while "thinking"
    showTyping();
    messages.scrollTop = messages.scrollHeight;
 
    // Delay response slightly to feel natural
    setTimeout(() => {
      hideTyping();
      const reply = buildAnswer(text);
      addMessage(reply, "assistant");
      sendBtn.disabled = false;
      inputEl.focus();
    }, 320);
  });
 
})();
