// =====================================================================
// BSA DAVID TEACHER - COMPLETE SMART AI.JS (single file, no gaps)
// =====================================================================

// ---------------------------------------------------------------------
// SINGLE-LOAD GUARD
// ---------------------------------------------------------------------
if (!window.BSA_AI_LOADED) {
  window.BSA_AI_LOADED = true;

  (function () {
    // -----------------------------------------------------------------
    // CONSTANTS + DOM
    // -----------------------------------------------------------------
    const LABELS = { instructor: "BSA David Teacher", user: "You" };
    const CSS = { hidden: "hidden" };

    const aiBtn = document.getElementById("aiToggleBtn");
    const aiPanel = document.getElementById("aiPanel");
    const aiClose = document.getElementById("aiClose");
    const aiSend = document.getElementById("aiSend");
    const aiInput = document.getElementById("aiInput");
    const aiMessages = document.getElementById("aiMessages");

    // -----------------------------------------------------------------
    // PAGE + CONTEXT
    // -----------------------------------------------------------------
    const pagePath = window.location.pathname.toLowerCase();
    const isQuizPage = pagePath.includes("quiz.html");
    const currentLessonId = Number(new URLSearchParams(window.location.search).get("lesson") || 0);
    const currentLesson = getLessonById(currentLessonId);

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

      aiBtn.addEventListener("click", () => {
        aiPanel.classList.toggle(CSS.hidden);
        if (!aiPanel.classList.contains(CSS.hidden) && aiMessages.children.length === 0) {
          addInstructorMessage(getWelcomeMessage());
        }
      });

      aiClose.addEventListener("click", () => aiPanel.classList.add(CSS.hidden));

      aiSend.addEventListener("click", handleAISend);
      aiInput.addEventListener("keypress", (e) => e.key === "Enter" && handleAISend());
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
        replaceMessage(id, renderInstructor(response));
      } catch (err) {
        console.error("AI error:", err);
        replaceMessage(
          id,
          renderInstructor(
            formatResponse({
              answer: "I hit a problem while building that response.",
              why: "Unexpected processing error.",
              where: currentLesson ? currentLesson.title : "General course review",
              example: "Try a shorter question referencing lesson material.",
            })
          )
        );
      } finally {
        aiSend.disabled = false;
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

    function escapeHtml(v) {
      return String(v ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    // -----------------------------------------------------------------
    // WELCOME MESSAGE
    // -----------------------------------------------------------------
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
        <b>Important:</b> I teach, explain, and review — not give quiz answers.`;
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
      ];
      return patterns.some((p) => q.includes(p));
    }

    function looksLikeScenarioQuestion(q) {
      return ["scenario", "what if ", "if someone", "suppose"].some((p) => q.includes(p));
    }

    // -----------------------------------------------------------------
    // MAIN AI CORE
    // -----------------------------------------------------------------
    async function instructorAI(raw) {
      const question = normalize(raw);

      if (looksLikeQuizAnswerRequest(question)) return formatBlockedResponse();

      const direct = findDirectConceptResponse(question);
      if (direct) return formatResponse(direct);

      // Search by lesson content
      const sectionMatch = findBestSectionMatch(question);
      if (sectionMatch) return formatSectionResponse(sectionMatch, question);

      // Scenario logic
      if (looksLikeScenarioQuestion(question)) {
        const scenario = findScenarioResponse(question);
        if (scenario) return scenario;
      }

      // Quiz concept (teaching only)
      const quizConcept = findQuizConceptMatch(question);
      if (quizConcept) return formatResponse(quizConcept);

      // New semantic search layer
      const semantic = semanticSearch(question);
      if (semantic) {
        return formatResponse({
          answer: semantic.text,
          why: "This line most closely matches your phrasing in the training material.",
          where: semantic.where,
          example: "Review that section for context and related points.",
        });
      }

      // Final fallback
      return formatResponse({
        answer:
          "That question doesn’t exactly match a section heading or quiz concept yet.",
        why: "I stay within this certified course content to keep answers accurate.",
        where:
          "Review core lessons 1–10: awareness, law, aftermath, readiness, and responsibility.",
        example:
          "Try referencing a key term from your lesson or chapter summary for a deeper answer.",
      });
    }

    // -----------------------------------------------------------------
    // DIRECT MAP for FAST ANSWERS
    // -----------------------------------------------------------------
    function findDirectConceptResponse(q) {
      const map = [
        {
          test: ["condition yellow"],
          r: {
            answer: "Condition Yellow is calm, relaxed awareness in public.",
            why: "It keeps you observant without tension, giving time to avoid problems early.",
            where: "Lesson 1 → Awareness Levels",
            example: "Scanning exits and people calmly while shopping.",
          },
        },
        {
          test: ["condition white"],
          r: {
            answer: "Condition White means unaware and distracted.",
            why: "Unawareness removes early options for avoidance.",
            where: "Lesson 1 → Awareness Levels",
            example: "Walking while texting and not noticing surroundings.",
          },
        },
        {
          test: ["castle doctrine"],
          r: {
            answer:
              "Castle Doctrine covers laws reducing force thresholds inside one’s home.",
            why: "It applies to home defense but still demands lawful judgment.",
            where: "Lesson 4 → Home Versus Property",
            example:
              "Defense of life ≠ defense of property; law differentiates them.",
          },
        },
        {
          test: ["permitless carry"],
          r: {
            answer:
              "Louisiana allows permitless carry for eligible adults 18+ who are not prohibited.",
            why: "Permitless status changes paperwork, not your lawful responsibility.",
            where: "Lesson 8 → Permitless Carry in Louisiana",
            example:
              "Carrying legally still requires following location and impairment laws.",
          },
        },
        {
          test: ["most firearm deaths"],
          r: {
            answer:
              "Most firearm deaths in the U.S. are suicides, not homicides.",
            why: "Understanding that directs focus toward prevention and mental readiness.",
            where: "Lesson 9 → Suicide Prevention and Warning Signs",
            example:
              "Recognizing crisis language and securing access saves lives.",
          },
        },
      ];
      for (const m of map) if (m.test.some((p) => q.includes(p))) return m.r;
      return null;
    }

    // -----------------------------------------------------------------
    // CORE SEARCH HELPERS
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
          if (!best || score > best.score)
            best = { lesson, section: s, score };
        }
      }
      return best && best.score > 0.45 ? best : null;
    }

    function formatSectionResponse(match, question) {
      const { lesson, section } = match;
      const answer =
        pickBestLine(section.body, question) || section.body?.[0] || lesson.summary;
      return formatResponse({
        answer,
        why: buildWhy(section, lesson),
        where: `${lesson.title} → ${section.heading}`,
        example: buildExampleFromLesson(lesson, section),
      });
    }

    function pickBestLine(lines, q) {
      const t = tokenize(q);
      let top = { line: null, score: 0 };
      for (const line of lines) {
        const s = scoreTextAgainstQuestion(t, line);
        if (s > top.score) top = { line, score: s };
      }
      return top.line;
    }

    function buildWhy(section, lesson) {
      const all = section.body.join(" ").toLowerCase();
      if (all.includes("avoid")) return "Avoidance works because prevention beats reaction.";
      if (all.includes("aware")) return "Awareness expands choices and reaction time.";
      if (all.includes("verify")) return "Verification ensures personal safety responsibility.";
      if (all.includes("stress")) return "Understanding stress improves post‑event judgment.";
      if (lesson.title.toLowerCase().includes("law"))
        return "Legal standards center on reasonableness and necessity.";
      return "Concept clarity improves safer, lawful decision‑making.";
    }

    function buildExampleFromLesson(lesson, section) {
      const t = (lesson.title + section.heading).toLowerCase();
      if (t.includes("law")) return "Example: deciding only when force is truly justified.";
      if (t.includes("firearm")) return "Example: personal chamber check before handling.";
      if (t.includes("awareness")) return "Example: noticing early and changing direction.";
      if (t.includes("suicide") || t.includes("mental"))
        return "Example: separating firearms during emotional crisis.";
      return "Example: apply the same reasoning from training in real‑world context.";
    }

    // -----------------------------------------------------------------
    // QUIZ + SCENARIO SEARCH
    // -----------------------------------------------------------------
    function findQuizConceptMatch(q) {
      const tokens = tokenize(q);
      const bank = window.QUIZ_BANK || {};
      let best = { score: 0 };
      for (const [lid, set] of Object.entries(bank)) {
        for (const it of set) {
          const base = [it.q, it.explanation].join(" ");
          const s = scoreTextAgainstQuestion(tokens, base);
          if (s > best.score) best = { score: s, item: it, lessonId: lid };
        }
      }
      if (best.score < 0.4) return null;
      const lesson = getLessonById(best.lessonId);
      return {
        answer: stripQuizTone(best.item.q),
        why: best.item.explanation || "Covered in quiz explanation.",
        where: lesson ? lesson.title : `Lesson ${best.lessonId}`,
        example: best.item.critical ? "Critical concept—appears in final evaluation." : "",
      };
    }

    function stripQuizTone(q) {
      return String(q || "").replace(/^true or false:\s*/i, "");
    }

    function findScenarioResponse(q) {
      const t = tokenize(q);
      let best = { score: 0 };
      for (const lesson of getSearchableLessons()) {
        for (const sc of lesson.scenarios || []) {
          const text = `${sc.prompt} ${sc.explanation}`;
          const score = scoreTextAgainstQuestion(t, text);
          if (score > best.score) best = { score, lesson, sc };
        }
      }
      if (best.score < 0.4) return null;
      return formatResponse({
        answer: "Training points toward the safer, responsible response.",
        why: best.sc.explanation,
        where: `${best.lesson.title} → Scenario Review`,
        example: best.sc.prompt,
      });
    }

    // -----------------------------------------------------------------
    // SEMANTIC SMART SEARCH
    // -----------------------------------------------------------------
    function semanticSearch(q) {
      const tokens = tokenize(q);
      let best = { score: 0 };
      for (const lesson of window.LESSONS || []) {
        for (const sec of lesson.sections || []) {
          for (const line of sec.body || []) {
            const s = scoreTextAgainstQuestion(tokens, line);
            if (s > best.score)
              best = { score: s, text: line, where: `${lesson.title} → ${sec.heading}` };
          }
        }
      }
      for (const [lid, qs] of Object.entries(window.QUIZ_BANK || {})) {
        for (const item of qs) {
          const s = scoreTextAgainstQuestion(tokens, [item.q, item.explanation].join(" "));
          if (s > best.score) {
            const lesson = getLessonById(lid);
            best = {
              score: s,
              text: item.explanation || item.q,
              where: lesson ? `${lesson.title} (quiz concept)` : `Lesson ${lid}`,
            };
          }
        }
      }
      return best.score > 0.35 ? best : null;
    }

    // -----------------------------------------------------------------
    // FORMAT HELPERS
    // -----------------------------------------------------------------
    function formatResponse({ answer, why, where, example }) {
      return `<b>Answer:</b> ${answer}<br><br><b>Why:</b> ${why}<br><br><b>Where to find it:</b> ${where}${
        example ? `<br><br><b>Example:</b> ${example}` : ""
      }`;
    }

    function formatBlockedResponse() {
      return `<b>Answer:</b> I can’t provide direct quiz or test answers.<br><br><b>Why:</b> Understanding beats memorization.<br><br><b>Where:</b> Check the relevant lesson or ask for the concept behind it.`;
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
      `;
      document.head.appendChild(s);
    })();
  })();
}
