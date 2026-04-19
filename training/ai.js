// =====================================
// BSA DAVID TEACHER - FULL AI.JS
// =====================================

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

// ------------------------------
// QUIZ BLOCK
// ------------------------------
if (isQuizPage) {
  if (aiBtn) aiBtn.remove();
  if (aiPanel) aiPanel.remove();
} else {
  initAI();
}

// ------------------------------
// INIT
// ------------------------------
function initAI() {
  if (!aiBtn || !aiPanel || !aiClose || !aiSend || !aiInput || !aiMessages) return;

  aiBtn.onclick = () => {
    aiPanel.classList.toggle("hidden");
    if (!aiPanel.classList.contains("hidden") && aiMessages.children.length === 0) {
      addInstructorMessage(getWelcomeMessage());
    }
  };

  aiClose.onclick = () => {
    aiPanel.classList.add("hidden");
  };

  aiSend.onclick = async () => {
    const question = aiInput.value.trim();
    if (!question) return;

    addUserMessage(question);
    aiInput.value = "";

    const thinkingId = addInstructorThinking();

    try {
      const response = await instructorAI(question);
      replaceThinkingMessage(thinkingId, response);
    } catch (error) {
      console.error("AI response error:", error);
      replaceThinkingMessage(
        thinkingId,
        formatResponse({
          answer: "I hit a problem while building the response.",
          why: "The assistant logic ran into an unexpected error.",
          where: currentLessonId
            ? `Current lesson context: Lesson ${currentLessonId}`
            : "General course review",
          example: "Try asking the question again in a shorter form."
        })
      );
    }
  };

  aiInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") aiSend.click();
  });
}

// ------------------------------
// WELCOME MESSAGE
// ------------------------------
function getWelcomeMessage() {
  const lessonLabel = currentLessonId
    ? `You are currently in Lesson ${currentLessonId}.`
    : "You are currently on the dashboard.";

  return `
    <b>BSA David Teacher</b><br><br>
    Ask me training questions and I will explain:
    <ul style="margin:8px 0 0 18px;padding:0;">
      <li>what the concept means</li>
      <li>why it matters</li>
      <li>where to review it</li>
      <li>a simple example when helpful</li>
    </ul>
    <br>
    ${lessonLabel}<br><br>
    <b>Important:</b> I help with learning and review. I do not help during quizzes or give direct quiz answers.
  `;
}

// ------------------------------
// MESSAGE RENDERING
// ------------------------------
function addUserMessage(text) {
  const wrap = document.createElement("div");
  wrap.className = "ai-msg-row ai-msg-row-user";
  wrap.innerHTML = `
    <div class="ai-msg ai-msg-user">
      <div class="ai-msg-label">You</div>
      <div class="ai-msg-body">${escapeHtml(text)}</div>
    </div>
  `;
  aiMessages.appendChild(wrap);
  scrollAIToBottom();
}

function addInstructorMessage(html) {
  const wrap = document.createElement("div");
  wrap.className = "ai-msg-row ai-msg-row-instructor";
  wrap.innerHTML = `
    <div class="ai-msg ai-msg-instructor">
      <div class="ai-msg-label">BSA David Teacher</div>
      <div class="ai-msg-body">${html}</div>
    </div>
  `;
  aiMessages.appendChild(wrap);
  scrollAIToBottom();
}

