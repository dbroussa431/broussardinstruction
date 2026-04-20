```javascript
// =====================================================================
// BSA DAVID TEACHER - COMPLETE SMART AI.JS (ver. 5.0 CLEAN BUILD)
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
    // PAGE CONTEXT
    // -----------------------------------------------------------------
    const pagePath = window.location.pathname.toLowerCase();
    const isQuizPage = pagePath.includes("quiz.html");
    const currentLessonId = Number(new URLSearchParams(window.location.search).get("lesson") || 0);
    const currentLesson = getLessonById(currentLessonId);

    // -----------------------------------------------------------------
    // SIMPLE MEMORY
    // -----------------------------------------------------------------
    let conversationMemory = [];

    // -----------------------------------------------------------------
    // DISABLE ON QUIZ PAGES
    // -----------------------------------------------------------------
    if (isQuizPage) {
      aiBtn?.remove();
      aiPanel?.remove();
      return;
    }

    // -----------------------------------------------------------------
    // BSA PHILOSOPHY
    // -----------------------------------------------------------------
    function applyPhilosophy(answer) {
      const inserts = [
        "Remember — the goal is to avoid needing the firearm.",
        "The firearm is not the plan — it is the last option.",
        "This ties back to not being there in the first place.",
        "Responsibility means knowing when not to act."
      ];

      if (Math.random() < 0.4) {
        const line = inserts[Math.floor(Math.random() * inserts.length)];
        return `${answer}<br><br><i>${line}</i>`;
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
        result = `<b>${openers[Math.floor(Math.random() * openers.length)]}</b><br><br>${result}`;
      }

      if (Math.random() < 0.3) {
        result += `<br><br><i>${closers[Math.floor(Math.random() * closers.length)]}</i>`;
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
        return `${answer}<br><br><b>${prompts[Math.floor(Math.random() * prompts.length)]}</b>`;
      }

      return answer;
    }

    function finalizeAnswer(answer) {
      answer = applyPhilosophy(answer);
      answer = applyInstructorTone(answer);
      answer = addCoachingQuestion(answer);
      return answer;
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

      aiClose.addEventListener("click", () => {
        aiPanel.classList.add(CSS.hidden);
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

    // -----------------------------------------------------------------
    // MESSAGE FLOW
    // -----------------------------------------------------------------
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
      }, 500);
    }

    // -----------------------------------------------------------------
    // AI CORE
    // -----------------------------------------------------------------
    function instructorAI(rawQuestion) {
      const question = normalize(rawQuestion);

      // Social / light conversation
      if (isGreeting(question)) {
        return finalizeAnswer("I’m here. Ask me about the lesson and I’ll help you work through it.");
      }

      if (isHelpRequest(question)) {
        return finalizeAnswer("I explain concepts, break things down, and help you think through situations from the course.");
      }

      if (isThanks(question)) {
        return finalizeAnswer("Good. Keep going. Understanding matters more than memorizing.");
      }

      // Hard block on quiz answer requests
      if (looksLikeQuizAnswerRequest(question)) {
        return `
          I’m not going to give you a direct quiz or test answer.<br><br>
          <b>Why it matters:</b> Understanding the concept matters more than memorizing a choice.<br><br>
          <b>Go back to:</b> Review the lesson tied to that question, or ask me to explain the concept behind it.<br><br>
          <b>Think about this:</b> What principle is that question actually testing?
        `;
      }

      // Soft redirect if way off track
      if (isOffTrack(question)) {
        return finalizeAnswer("I’ll keep you focused on the training. Ask me about awareness, safety, judgment, responsibility, or a lesson concept and I’ll help.");
      }

      // Confusion / struggle handling
      if (detectStruggle(question)) {
        return finalizeAnswer(
          `Alright — slow it down.<br><br>
          Lock onto one idea first. Define it clearly, then connect it to the situation.<br><br>
          <b>Start here:</b> ${currentLesson ? currentLesson.title : "current lesson"}`
        );
      }

      // Simple direct philosophy-aware answers
      const direct = findDirectResponse(question);
      if (direct) {
        return finalizeAnswer(direct);
      }

      // Lesson-aware concept search
      const sectionMatch = findBestSectionMatch(question);
      if (sectionMatch) {
        const answerLine = pickBestLine(sectionMatch.section.body || [], question)
          || sectionMatch.section.body?.[0]
          || currentLesson?.summary
          || "That concept is covered in your lesson.";

        return finalizeAnswer(
          `${answerLine}<br><br>
          <b>Why it matters:</b> ${buildWhy(sectionMatch.section, sectionMatch.lesson)}<br><br>
          <b>Go back to:</b> ${sectionMatch.lesson.title} → ${sectionMatch.section.heading}`
        );
      }

      // Scenario-aware response
      const scenarioMatch = findScenarioResponse(question);
      if (scenarioMatch) {
        return finalizeAnswer(
          `Training points you toward the safer and more responsible response.<br><br>
          <b>Why it matters:</b> ${scenarioMatch.explanation}<br><br>
          <b>Go back to:</b> ${scenarioMatch.where}`
        );
      }

      // Final fallback
      return finalizeAnswer(
        `Ask using a concept from the lesson and I’ll break it down clearly.<br><br>
        <b>Current focus:</b> ${currentLesson ? currentLesson.title : "Course review"}`
      );
    }

    // -----------------------------------------------------------------
    // AI HELPERS
    // -----------------------------------------------------------------
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

    // -----------------------------------------------------------------
    // MEMORY
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

    // -----------------------------------------------------------------
    // UI HELPERS
    // -----------------------------------------------------------------
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
      const div = document.createElement("div");
      div.className = "ai-msg-row ai-msg-row-user";
      div.innerHTML = renderUser(escapeHtml(text));
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

    function addThinking() {
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
      if (target) {
        target.innerHTML = html;
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
        Ask me about:
        <ul style="margin:8px 0 0 18px;padding:0;">
          <li>what a concept means</li>
          <li>why it matters</li>
          <li>where to review it</li>
          <li>a simple example if it helps</li>
        </ul>
        <br>
        ${lessonText}<br><br>
        <b>Important:</b> I teach, explain, and review — not give quiz answers.
      `;
    }

    // -----------------------------------------------------------------
    // STYLE INJECTION
    // -----------------------------------------------------------------
    (function injectStyles() {
      if (document.getElementById("aiChatBubbleStyles")) return;

      const s = document.createElement("style");
      s.id = "aiChatBubbleStyles";
      s.textContent = `
        .ai-msg-row{display:flex;margin:10px 0;width:100%;}
        .ai-msg-row-user{justify-content:flex-end;}
        .ai-msg-row-instructor{justify-content:flex-start;}
        .ai-msg{
          max-width:88%;
          border-radius:14px;
          padding:10px 12px;
          line-height:1.45;
          box-shadow:0 2px 8px rgba(0,0,0,.06);
          font-size:14px;
        }
        .ai-msg-user{
          background:#1e3a8a;
          color:#fff;
          border-bottom-right-radius:4px;
        }
        .ai-msg-instructor{
          background:#f8fbff;
          color:#142033;
          border:1px solid #d9e0ec;
          border-bottom-left-radius:4px;
        }
        .ai-msg-label{
          font-size:11px;
          font-weight:700;
          text-transform:uppercase;
          letter-spacing:.04em;
          margin-bottom:6px;
          opacity:.82;
        }
        .ai-msg-user .ai-msg-label{color:rgba(255,255,255,.88);}
        .ai-msg-instructor .ai-msg-label{color:#1f468c;}
        .ai-msg-body{white-space:normal;word-break:break-word;}
        .thinking::after{
          content:'';
          display:inline-block;
          width:1ch;
          animation:dots 1.2s steps(4,end) infinite;
        }
        @keyframes dots{
          0%,20%{content:'';}
          40%{content:'.';}
          60%{content:'..';}
          80%,100%{content:'...';}
        }
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
