// =====================================================================
// BSA DAVID TEACHER - COMPLETE SMART AI.JS (ver. 5.1 CLEAN BUILD)
// =====================================================================
// 
// FULL REBUILT VERSION - CHATGPT STYLE UI, SAME INSTRUCTOR PHILOSOPHY
// =====================================================================

if (!window.BSA_AI_LOADED) {
  window.BSA_AI_LOADED = true;

  (function () {
    const aiBtn = document.getElementById("aiToggleBtn");
    const aiPanel = document.getElementById("aiPanel");
    const aiClose = document.getElementById("aiClose");
    const aiSend = document.getElementById("aiSend");
    const aiInput = document.getElementById("aiInput");
    const aiMessages = document.getElementById("aiMessages");

    let aiClear = document.getElementById("aiClear");

    const pagePath = window.location.pathname.toLowerCase();
    const isQuizPage = pagePath.includes("quiz.html");
    const currentLessonId = Number(new URLSearchParams(window.location.search).get("lesson") || 0);
    const currentLesson = getLessonById(currentLessonId);

    let conversationMemory = [];

    if (isQuizPage) {
      aiBtn?.remove();
      aiPanel?.remove();
      return;
    }

    function applyPhilosophy(answer) {
      const inserts = [
        "Remember — the goal is to avoid needing the firearm.",
        "The firearm is not the plan — it is the last option.",
        "This ties back to not being there in the first place.",
        "Responsibility means knowing when not to act."
      ];

      if (Math.random() < 0.4) {
        const line = inserts[Math.floor(Math.random() * inserts.length)];
        return `${answer}<br><br><em>${line}</em>`;
      }

      return answer;
    }

    function applyInstructorTone(answer) {
      const openers = [
        "Good question.",
        "Here’s how I want you to think about this.",
        "This is important.",
        "Let me simplify this."
      ];

      const closers = [
        "Don’t overcomplicate it.",
        "Keep it simple and stay in control.",
        "Think before you act.",
        "This is where people make mistakes."
      ];

      let result = answer;

      if (Math.random() < 0.3) {
        result = `<strong>${openers[Math.floor(Math.random() * openers.length)]}</strong><br><br>${result}`;
      }

      if (Math.random() < 0.3) {
        result += `<br><br><em>${closers[Math.floor(Math.random() * closers.length)]}</em>`;
      }

      return result;
    }

    function addCoachingQuestion(answer) {
      const prompts = [
        "What would you do in that situation?",
        "Where would this matter in real life?",
        "What mistake do people usually make here?",
        "How could you avoid this entirely?"
      ];

      if (Math.random() < 0.35) {
        return `${answer}<br><br><strong>${prompts[Math.floor(Math.random() * prompts.length)]}</strong>`;
      }

      return answer;
    }

    function finalizeAnswer(answer) {
      answer = applyPhilosophy(answer);
      answer = applyInstructorTone(answer);
      answer = addCoachingQuestion(answer);
      return answer;
    }

    function initAI() {
      if (!aiBtn || !aiPanel || !aiClose || !aiSend || !aiInput || !aiMessages) return;

      ensureClearButton();

      aiBtn.addEventListener("click", () => {
        aiPanel.classList.toggle("hidden");

        if (!aiPanel.classList.contains("hidden")) {
          if (!aiMessages.dataset.initialized) {
            aiMessages.innerHTML = "";
            addInstructorMessage(getWelcomeMessage());
            aiMessages.dataset.initialized = "true";
          }
          aiInput.focus();
        }
      });

      aiClose.addEventListener("click", () => {
        aiPanel.classList.add("hidden");
      });

      aiSend.addEventListener("click", handleAISend);

      aiInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleAISend();
      });

      if (aiClear) {
        aiClear.addEventListener("click", clearChat);
      }
    }

    initAI();

    function handleAISend() {
      const question = aiInput.value.trim();
      if (!question || aiSend.disabled) return;

      addUserMessage(question);
      aiInput.value = "";
      aiSend.disabled = true;

      const thinkingId = addThinking();

      setTimeout(() => {
        try {
          const response = instructorAI(question);
          rememberConversation(question, response);
          replaceMessage(thinkingId, renderInstructor(response));
        } catch (error) {
          console.error("BSA AI error:", error);
          replaceMessage(
            thinkingId,
            renderInstructor(
              finalizeAnswer("I hit a problem building that response. Ask it a little simpler and keep it tied to the lesson.")
            )
          );
        } finally {
          aiSend.disabled = false;
          aiInput.focus();
        }
      }, 450);
    }

    function instructorAI(rawQuestion) {
      const question = normalize(rawQuestion);

      if (isGreeting(question)) {
        return finalizeAnswer("I’m here. Ask me about the lesson and I’ll help you work through it.");
      }

      if (isHelpRequest(question)) {
        return finalizeAnswer("I explain concepts, break things down, and help you think through situations from the course.");
      }

      if (isThanks(question)) {
        return finalizeAnswer("Good. Keep going. Understanding matters more than memorizing.");
      }

      if (looksLikeQuizAnswerRequest(question)) {
        return `
          I’m not going to give you a direct quiz or test answer.<br><br>
          <strong>Why it matters:</strong> Understanding the concept matters more than memorizing a choice.<br><br>
          <strong>Go back to:</strong> Review the lesson tied to that question, or ask me to explain the concept behind it.<br><br>
          <strong>Think about this:</strong> What principle is that question actually testing?
        `;
      }

      if (isOffTrack(question)) {
        return finalizeAnswer("I’ll keep you focused on the training. Ask me about awareness, safety, judgment, responsibility, or a lesson concept and I’ll help.");
      }

      if (detectStruggle(question)) {
        return finalizeAnswer(
          `Alright — slow it down.<br><br>
          Lock onto one idea first. Define it clearly, then connect it to the situation.<br><br>
          <strong>Start here:</strong> ${currentLesson ? currentLesson.title : "current lesson"}`
        );
      }

      const direct = findDirectResponse(question);
      if (direct) {
        return finalizeAnswer(direct);
      }

      const sectionMatch = findBestSectionMatch(question);
      if (sectionMatch) {
        const answerLine =
          pickBestLine(sectionMatch.section.body || [], question) ||
          sectionMatch.section.body?.[0] ||
          currentLesson?.summary ||
          "That concept is covered in your lesson.";

        return finalizeAnswer(
          `${answerLine}<br><br>
          <strong>Why it matters:</strong> ${buildWhy(sectionMatch.section, sectionMatch.lesson)}<br><br>
          <strong>Go back to:</strong> ${sectionMatch.lesson.title} → ${sectionMatch.section.heading}`
        );
      }

      const scenarioMatch = findScenarioResponse(question);
      if (scenarioMatch) {
        return finalizeAnswer(
          `Training points you toward the safer and more responsible response.<br><br>
          <strong>Why it matters:</strong> ${scenarioMatch.explanation}<br><br>
          <strong>Go back to:</strong> ${scenarioMatch.where}`
        );
      }

      return finalizeAnswer(
        `Ask using a concept from the lesson and I’ll break it down clearly.<br><br>
        <strong>Current focus:</strong> ${currentLesson ? currentLesson.title : "Course review"}`
      );
    }

    function normalize(text) {
      return String(text || "").toLowerCase().trim();
    }

    function tokenize(text) {
      return normalize(text)
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2);
    }

    function isGreeting(q) {
      return ["hello", "hi", "hey", "good morning", "good afternoon"].some((x) => q === x || q.startsWith(x));
    }

    function isHelpRequest(q) {
      return ["help", "can you help", "what can you do"].some((x) => q.includes(x));
    }

    function isThanks(q) {
      return ["thanks", "thank you", "appreciate it"].some((x) => q.includes(x));
    }

    function isOffTrack(q) {
      return ["joke", "movie", "politics", "random", "meme"].some((x) => q.includes(x));
    }

    function detectStruggle(q) {
      return [
        "i dont get",
        "i don't get",
        "still confused",
        "confused",
        "doesn't make sense",
        "does not make sense",
        "what do you mean",
        "im lost",
        "i'm lost"
      ].some((x) => q.includes(x));
    }

    function looksLikeQuizAnswerRequest(q) {
      return [
        "give me the answer",
        "quiz answer",
        "correct answer",
        "which option is right",
        "what letter is right",
        "tell me the answer",
        "just give me the answer",
        "what is the answer",
        "what's the answer"
      ].some((x) => q.includes(x));
    }

    function scoreTextAgainstQuestion(tokens, text) {
      const hay = normalize(text);
      if (!tokens.length) return 0;

      let score = 0;
      let hits = 0;

      for (const token of tokens) {
        if (hay.includes(token)) {
          hits++;
          score += 4;
        } else {
          const stem = token.slice(0, Math.max(3, token.length - 3));
          if (hay.includes(stem)) score += 2;
        }
      }

      return (score / tokens.length) * (1 + hits / 10);
    }

    function findDirectResponse(q) {
      const map = [
        {
          keys: ["condition yellow"],
          answer: "Condition Yellow means you are relaxed — but paying attention."
        },
        {
          keys: ["condition white"],
          answer: "Condition White means you are unaware and mentally checked out."
        },
        {
          keys: ["no be there", "avoidance"],
          answer: "The point is to avoid the problem early instead of proving you can handle it late."
        },
        {
          keys: ["responsibility", "responsible firearm owner"],
          answer: "Carrying a firearm increases responsibility, not authority."
        },
        {
          keys: ["castle doctrine"],
          answer: "Castle Doctrine deals with how the law may lower certain force thresholds inside the home, but it still requires lawful judgment."
        },
        {
          keys: ["permitless carry"],
          answer: "Permitless carry changes permit requirements. It does not remove your responsibility to know the law and act responsibly."
        },
        {
          keys: ["most firearm deaths", "suicide"],
          answer: "Most firearm deaths in the United States are suicides, not homicides."
        },
        {
          keys: ["shoot", "gun"],
          answer: "Skill matters — but judgment matters more. Avoidance is always your first move."
        }
      ];

      for (const item of map) {
        if (item.keys.some((key) => q.includes(key))) return item.answer;
      }

      return null;
    }

    function getLessonById(id) {
      return Array.isArray(window.LESSONS)
        ? window.LESSONS.find((lesson) => Number(lesson.id) === Number(id))
        : null;
    }

    function getSearchableLessons() {
      const lessons = Array.isArray(window.LESSONS) ? window.LESSONS : [];
      if (!currentLessonId) return lessons;

      const current = lessons.find((lesson) => Number(lesson.id) === Number(currentLessonId));
      const others = lessons.filter((lesson) => Number(lesson.id) !== Number(currentLessonId));
      return current ? [current, ...others] : lessons;
    }

    function findBestSectionMatch(question) {
      const tokens = tokenize(question);
      let best = null;

      for (const lesson of getSearchableLessons()) {
        for (const section of lesson.sections || []) {
          const text = [section.heading, ...(section.body || [])].join(" ");
          const score = scoreTextAgainstQuestion(tokens, text);

          if (!best || score > best.score) {
            best = { lesson, section, score };
          }
        }
      }

      return best && best.score > 0.45 ? best : null;
    }

    function pickBestLine(lines, question) {
      const tokens = tokenize(question);
      let top = { line: null, score: 0 };

      for (const line of lines) {
        const score = scoreTextAgainstQuestion(tokens, line);
        if (score > top.score) top = { line, score };
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

    function findScenarioResponse(question) {
      const tokens = tokenize(question);
      let best = { score: 0 };

      for (const lesson of getSearchableLessons()) {
        for (const scenario of lesson.scenarios || []) {
          const text = `${scenario.prompt} ${scenario.explanation}`;
          const score = scoreTextAgainstQuestion(tokens, text);

          if (score > best.score) {
            best = {
              score,
              explanation: scenario.explanation,
              where: `${lesson.title} → Scenario Review`
            };
          }
        }
      }

      return best.score > 0.4 ? best : null;
    }

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

    function renderInstructor(html) {
      return `
        <div class="ai-row ai-row-ai">
          <div class="ai-bubble ai-bubble-ai">
            ${html}
          </div>
        </div>
      `;
    }

    function renderUser(text) {
      return `
        <div class="ai-row ai-row-user">
          <div class="ai-bubble ai-bubble-user">
            ${text}
          </div>
        </div>
      `;
    }

    function addUserMessage(text) {
      aiMessages.insertAdjacentHTML("beforeend", renderUser(escapeHtml(text)));
      scrollAIToBottom();
    }

    function addInstructorMessage(html) {
      aiMessages.insertAdjacentHTML("beforeend", renderInstructor(html));
      scrollAIToBottom();
    }

    function addThinking() {
      const id = `thinking-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const wrapper = document.createElement("div");
      wrapper.className = "ai-row ai-row-ai";
      wrapper.dataset.msgId = id;
      wrapper.innerHTML = `
        <div class="ai-bubble ai-bubble-ai ai-thinking">
          Thinking<span class="ai-thinking-dots"></span>
        </div>
      `;
      aiMessages.appendChild(wrapper);
      scrollAIToBottom();
      return id;
    }

    function replaceMessage(id, html) {
      const target = aiMessages.querySelector(`[data-msg-id="${id}"]`);
      if (target) {
        target.outerHTML = html;
      } else {
        addInstructorMessage(html);
      }
      scrollAIToBottom();
    }

    function scrollAIToBottom() {
      aiMessages.scrollTop = aiMessages.scrollHeight;
    }

    function clearChat() {
      aiMessages.innerHTML = "";
      conversationMemory = [];
      addInstructorMessage(getWelcomeMessage());
    }

    function ensureClearButton() {
      if (aiClear) return;

      const header =
        aiPanel.querySelector(".ai-header") ||
        aiPanel.querySelector(".ai-panel-header") ||
        aiPanel.firstElementChild;

      aiClear = document.createElement("button");
      aiClear.id = "aiClear";
      aiClear.type = "button";
      aiClear.textContent = "Clear";
      aiClear.className = "ai-clear-btn";
      aiClear.title = "Clear chat";

      if (header) {
        header.appendChild(aiClear);
      } else {
        aiPanel.prepend(aiClear);
      }
    }

    function escapeHtml(value) {
      return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    function getWelcomeMessage() {
      const lessonText = currentLesson
        ? `You are in ${escapeHtml(currentLesson.title)}.`
        : "You are in the course review area.";

      return `
        Ask me about a concept, why it matters, where to review it, or a simple example if it helps.<br><br>
        ${lessonText}<br><br>
        <strong>Important:</strong> I teach, explain, and review — not give quiz answers.
      `;
    }

    (function injectStyles() {
      if (document.getElementById("aiChatBubbleStyles")) return;

      const s = document.createElement("style");
      s.id = "aiChatBubbleStyles";
      s.textContent = `
        .ai-panel{
          position:fixed;
          right:24px;
          bottom:90px;
          width:360px;
          height:520px;
          background:#ffffff;
          border-radius:18px;
          display:flex;
          flex-direction:column;
          overflow:hidden;
          box-shadow:0 25px 60px rgba(0,0,0,0.18),0 6px 16px rgba(0,0,0,0.08);
          border:1px solid rgba(15,23,42,0.08);
          z-index:9999;
        }

        .ai-panel.hidden{
          display:none !important;
        }

        .ai-header{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:10px;
          padding:14px 16px;
          background:#ffffff;
          border-bottom:1px solid #e5e7eb;
        }

        .ai-title{
          font-size:14px;
          font-weight:700;
          color:#111827;
        }

        .ai-sub{
          font-size:11px;
          color:#6b7280;
          margin-top:2px;
        }

        .ai-close{
          border:none;
          background:#f3f4f6;
          color:#374151;
          width:30px;
          height:30px;
          border-radius:999px;
          cursor:pointer;
          font-size:14px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          flex-shrink:0;
        }

        .ai-close:hover{
          background:#e5e7eb;
        }

        .ai-messages{
          flex:1;
          overflow-y:auto;
          background:#f9fafb;
          padding:18px 14px;
        }

        .ai-row{
          display:flex;
          width:100%;
          margin-bottom:12px;
        }

        .ai-row-ai{
          justify-content:flex-start;
        }

        .ai-row-user{
          justify-content:flex-end;
        }

        .ai-bubble{
          max-width:82%;
          padding:12px 14px;
          border-radius:18px;
          font-size:14px;
          line-height:1.5;
          box-shadow:0 1px 2px rgba(0,0,0,0.04);
          word-break:break-word;
          white-space:normal;
        }

        .ai-bubble-ai{
          background:#ffffff;
          color:#111827;
          border:1px solid #e5e7eb;
          border-bottom-left-radius:6px;
        }

        .ai-bubble-user{
          background:#1d3557;
          color:#ffffff;
          border-bottom-right-radius:6px;
        }

        .ai-thinking{
          color:#4b5563;
        }

        .ai-thinking-dots::after{
          content:"";
          display:inline-block;
          width:1.2em;
          text-align:left;
          animation:aiDots 1.2s infinite steps(4,end);
        }

        @keyframes aiDots{
          0%{content:"";}
          25%{content:".";}
          50%{content:"..";}
          75%{content:"...";}
          100%{content:"";}
        }

        .ai-input{
          display:flex;
          align-items:center;
          gap:10px;
          padding:12px;
          background:#ffffff;
          border-top:1px solid #e5e7eb;
        }

        .ai-input input{
          flex:1;
          min-width:0;
          border:1px solid #d1d5db;
          outline:none;
          background:#ffffff;
          border-radius:999px;
          padding:10px 14px;
          font-size:14px;
          color:#111827;
        }

        .ai-input input:focus{
          border-color:#93c5fd;
          box-shadow:0 0 0 3px rgba(59,130,246,0.12);
        }

        .ai-input button{
          border:none;
          background:#1d3557;
          color:#ffffff;
          padding:10px 16px;
          border-radius:999px;
          font-weight:600;
          cursor:pointer;
          flex-shrink:0;
        }

        .ai-input button:hover{
          background:#17304d;
        }

        .ai-clear-btn{
          margin-left:auto;
          border:none;
          background:#f3f4f6;
          color:#374151;
          padding:8px 12px;
          border-radius:999px;
          font-size:12px;
          font-weight:600;
          cursor:pointer;
        }

        .ai-clear-btn:hover{
          background:#e5e7eb;
        }

        #aiToggleBtn{
          position:fixed;
          right:24px;
          bottom:24px;
          border:none;
          border-radius:999px;
          background:#1d3557;
          color:#ffffff;
          padding:12px 18px;
          font-weight:600;
          cursor:pointer;
          box-shadow:0 6px 18px rgba(0,0,0,0.16);
          z-index:9998;
        }

        #aiToggleBtn:hover{
          background:#17304d;
        }

        @media (max-width: 640px){
          .ai-panel{
            width:calc(100vw - 24px);
            right:12px;
            bottom:76px;
            height:60vh;
            min-height:420px;
          }

          #aiToggleBtn{
            right:12px;
            bottom:12px;
          }
        }
      `;
      document.head.appendChild(s);
    })();
  })();
}
