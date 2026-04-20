// =====================================================================
// BSA DAVID TEACHER - COMPLETE SMART AI.JS (ver. 4.0)
// =====================================================================

if (!window.BSA_AI_LOADED) {
  window.BSA_AI_LOADED = true;

  (function () {
    // -----------------------------------------------------------------
    // CONSTANTS + DOM
    // -----------------------------------------------------------------
    const LABELS = { instructor: "BSA Instructor", user: "You" };
    const CSS = { hidden: "hidden" };

    const aiBtn = document.getElementById("aiToggleBtn");
    const aiPanel = document.getElementById("aiPanel");
    const aiClose = document.getElementById("aiClose");
    const aiSend = document.getElementById("aiSend");
    const aiInput = document.getElementById("aiInput");
    const aiMessages = document.getElementById("aiMessages");

    let aiClear = document.getElementById("aiClear");

    // -----------------------------------------------------------------
    // PAGE + CONTEXT
    // -----------------------------------------------------------------
    const pagePath = window.location.pathname.toLowerCase();
    const isQuizPage = pagePath.includes("quiz.html");
    const isLessonPage = pagePath.includes("lesson.html");
    const isDashboardPage = pagePath.includes("dashboard.html");
    const isScenarioPage = pagePath.includes("scenario");
    const currentLessonId = Number(new URLSearchParams(window.location.search).get("lesson") || 0);
    const currentLesson = getLessonById(currentLessonId);

    // -----------------------------------------------------------------
    // MEMORY
    // -----------------------------------------------------------------
    let conversationMemory = [];

    // -----------------------------------------------------------------
    // GUARD: DISABLE ON QUIZ PAGES
    // -----------------------------------------------------------------
    if (isQuizPage) {
      aiBtn?.remove();
      aiPanel?.remove();
      return;
    }

    // -----------------------------------------------------------------
    // INIT
    // -----------------------------------------------------------------
    function initAI() {
      if (!aiBtn || !aiPanel || !aiClose || !aiSend || !aiInput || !aiMessages) return;

      ensureClearButton();

      aiBtn.addEventListener("click", () => {
        aiPanel.classList.toggle(CSS.hidden);
        if (!aiPanel.classList.contains(CSS.hidden) && aiMessages.children.length === 0) {
          addInstructorMessage(getWelcomeMessage());
        }
      });

      aiClose.addEventListener("click", () => aiPanel.classList.add(CSS.hidden));
      aiSend.addEventListener("click", handleAISend);
      aiInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleAISend();
      });

      aiClear?.addEventListener("click", clearChat);
    }
    initAI();

    // -----------------------------------------------------------------
    // MESSAGE FLOW
    // -----------------------------------------------------------------
    async function handleAISend() {
      const question = aiInput.value.trim();
      if (!question || aiSend.disabled) return;

      addUserMessage(question);
      aiInput.value = "";
      aiSend.disabled = true;

      const id = addInstructorThinking();

      try {
        const response = await instructorAI(question);
        rememberConversation(question, response);
        replaceMessage(id, renderInstructor(response));
      } catch (err) {
        console.error("AI error:", err);

        const fallback = formatResponse({
          answer: "I hit a problem while building that response.",
          why: "Unexpected processing error.",
          where: currentLesson ? currentLesson.title : "General course review",
          example: "Try a shorter question tied to the lesson material.",
          followUp: "What specific part were you trying to understand?"
        });

        rememberConversation(question, fallback);
        replaceMessage(id, renderInstructor(fallback));
      } finally {
        aiSend.disabled = false;
        aiInput.focus();
      }
    }

    // -----------------------------------------------------------------
    // UI HELPERS
    // -----------------------------------------------------------------
    function renderMessage(label, body, role) {
      return `
        <div class="ai-msg ai-msg-${role}">
          <div class="ai-msg-label">${label}</div>
          <div class="ai-msg-body">${body}</div>
        </div>`;
    }

    function renderInstructor(html) {
      return renderMessage(LABELS.instructor, html, "instructor");
    }

    function renderUser(html) {
      return renderMessage(LABELS.user, escapeHtml(html), "user");
    }

    function addUserMessage(text) {
      const div = document.createElement("div");
      div.className = "ai-msg-row ai-msg-row-user";
      div.innerHTML = renderUser(text);
      aiMessages.appendChild(div);
      scrollAIToBottom();
    }

    function addInstructorMessage(html) {
      const div = document.createElement("div");
      div.className = "ai-msg-row ai-msg-row-instructor";
      div.innerHTML = renderInstructor(html);
      aiMessages.appendChild(div);
      scrollAIToBottom();
    }

    function addInstructorThinking() {
      const id = `thinking-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const div = document.createElement("div");
      div.className = "ai-msg-row ai-msg-row-instructor";
      div.dataset.msgId = id;
      div.innerHTML = renderInstructor(`<i class="thinking">Thinking</i>`);
      aiMessages.appendChild(div);
      scrollAIToBottom();
      return id;
    }

    function replaceMessage(id, html) {
      const target = aiMessages.querySelector(`[data-msg-id="${id}"]`);
      if (target) target.innerHTML = html;
      else addInstructorMessage(html);
      scrollAIToBottom();
    }

    function scrollAIToBottom() {
      aiMessages.scrollTop = aiMessages.scrollHeight;
    }

    function clearChat() {
      if (!window.confirm("Clear this conversation?")) return;
      aiMessages.innerHTML = "";
      conversationMemory = [];
      addInstructorMessage(getWelcomeMessage());
    }

    function ensureClearButton() {
      if (aiClear) return;

      const header =
        aiPanel?.querySelector(".ai-header") ||
        aiPanel?.querySelector(".ai-panel-header") ||
        aiPanel?.firstElementChild;

      aiClear = document.createElement("button");
      aiClear.id = "aiClear";
      aiClear.type = "button";
      aiClear.textContent = "Clear";
      aiClear.className = "ai-clear-btn";
      aiClear.title = "Clear chat";

      if (header) {
        header.appendChild(aiClear);
      } else if (aiPanel) {
        aiPanel.insertBefore(aiClear, aiPanel.firstChild);
      }
    }

    function escapeHtml(v) {
      return String(v ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    // -----------------------------------------------------------------
    // MEMORY HELPERS
    // -----------------------------------------------------------------
    function rememberConversation(userText, aiText) {
      conversationMemory.push({
        user: userText,
        ai: aiText,
        time: Date.now()
      });

      if (conversationMemory.length > 10) {
        conversationMemory.shift();
      }
    }

    function getRecentContext() {
      return conversationMemory.slice(-3);
    }

    function buildContextBridge(question) {
      const recent = getRecentContext();
      if (!recent.length) return "";

      const q = normalize(question);

      for (let i = recent.length - 1; i >= 0; i--) {
        const prev = recent[i];
        const prevQ = normalize(prev.user);

        const currentTokens = tokenize(q);
        const prevTokens = tokenize(prevQ);
        const overlap = currentTokens.filter((t) => prevTokens.includes(t));

        if (overlap.length >= 2) {
          return "This connects to what you asked a moment ago. ";
        }
      }

      return "";
    }

    // -----------------------------------------------------------------
    // PROGRESS / STAGE AWARENESS
    // -----------------------------------------------------------------
    function getCourseStats() {
      const lessons = Array.isArray(window.LESSONS) ? window.LESSONS : [];
      const totalLessons = lessons.length;

      let completed = 0;
      let currentIndex = 0;

      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        if (isLessonCompleted(lesson)) completed++;
        if (Number(lesson.id) === Number(currentLessonId)) currentIndex = i + 1;
      }

      if (!currentIndex && currentLesson) {
        currentIndex = lessons.findIndex((l) => Number(l.id) === Number(currentLesson.id)) + 1;
      }

      return {
        totalLessons,
        completed,
        currentIndex,
        remaining: Math.max(totalLessons - completed, 0)
      };
    }

    function isLessonCompleted(lesson) {
      if (!lesson) return false;

      if (lesson.completed === true) return true;
      if (lesson.passed === true) return true;
      if (typeof lesson.status === "string" && lesson.status.toLowerCase().includes("pass")) return true;
      if (typeof lesson.score === "number" && lesson.score >= 80) return true;

      return false;
    }

    function getProgressPhase() {
      const stats = getCourseStats();

      if (isDashboardPage && !currentLesson) return "dashboard";
      if (isScenarioPage) return "scenario";
      if (!stats.totalLessons) return "general";

      const ratio = stats.completed / stats.totalLessons;

      if (ratio >= 0.85) return "final";
      if (ratio >= 0.5) return "mid";
      if (ratio > 0) return "early";

      return currentLesson ? "current_lesson" : "general";
    }

    function getProgressMessage() {
      const stats = getCourseStats();
      const phase = getProgressPhase();

      if (phase === "dashboard") {
        if (stats.completed > 0) {
          return `You have completed ${stats.completed} of ${stats.totalLessons} lessons.`;
        }
        return "You are on the student dashboard.";
      }

      if (phase === "scenario") {
        return currentLesson
          ? `You are working through scenario material for ${escapeHtml(currentLesson.title)}.`
          : "You are in scenario review.";
      }

      if (currentLesson) {
        if (phase === "final") {
          return `You are in ${escapeHtml(currentLesson.title)} and you are in the late stage of the course. Focus on judgment, consistency, and clean review.`;
        }

        if (phase === "mid") {
          return `You are in ${escapeHtml(currentLesson.title)} and already have a good amount of course progress behind you. Tie this lesson back to the earlier fundamentals.`;
        }

        if (phase === "early" || phase === "current_lesson") {
          return `You are in ${escapeHtml(currentLesson.title)}. Stay focused on the core concept before trying to stack advanced ideas on top of it.`;
        }
      }

      return "You are in the course review area.";
    }

    function getProgressAwareFollowUp() {
      const phase = getProgressPhase();

      if (phase === "final") {
        const prompts = [
          "How does this connect to judgment under pressure?",
          "What mistake would show a weak understanding here?",
          "Could you explain this clearly without using course buzzwords?",
          "How does this tie back to lawful responsibility?"
        ];
        return prompts[Math.floor(Math.random() * prompts.length)];
      }

      if (phase === "mid") {
        const prompts = [
          "How does this connect back to earlier lessons?",
          "Where have you seen this principle already show up?",
          "What changes once stress gets added to this?",
          "What part of this is most likely to be misunderstood?"
        ];
        return prompts[Math.floor(Math.random() * prompts.length)];
      }

      const prompts = [
        "What is the core idea in plain language?",
        "What changes if you notice the problem earlier?",
        "Where would this matter in real life?",
        "What is the risk if you ignore this?"
      ];
      return prompts[Math.floor(Math.random() * prompts.length)];
    }

    // -----------------------------------------------------------------
    // WELCOME MESSAGE
    // -----------------------------------------------------------------
    function getWelcomeMessage() {
      const progressLine = getProgressMessage();

      return `
        Ask me about:
        <ul style="margin:8px 0 0 18px;padding:0;">
          <li>what a concept means</li>
          <li>why it matters</li>
          <li>where to review it</li>
          <li>a simple example or scenario if it helps</li>
        </ul>
        <br>
        ${progressLine}<br><br>
        <b>Important:</b> I teach, explain, and review — not give quiz answers.
      `;
    }

    // -----------------------------------------------------------------
    // UTILITIES & MATCHING HELPERS
    // -----------------------------------------------------------------
    function normalize(text) {
      return String(text || "").toLowerCase().trim();
    }

    function tokenize(q) {
      return normalize(q)
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2);
    }

    function scoreTextAgainstQuestion(tokens, text) {
      const hay = normalize(text);
      if (!tokens.length) return 0;

      let score = 0;
      let hits = 0;

      for (const t of tokens) {
        if (hay.includes(t)) {
          hits++;
          score += 4;
        } else {
          const stem = t.slice(0, Math.max(3, t.length - 3));
          if (hay.includes(stem)) score += 2;
        }
      }

      return (score / tokens.length) * (1 + hits / 10);
    }

    function looksLikeQuizAnswerRequest(q) {
      const patterns = [
        "give me the answer",
        "quiz answer",
        "correct answer",
        "which option is right",
        "what letter is right",
        "tell me the answer",
        "just give me the answer",
        "what is the answer",
        "what's the answer"
      ];
      return patterns.some((p) => q.includes(p));
    }

    function looksLikeScenarioQuestion(q) {
      return ["scenario", "what if ", "if someone", "suppose"].some((p) => q.includes(p));
    }

    function detectSocialIntent(q) {
      const greetings = ["hello", "hi", "hey", "good morning", "good afternoon"];
      const help = ["help", "can you help", "what can you do"];
      const thanks = ["thanks", "thank you", "appreciate it"];

      if (greetings.some((g) => q === g || q.startsWith(g))) return "greeting";
      if (help.some((h) => q.includes(h))) return "help";
      if (thanks.some((t) => q.includes(t))) return "thanks";

      return null;
    }

    function formatSocialResponse(type) {
      const progressLine = getProgressMessage();

      if (type === "greeting") {
        return `Hey. I’m here to help you work through the training.<br><br><b>Current focus:</b> ${progressLine}`;
      }

      if (type === "help") {
        return `I can explain concepts, break down scenarios, and point you back to the right part of the course.<br><br><b>Current focus:</b> ${progressLine}`;
      }

      if (type === "thanks") {
        return `Good. Keep going — that’s how this sticks.`;
      }

      return `Ask me about the lesson material and I’ll help you work through it.`;
    }

    function detectStruggle(q) {
      return [
        "i dont get",
        "i don't get",
        "still confused",
        "confused",
        "doesn't make sense",
        "does not make sense",
        "still dont",
        "still don't",
        "what do you mean",
        "im lost",
        "i'm lost"
      ].some((p) => q.includes(p));
    }

    function maybePrefixInstructorTone(text) {
      const phase = getProgressPhase();

      let prefixes = [
        "Pay attention to this — ",
        "This part matters — ",
        "Don’t miss this — ",
        ""
      ];

      if (phase === "final") {
        prefixes = [
          "Lock this in — ",
          "This has to be solid — ",
          "Be clear on this — ",
          ""
        ];
      }

      const pick = prefixes[Math.floor(Math.random() * prefixes.length)];
      return `${pick}${text}`;
    }

    // -----------------------------------------------------------------
    // MAIN AI CORE
    // -----------------------------------------------------------------
    async function instructorAI(raw) {
      const question = normalize(raw);

      const social = detectSocialIntent(question);
      if (social) return formatSocialResponse(social);

      if (looksLikeQuizAnswerRequest(question)) return formatBlockedResponse();

      if (detectStruggle(question)) {
        return formatResponse({
          answer: "Alright — slow it down. You do not need to solve everything at once.",
          why: "People get lost when they stack too many ideas together instead of locking onto the core concept first.",
          where: currentLesson ? currentLesson.title : "Go back to the current lesson summary",
          example: "Take one concept, define it plainly, then connect it to the situation.",
          followUp: "Which single part is the one giving you trouble?"
        });
      }

      const contextBridge = buildContextBridge(question);

      const direct = findDirectConceptResponse(question);
      if (direct) {
        direct.answer = maybePrefixInstructorTone(contextBridge + direct.answer);
        return formatResponse(direct);
      }

      const sectionMatch = findBestSectionMatch(question);
      if (sectionMatch) {
        const response = buildSectionResponse(sectionMatch, question);
        response.answer = maybePrefixInstructorTone(contextBridge + response.answer);
        return formatResponse(response);
      }

      if (looksLikeScenarioQuestion(question)) {
        const scenario = findScenarioResponse(question, contextBridge);
        if (scenario) return scenario;
      }

      const quizConcept = findQuizConceptMatch(question);
      if (quizConcept) {
        quizConcept.answer = maybePrefixInstructorTone(contextBridge + quizConcept.answer);
        return formatResponse(quizConcept);
      }

      const semantic = semanticSearch(question);
      if (semantic) {
        return formatResponse({
          answer: maybePrefixInstructorTone(contextBridge + semantic.text),
          why: "This line is the closest match to what you asked inside the course material.",
          where: semantic.where,
          example: "Go back to that section and read the lines around it so the full point stays clear."
        });
      }

      return formatResponse({
        answer: maybePrefixInstructorTone(
          contextBridge + "That question does not line up cleanly with a specific section yet."
        ),
        why: "I stay inside the certified course material so the explanation stays accurate and on track.",
        where: "Review the core lessons: awareness, law, aftermath, readiness, and responsibility.",
        example: "Use a key term from the lesson or chapter summary and I can usually narrow it down fast."
      });
    }

    // -----------------------------------------------------------------
// BSA PHILOSOPHY LOCK
// -----------------------------------------------------------------
const BSA_PHILOSOPHY = {
  core: "Avoid the problem whenever possible. The firearm is a last resort.",
  noBeThere: "If something feels wrong, you do not wait to confirm it. You leave.",
  responsibility: "Carrying a firearm increases responsibility, not authority.",
  escalation: "If a firearm is needed, something has already gone very wrong."
};

function applyPhilosophy(answer) {
  // Light-touch reinforcement (not every response)
  const inserts = [
    "Remember — the goal is to avoid needing the firearm.",
    "This ties back to the idea of not being there in the first place.",
    "The firearm is not the plan — it is the last option.",
    "Responsibility means knowing when not to act."
  ];

  // 40% chance to reinforce tone
  if (Math.random() < 0.4) {
    const line = inserts[Math.floor(Math.random() * inserts.length)];
    return answer + "<br><br><i>" + line + "</i>";
  }

  return answer;
}
    
    // -----------------------------------------------------------------
    // DIRECT MAP
    // -----------------------------------------------------------------
    function findDirectConceptResponse(q) {
      const map = [
        {
          test: ["condition yellow"],
          r: {
            answer: "Condition Yellow means you are relaxed — but paying attention.",
            why: "It gives you time to notice problems early instead of being surprised by them.",
            where: "Lesson 1 → Awareness Levels",
            example: "You are in a store, calm, but still noticing exits, people, and changes around you."
          }
        },
        {
          test: ["condition white"],
          r: {
            answer: "Condition White means you are unaware and mentally checked out.",
            why: "If you are not paying attention, you lose time and options.",
            where: "Lesson 1 → Awareness Levels",
            example: "Walking while distracted and failing to notice what is happening around you."
          }
        },
        {
          test: ["castle doctrine"],
          r: {
            answer: "Castle Doctrine deals with how the law may lower certain force thresholds inside the home.",
            why: "It still requires lawful judgment. It is not a free pass to act without thinking.",
            where: "Lesson 4 → Home Versus Property",
            example: "Defense of life and defense of property are not the same thing under the law."
          }
        },
        {
          test: ["permitless carry"],
          r: {
            answer: "Louisiana allows permitless carry for eligible adults who are not prohibited from possessing firearms.",
            why: "That changes permit requirements. It does not remove your responsibility to know the law and act responsibly.",
            where: "Lesson 8 → Permitless Carry in Louisiana",
            example: "You may be able to carry lawfully and still violate the law if you ignore restricted places or impairment rules."
          }
        },
        {
          test: ["most firearm deaths"],
          r: {
            answer: "Most firearm deaths in the United States are suicides, not homicides.",
            why: "That matters because prevention, warning signs, and temporary separation from firearms can save lives.",
            where: "Lesson 9 → Suicide Prevention and Warning Signs",
            example: "Recognizing crisis language early can matter more than people think."
          }
        }
      ];

      for (const m of map) {
        if (m.test.some((p) => q.includes(p))) return m.r;
      }

      return null;
    }

    // -----------------------------------------------------------------
    // LESSON HELPERS
    // -----------------------------------------------------------------
    function getLessonById(id) {
      return Array.isArray(window.LESSONS)
        ? window.LESSONS.find((l) => Number(l.id) === Number(id))
        : null;
    }

    function getSearchableLessons() {
      const arr = Array.isArray(window.LESSONS) ? window.LESSONS : [];

      if (currentLessonId) {
        const cur = arr.find((l) => Number(l.id) === Number(currentLessonId));
        const others = arr.filter((l) => Number(l.id) !== Number(currentLessonId));
        return cur ? [cur, ...others] : arr;
      }

      return arr;
    }

    function findBestSectionMatch(question) {
      const tokens = tokenize(question);
      let best = null;

      for (const lesson of getSearchableLessons()) {
        for (const s of lesson.sections || []) {
          const text = [s.heading, ...(s.body || [])].join(" ");
          const score = scoreTextAgainstQuestion(tokens, text);

          if (!best || score > best.score) {
            best = { lesson, section: s, score };
          }
        }
      }

      return best && best.score > 0.45 ? best : null;
    }

    function buildSectionResponse(match, question) {
      const { lesson, section } = match;
      const answer =
        pickBestLine(section.body || [], question) ||
        section.body?.[0] ||
        lesson.summary ||
        "That section covers the concept you are asking about.";

      return {
        answer,
        why: buildWhy(section, lesson),
        where: `${lesson.title} → ${section.heading}`,
        example: buildExampleFromLesson(lesson, section)
      };
    }

    function pickBestLine(lines, q) {
      const t = tokenize(q);
      let top = { line: null, score: 0 };

      for (const line of lines || []) {
        const s = scoreTextAgainstQuestion(t, line);
        if (s > top.score) top = { line, score: s };
      }

      return top.line;
    }

    function buildWhy(section, lesson) {
      const all = (section.body || []).join(" ").toLowerCase();

      if (all.includes("avoid")) return "Avoidance matters because prevention beats reaction.";
      if (all.includes("aware")) return "Awareness gives you more time, more choices, and better judgment.";
      if (all.includes("verify")) return "Verification matters because safety depends on what you personally confirm.";
      if (all.includes("stress")) return "Understanding stress helps you make better decisions before, during, and after an event.";
      if ((lesson.title || "").toLowerCase().includes("law")) {
        return "Legal questions turn on reasonableness, necessity, and judgment.";
      }

      return "Understanding the concept clearly leads to safer and more lawful decisions.";
    }

    function buildExampleFromLesson(lesson, section) {
      const t = `${lesson.title} ${section.heading}`.toLowerCase();

      if (t.includes("law")) return "Think about whether force is truly justified — not just emotionally understandable.";
      if (t.includes("firearm")) return "Think about what you personally verified before handling the firearm.";
      if (t.includes("awareness")) return "Think about what changes when you notice the issue early instead of late.";
      if (t.includes("suicide") || t.includes("mental")) {
        return "Think about how temporary separation and early intervention can change the outcome.";
      }

      return "Take the same principle and apply it to a real-world situation without adding extra assumptions.";
    }

    // -----------------------------------------------------------------
    // QUIZ + SCENARIO SEARCH
    // -----------------------------------------------------------------
    function findQuizConceptMatch(q) {
      const tokens = tokenize(q);
      const bank = window.QUIZ_BANK || {};
      let best = { score: 0 };

      for (const [lid, set] of Object.entries(bank)) {
        for (const it of set || []) {
          const base = [it.q, it.explanation].join(" ");
          const s = scoreTextAgainstQuestion(tokens, base);

          if (s > best.score) {
            best = { score: s, item: it, lessonId: lid };
          }
        }
      }

      if (best.score < 0.4) return null;

      const lesson = getLessonById(best.lessonId);

      return {
        answer: stripQuizTone(best.item.q),
        why: best.item.explanation || "This is a core concept covered in the quiz material.",
        where: lesson ? lesson.title : `Lesson ${best.lessonId}`,
        example: best.item.critical ? "This is a critical concept. Make sure you understand why it works, not just what it says." : ""
      };
    }

    function stripQuizTone(q) {
      return String(q || "").replace(/^true or false:\s*/i, "");
    }

    function findScenarioResponse(q, contextBridge = "") {
      const t = tokenize(q);
      let best = { score: 0 };

      for (const lesson of getSearchableLessons()) {
        for (const sc of lesson.scenarios || []) {
          const text = `${sc.prompt} ${sc.explanation}`;
          const score = scoreTextAgainstQuestion(t, text);

          if (score > best.score) {
            best = { score, lesson, sc };
          }
        }
      }

      if (best.score < 0.4) return null;

      return formatResponse({
        answer: maybePrefixInstructorTone(
          contextBridge + "Training points you toward the safer and more responsible response."
        ),
        why: best.sc.explanation,
        where: `${best.lesson.title} → Scenario Review`,
        example: best.sc.prompt
      });
    }

    // -----------------------------------------------------------------
    // SEMANTIC SEARCH
    // -----------------------------------------------------------------
    function semanticSearch(q) {
      const tokens = tokenize(q);
      let best = { score: 0 };

      for (const lesson of window.LESSONS || []) {
        for (const sec of lesson.sections || []) {
          for (const line of sec.body || []) {
            const s = scoreTextAgainstQuestion(tokens, line);

            if (s > best.score) {
              best = {
                score: s,
                text: line,
                where: `${lesson.title} → ${sec.heading}`
              };
            }
          }
        }
      }

      for (const [lid, qs] of Object.entries(window.QUIZ_BANK || {})) {
        for (const item of qs || []) {
          const s = scoreTextAgainstQuestion(tokens, [item.q, item.explanation].join(" "));
          if (s > best.score) {
            const lesson = getLessonById(lid);
            best = {
              score: s,
              text: item.explanation || item.q,
              where: lesson ? `${lesson.title} (quiz concept)` : `Lesson ${lid}`
            };
          }
        }
      }

      return best.score > 0.35 ? best : null;
    }

    // -----------------------------------------------------------------
    // FORMAT HELPERS
    // -----------------------------------------------------------------
    function formatResponse({ answer, why, where, example, followUp }) {
      const prompt = followUp || getProgressAwareFollowUp();

      return `
        ${answer}<br><br>
        <b>Why it matters:</b> ${why}<br><br>
        <b>Go back to:</b> ${where}
        ${example ? `<br><br><b>Example:</b> ${example}` : ""}
        <br><br><b>Think about this:</b> ${prompt}
      `;
    }

    function formatBlockedResponse() {
      return `
        I’m not going to give you a direct quiz or test answer.<br><br>
        <b>Why it matters:</b> Understanding the concept matters more than memorizing a choice.<br><br>
        <b>Go back to:</b> Review the lesson tied to that question, or ask me to explain the concept behind it.<br><br>
        <b>Think about this:</b> What principle is that question actually testing?
      `;
    }

    // -----------------------------------------------------------------
    // STYLE INJECTION (with animated thinking …)
    // -----------------------------------------------------------------
    (function injectStyles() {
      if (document.getElementById("aiChatBubbleStyles")) return;
      const s = document.createElement("style");
      s.id = "aiChatBubbleStyles";
      s.textContent = `
        .ai-msg-row{display:flex;margin:10px 0;width:100%;}
        .ai-msg-row-user{justify-content:flex-end;}
        .ai-msg-row-instructor{justify-content:flex-start;}
        .ai-msg{max-width:88%;border-radius:14px;padding:10px 12px;
          line-height:1.45;box-shadow:0 2px 8px rgba(0,0,0,.06);font-size:14px;}
        .ai-msg-user{background:#1e3a8a;color:#fff;border-bottom-right-radius:4px;}
        .ai-msg-instructor{background:#f8fbff;color:#142033;border:1px solid #d9e0ec;border-bottom-left-radius:4px;}
        .ai-msg-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px;opacity:.82;}
        .ai-msg-user .ai-msg-label{color:rgba(255,255,255,.88);}
        .ai-msg-instructor .ai-msg-label{color:#1f468c;}
        .ai-msg-body{white-space:normal;word-break:break-word;}
        .thinking::after{content:'';display:inline-block;width:1ch;animation:dots 1.2s steps(4,end) infinite;}
        @keyframes dots{0%,20%{content:'';}40%{content:'.';}60%{content:'..';}80%,100%{content:'...';}}

        .ai-clear-btn{
          margin-left:auto;
          padding:6px 12px;
          border:1px solid #cfd6e3;
          background:#ffffff;
          color:#19376d;
          border-radius:8px;
          font-size:12px;
          font-weight:600;
          cursor:pointer;
        }

        .ai-clear-btn:hover{
          background:#f5f8ff;
        }
      `;
      document.head.appendChild(s);
    })();
  })();
}