function addInstructorThinking() {
  const id = `thinking-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const wrap = document.createElement("div");
  wrap.className = "ai-msg-row ai-msg-row-instructor";
  wrap.dataset.msgId = id;
  wrap.innerHTML = `
    <div class="ai-msg ai-msg-instructor">
      <div class="ai-msg-label">BSA David Teacher</div>
      <div class="ai-msg-body"><i>Thinking…</i></div>
    </div>
  `;
  aiMessages.appendChild(wrap);
  scrollAIToBottom();
  return id;
}

function replaceThinkingMessage(id, html) {
  const target = aiMessages.querySelector(`[data-msg-id="${id}"]`);
  if (!target) {
    addInstructorMessage(html);
    return;
  }

  target.innerHTML = `
    <div class="ai-msg ai-msg-instructor">
      <div class="ai-msg-label">BSA David Teacher</div>
      <div class="ai-msg-body">${html}</div>
    </div>
  `;
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
// CORE INSTRUCTOR BRAIN
// ------------------------------
async function instructorAI(rawQuestion) {
  const question = normalize(rawQuestion);

  // Rule 1: No quiz-answer help
  if (looksLikeQuizAnswerRequest(question)) {
    return formatBlockedResponse();
  }

  // Rule 2: Scenario mode
  if (looksLikeScenarioQuestion(question)) {
    const scenarioResponse = findScenarioResponse(question);
    if (scenarioResponse) return scenarioResponse;

    return formatResponse({
      answer: "I can help think through the situation, but I will keep it at the concept level.",
      why: "The goal is to teach judgment, avoidance, awareness, and lawful decision-making, not give shortcut answers.",
      where: pickContextWhere(),
      example: "Focus on awareness, distance, safer positioning, legal justification, and responsible action."
    });
  }

  // Rule 3: Direct lesson/topic matching
  const sectionMatch = findBestSectionMatch(question);
  if (sectionMatch) {
    return formatSectionResponse(sectionMatch);
  }

  // Rule 4: Quiz bank concept matching without giving direct answers
  const quizConceptMatch = findQuizConceptMatch(question);
  if (quizConceptMatch) {
    return formatResponse({
      answer: quizConceptMatch.answer,
      why: quizConceptMatch.why,
      where: quizConceptMatch.where,
      example: quizConceptMatch.example
    });
  }

  // Rule 5: Current lesson fallback
  if (currentLessonId) {
    const lesson = getLessonById(currentLessonId);
    if (lesson) {
      return formatResponse({
        answer: `I do not see that exact question directly in Lesson ${lesson.id}, but I can still guide you within the lesson topic.`,
        why: `This lesson focuses on ${lesson.summary}`,
        where: `${lesson.title}`,
        example: `Try asking about one of the main sections from this lesson.`
      });
    }
  }

  // General fallback
  return formatResponse({
    answer: "That is a fair question, but I cannot tie it directly to a specific lesson concept from your current training material.",
    why: "I am designed to stay within the BSA training framework and explain course-related concepts clearly and responsibly.",
    where: "Review Lessons 1–7 for textbook-based fundamentals and Lessons 8–10 for law, mental readiness, and final judgment.",
    example: "You can ask about awareness levels, firearm basics, use of force, aftermath, gear, Louisiana law, or crisis responsibility."
  });
}

// ------------------------------
// RULE HELPERS
// ------------------------------
function normalize(text) {
  return String(text || "").trim().toLowerCase();
}

function looksLikeQuizAnswerRequest(question) {
  const patterns = [
    "what is the answer",
    "give me the answer",
    "which answer is right",
    "which option is right",
    "what do i pick",
    "what should i click",
    "tell me the correct answer",
    "answer to question",
    "quiz answer",
    "test answer"
  ];
  return patterns.some((p) => question.includes(p));
}

function looksLikeScenarioQuestion(question) {
  const patterns = [
    "what if",
    "scenario",
    "if someone",
    "if a person",
    "if i am",
    "if you are",
    "what would i do",
    "what should i do"
  ];
  return patterns.some((p) => question.includes(p));
}

function formatBlockedResponse() {
  return `
    <b>Answer:</b> I cannot give direct quiz or test answers.<br><br>
    <b>Why:</b> This assistant is for learning and review, not for bypassing the training process.<br><br>
    <b>Where to find it:</b> Go back to the lesson material and review the related concept.<br><br>
    <b>Example:</b> Ask me to explain the idea behind the question, why one approach is safer, or where the topic is taught.
  `;
}

// ------------------------------
// LESSON + SECTION SEARCH
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

function tokenize(question) {
  return normalize(question)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function scoreTextAgainstQuestion(questionTokens, text) {
  const hay = normalize(text);
  let score = 0;

  for (const token of questionTokens) {
    if (hay.includes(token)) score += 1;
  }

  return score;
}

function findBestSectionMatch(question) {
  const tokens = tokenize(question);
  let best = null;

  for (const lesson of getSearchableLessons()) {
    for (const section of lesson.sections || []) {
      const headingScore = scoreTextAgainstQuestion(tokens, section.heading) * 3;
      const bodyScore = (section.body || []).reduce((sum, line) => sum + scoreTextAgainstQuestion(tokens, line), 0);
      const summaryScore = scoreTextAgainstQuestion(tokens, lesson.summary);

      const totalScore = headingScore + bodyScore + summaryScore;

      if (!best || totalScore > best.score) {
        best = {
          lesson,
          section,
          score: totalScore
        };
      }
    }
  }

  if (!best || best.score <= 0) return null;
  return best;
}

function formatSectionResponse(match) {
  const { lesson, section } = match;
  const lessonMode = lesson.id >= 1 && lesson.id <= 7 ? "textbook" : "guided";

  let answer = "";
  let why = "";
  let example = null;

  if (section.body && section.body.length) {
    answer = section.body[0];
    why = buildWhyFromSection(section.body);
    example = buildExampleFromLesson(lesson, section);
  } else {
    answer = lesson.summary;
    why = "This lesson section supports safer, more responsible decision-making.";
  }

  const where =
    lessonMode === "textbook"
      ? `${lesson.title} → ${section.heading} (Textbook-based lesson)`
      : `${lesson.title} → ${section.heading} (Instructor-guided / gist-supported lesson)`;

  return formatResponse({ answer, why, where, example });
}

function buildWhyFromSection(bodyLines) {
  const joined = bodyLines.join(" ").toLowerCase();

  if (joined.includes("aware") || joined.includes("awareness")) {
    return "Awareness helps you see problems earlier, which gives you more choices before force becomes necessary.";
  }
  if (joined.includes("avoid")) {
    return "Avoidance matters because the safest fight is often the one you prevent from happening at all.";
  }
  if (joined.includes("law") || joined.includes("legal") || joined.includes("justified")) {
    return "Legal decisions are judged after the fact, so understanding the standard before an incident matters.";
  }
  if (joined.includes("stress") || joined.includes("trauma") || joined.includes("adrenaline")) {
    return "Stress changes perception, memory, and judgment, so students need to understand both the event and the aftermath.";
  }
  if (joined.includes("mental") || joined.includes("suicide") || joined.includes("crisis")) {
    return "Responsible ownership includes protecting life during emotional crisis, not just responding to outside threats.";
  }
  if (joined.includes("gear") || joined.includes("laser") || joined.includes("holster")) {
    return "Equipment should support judgment and skill, not replace them.";
  }
  if (joined.includes("fundamental") || joined.includes("grip") || joined.includes("trigger")) {
    return "The basics matter because consistent mechanics hold up better under stress than rushed technique.";
  }

  return "This section matters because it supports safer judgment, better awareness, and more responsible decisions.";
}

function buildExampleFromLesson(lesson, section) {
  const t = `${lesson.title} ${section.heading}`.toLowerCase();

  if (t.includes("awareness")) return "Example: noticing exits, people, and unusual movement before a problem gets close.";
  if (t.includes("route")) return "Example: choosing a better-lit path instead of an isolated shortcut.";
  if (t.includes("environment")) return "Example: identifying barriers, cover, and escape routes as soon as you arrive.";
  if (t.includes("firearm basics")) return "Example: personally verifying the chamber and magazine well instead of trusting someone else’s word.";
  if (t.includes("shooting fundamentals")) return "Example: using a stable stance and clean trigger press instead of rushing shots.";
  if (t.includes("legal")) return "Example: asking whether there is an immediate deadly threat instead of reacting to anger or property loss.";
  if (t.includes("aftermath")) return "Example: calling 911 first and preserving the scene after a defensive event.";
  if (t.includes("gear")) return "Example: choosing a practical holster and light that you actually train with.";
  if (t.includes("mental readiness")) return "Example: taking warning signs seriously and reducing access to firearms during crisis.";
  if (t.includes("final evaluation")) return "Example: applying legal judgment and responsibility, not just memorizing phrases.";

  return null;
}

// ------------------------------
// QUIZ CONCEPT SEARCH
// ------------------------------
function findQuizConceptMatch(question) {
  const tokens = tokenize(question);
  const quizBank = window.QUIZ_BANK || {};
  let best = null;

  for (const [lessonId, questions] of Object.entries(quizBank)) {
    for (const item of questions) {
      const baseText = [
        item.q,
        item.explanation,
        ...(item.choices || [])
      ].join(" ");

      const score = scoreTextAgainstQuestion(tokens, baseText);

      if (!best || score > best.score) {
        best = {
          lessonId: Number(lessonId),
          item,
          score
        };
      }
    }
  }

  if (!best || best.score <= 0) return null;

  const lesson = getLessonById(best.lessonId);
  const explanation = best.item.explanation || "This concept is covered in the related lesson material.";

  return {
    answer: stripQuizTone(best.item.q),
    why: explanation,
    where: lesson ? `${lesson.title}` : `Lesson ${best.lessonId}`,
    example: null
  };
}

function stripQuizTone(questionText) {
  const q = String(questionText || "").trim();
  if (q.toLowerCase().startsWith("true or false:")) {
    return q.replace(/^true or false:\s*/i, "");
  }
  return q;
}

// ------------------------------
// SCENARIO SEARCH
// ------------------------------
function findScenarioResponse(question) {
  const tokens = tokenize(question);
  let best = null;

  for (const lesson of getSearchableLessons()) {
    for (const scenario of lesson.scenarios || []) {
      const scenarioText = `${scenario.prompt} ${(scenario.choices || []).join(" ")} ${scenario.explanation || ""}`;
      const score = scoreTextAgainstQuestion(tokens, scenarioText);

      if (!best || score > best.score) {
        best = { lesson, scenario, score };
      }
    }
  }

  if (!best || best.score <= 0) return null;

  return `
    <b>Answer:</b> In a situation like this, the training points you toward the safer and more responsible response.<br><br>
    <b>Why:</b> ${best.scenario.explanation}<br><br>
    <b>Where to find it:</b> ${best.lesson.title} → Scenario Review<br><br>
    <b>Example:</b> ${best.scenario.prompt}
  `;
}

// ------------------------------
// WHERE PICKER
// ------------------------------
function pickContextWhere() {
  if (currentLessonId) {
    const lesson = getLessonById(currentLessonId);
    if (lesson) return `${lesson.title}`;
  }
  return "General course review";
}

// ------------------------------
// RESPONSE FORMAT
// ------------------------------
function formatResponse({ answer, why, where, example }) {
  return `
    <b>Answer:</b> ${answer}<br><br>
    <b>Why:</b> ${why}<br><br>
    <b>Where to find it:</b> ${where}
    ${example ? `<br><br><b>Example:</b> ${example}` : ""}
  `;
}

// ------------------------------
// OPTIONAL BUBBLE STYLES
// ------------------------------
injectAIChatStyles();

function injectAIChatStyles() {
  if (document.getElementById("aiChatBubbleStyles")) return;

  const style = document.createElement("style");
  style.id = "aiChatBubbleStyles";
  style.textContent = `
    .ai-msg-row {
      display: flex;
      margin: 10px 0;
      width: 100%;
    }

    .ai-msg-row-user {
      justify-content: flex-end;
    }

    .ai-msg-row-instructor {
      justify-content: flex-start;
    }

    .ai-msg {
      max-width: 88%;
      border-radius: 14px;
      padding: 10px 12px;
      line-height: 1.45;
      box-shadow: 0 2px 8px rgba(0,0,0,.06);
      font-size: 14px;
    }

    .ai-msg-user {
      background: #1e3a8a;
      color: #fff;
      border-bottom-right-radius: 4px;
    }

    .ai-msg-instructor {
      background: #f8fbff;
      color: #142033;
      border: 1px solid #d9e0ec;
      border-bottom-left-radius: 4px;
    }

    .ai-msg-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .04em;
      margin-bottom: 6px;
      opacity: .82;
    }

    .ai-msg-user .ai-msg-label {
      color: rgba(255,255,255,.82);
    }

    .ai-msg-instructor .ai-msg-label {
      color: #1f468c;
    }

    .ai-msg-body {
      white-space: normal;
      word-break: break-word;
    }
  `;
  document.head.appendChild(style);
}
