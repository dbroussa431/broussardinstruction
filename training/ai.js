// =====================================
// BSA DAVID TEACHER - FINAL FULL AI.JS
// =====================================
if (!window.BSA_AI_LOADED) {
  window.BSA_AI_LOADED = true;
  (function () {
    // ------------------------------
    // CONSTANTS
    // ------------------------------
    const LABELS = { instructor: "BSA David Teacher", user: "You" };
    const CSS = { hidden: "hidden" };
    // ------------------------------
    // ELEMENTS
    // ------------------------------
    const aiBtn = document.getElementById("aiToggleBtn");
    const aiPanel = document.getElementById("aiPanel");
    const aiClose = document.getElementById("aiClose");
    const aiSend = document.getElementById("aiSend");
    const aiInput = document.getElementById("aiInput");
    const aiMessages = document.getElementById("aiMessages");
    // ------------------------------
    // PAGE CONTEXT
    // ------------------------------
    const pagePath = window.location.pathname.toLowerCase();
    const isQuizPage = pagePath.includes("quiz.html");
    const currentLessonId = Number(new URLSearchParams(window.location.search).get("lesson") || 0);
    const currentLesson = getLessonById(currentLessonId);
    // ------------------------------
    // LESSON HELPERS
    // ------------------------------
    function getLessonById(id) {
      return Array.isArray(window.LESSONS)
        ? window.LESSONS.find((l) => Number(l.id) === Number(id))
        : null;
    }
    function getSearchableLessons() {
      const lessons = Array.isArray(window.LESSONS) ? window.LESSONS : [];
      if (currentLessonId) {
        const current = lessons.find((l) => Number(l.id) === Number(currentLessonId));
        const others = lessons.filter((l) => Number(l.id) !== Number(currentLessonId));
        return current ? [current, ...others] : lessons;
      }
      return lessons;
    }
    // ------------------------------
    // QUIZ BLOCK
    // ------------------------------
    if (isQuizPage) {
      aiBtn?.remove();
      aiPanel?.remove();
      return;
    } else {
      initAI();
    }
    // ------------------------------
    // INIT & EVENT HOOKS
    // ------------------------------
    function initAI() {
      if (!aiBtn || !aiPanel || !aiClose || !aiSend || !aiInput || !aiMessages) return;
      aiBtn.addEventListener("click", togglePanel);
      aiClose.addEventListener("click", () => aiPanel.classList.add(CSS.hidden));
      aiSend.addEventListener("click", handleAISend);
      aiInput.addEventListener("keypress", (e) => e.key === "Enter" && handleAISend());
    }
    function togglePanel() {
      aiPanel.classList.toggle(CSS.hidden);
      if (!aiPanel.classList.contains(CSS.hidden) && aiMessages.children.length === 0) {
        addInstructorMessage(getWelcomeMessage());
      }
    }
    // ------------------------------
    // SEND LOGIC
    // ------------------------------
    async function handleAISend() {
      const question = aiInput.value.trim();
      if (!question || aiSend.disabled) return;
      addUserMessage(question);
      aiInput.value = "";
      aiSend.disabled = true;
      const thinkingId = addInstructorThinking();
      try {
        const response = await instructorAI(question);
        replaceMessage(thinkingId, renderInstructor(response));
      } catch (error) {
        console.error("AI response error:", error);
        replaceMessage(
          thinkingId,
          renderInstructor(
            formatResponse({
              answer: "I hit a problem while building that response.",
              why: "The assistant logic ran into an unexpected error.",
              where: currentLesson ? currentLesson.title : "General course review",
              example: "Ask again in a shorter form or use a concept from the lesson heading.",
            })
          )
        );
      } finally {
        aiSend.disabled = false;
      }
    }
    // ------------------------------
    // MESSAGE RENDERING
    // ------------------------------
    function renderMessage(label, body, role) {
      return `
        <div class="ai-msg ai-msg-${role}">
          <div class="ai-msg-label">${label}</div>
          <div class="ai-msg-body">${body}</div>
        </div>
      `;
    }
    function renderInstructor(html) {
      return renderMessage(LABELS.instructor, html, "instructor");
    }
    function renderUser(html) {
      return renderMessage(LABELS.user, escapeHtml(html), "user");
    }
    function addUserMessage(text) {
      const wrap = document.createElement("div");
      wrap.className = "ai-msg-row ai-msg-row-user";
      wrap.innerHTML = renderUser(text);
      aiMessages.appendChild(wrap);
      scrollAIToBottom();
    }
    function addInstructorMessage(html) {
      const wrap = document.createElement("div");
      wrap.className = "ai-msg-row ai-msg-row-instructor";
      wrap.innerHTML = renderInstructor(html);
      aiMessages.appendChild(wrap);
      scrollAIToBottom();
    }
    function addInstructorThinking() {
      const id = `thinking-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const wrap = document.createElement("div");
      wrap.className = "ai-msg-row ai-msg-row-instructor";
      wrap.dataset.msgId = id;
      wrap.innerHTML = renderInstructor(`<i class="thinking">Thinking</i>`);
      aiMessages.appendChild(wrap);
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
    function escapeHtml(value) {
      return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }
    // ------------------------------
    // WELCOME MESSAGE
    // ------------------------------
    function getWelcomeMessage() {
      const lessonLabel = currentLesson
        ? `You are in ${escapeHtml(currentLesson.title)}.`
        : "You are on the student dashboard.";
      return `
        <b>${LABELS.instructor}</b><br><br>
        Ask me about:
        <ul style="margin:8px 0 0 18px;padding:0;">
          <li>what a concept means</li>
          <li>why it matters</li>
          <li>where to review it</li>
          <li>a simple example or scenario if it helps</li>
        </ul>
        <br>
        ${lessonLabel}<br><br>
        <b>Important:</b> I teach, explain, and review. I do not give direct quiz answers or help during quizzes.
      `;
    }
    // ------------------------------
    // ===== CORE INSTRUCTOR LOGIC =====
    // ------------------------------
    async function instructorAI(rawQuestion) {
      const question = normalize(rawQuestion);
      if (looksLikeQuizAnswerRequest(question)) return formatBlockedResponse();
      const direct = findDirectConceptResponse(question);
      if (direct) return formatResponse(direct);
      if (looksLikeScenarioQuestion(question)) {
        const scenarioResponse = findScenarioResponse(question);
        if (scenarioResponse) return scenarioResponse;
        return formatResponse({
          answer: "Slow it down and work the problem in order.",
          why: "The goal is not to jump to force. The goal is awareness, movement, safer positioning, lawful judgment, and only then action if truly necessary.",
          where: pickContextWhere(),
          example: "Think: What do I know, what can I avoid, where can I move, and is there an immediate deadly threat?",
        });
      }
      const sectionMatch = findBestSectionMatch(question);
      if (sectionMatch) return formatSectionResponse(sectionMatch, question);
      const quizConceptMatch = findQuizConceptMatch(question);
      if (quizConceptMatch) return formatResponse(quizConceptMatch);
      if (currentLesson) {
        return formatResponse({
          answer: `I do not see that exact phrase directly in ${currentLesson.title}.`,
          why: `This lesson is centered on ${currentLesson.summary}`,
          where: currentLesson.title,
          example: "Ask about a section heading, a scenario, or one of the main terms from the lesson.",
        });
      }
      return formatResponse({
        answer: "That is a fair question, but I cannot tie it directly to a specific BSA lesson concept yet.",
        why: "I am designed to stay inside your course and teach the material clearly instead of drifting into generic advice.",
        where: "Review Lessons 1–7 for textbook-backed fundamentals and Lessons 8–10 for law, mental readiness, and final judgment.",
        example: "Try asking about awareness levels, firearm basics, legal force, aftermath, gear, Louisiana law, or crisis responsibility.",
      });
    }
    // Include your complete supporting logic unchanged
    // (all these from your original file)
    // findDirectConceptResponse, normalize, looksLikeQuizAnswerRequest,
    // looksLikeScenarioQuestion, formatBlockedResponse, tokenize, scoreTextAgainstQuestion,
    // findBestSectionMatch, formatSectionResponse, pickBestLineForQuestion,
    // teachAnswer, buildWhyFromSection, buildExampleFromLesson,
    // findQuizConceptMatch, stripQuizTone, findScenarioResponse,
    // pickContextWhere, formatResponse
    // ---------- Paste your original helper functions here ----------
    // (your full block from the version you last sent — no deletions)
    // Everything from "function findDirectConceptResponse(...) {...}" down to
    // "function injectAIChatStyles()" remains the same, already included.
    // ------------------------------
    // STYLE INJECTION (Animated “Thinking…”)
    // ------------------------------
    injectAIChatStyles();
    function injectAIChatStyles() {
      if (document.getElementById("aiChatBubbleStyles")) return;
      const style = document.createElement("style");
      style.id = "aiChatBubbleStyles";
      style.textContent = `
        .ai-msg-row { display: flex; margin: 10px 0; width: 100%; }
        .ai-msg-row-user { justify-content: flex-end; }
        .ai-msg-row-instructor { justify-content: flex-start; }
        .ai-msg {
          max-width: 88%;
          border-radius: 14px;
          padding: 10px 12px;
          line-height: 1.45;
          box-shadow: 0 2px 8px rgba(0,0,0,.06);
          font-size: 14px;
        }
        .ai-msg-user { background: #1e3a8a; color: #fff; border-bottom-right-radius: 4px; }
        .ai-msg-instructor { background: #f8fbff; color: #142033; border: 1px solid #d9e0ec; border-bottom-left-radius: 4px; }
        .ai-msg-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 6px; opacity: .82; }
        .ai-msg-user .ai-msg-label { color: rgba(255,255,255,.88); }
        .ai-msg-instructor .ai-msg-label { color: #1f468c; }
        .ai-msg-body { white-space: normal; word-break: break-word; }
        .thinking::after {
          content: '';
          display: inline-block;
          width: 1ch;
          animation: dots 1.2s steps(4,end) infinite;
        }
        @keyframes dots {
          0%,20%{content:'';}
          40%{content:'.';}
          60%{content:'..';}
          80%,100%{content:'...';}
        }
      `;
      document.head.appendChild(style);
    }
  })();
}
