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
const currentLesson = getLessonById(currentLessonId);

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
          answer: "I hit a problem while building that response.",
          why: "The assistant logic ran into an unexpected error.",
          where: currentLesson ? `${currentLesson.title}` : "General course review",
          example: "Ask again in a shorter form or use a concept from the lesson heading."
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
  const lessonLabel = currentLesson
    ? `You are in ${escapeHtml(currentLesson.title)}.`
    : "You are on the student dashboard.";

  return `
    <b>BSA David Teacher</b><br><br>
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

  // 1) block direct answer requests
  if (looksLikeQuizAnswerRequest(question)) {
    return formatBlockedResponse();
  }

  // 2) strong direct concept matches first
  const direct = findDirectConceptResponse(question);
  if (direct) {
    return formatResponse(direct);
  }

  // 3) scenario mode
  if (looksLikeScenarioQuestion(question)) {
    const scenarioResponse = findScenarioResponse(question);
    if (scenarioResponse) return scenarioResponse;

    return formatResponse({
      answer: "Slow it down and work the problem in order.",
      why: "The goal is not to jump to force. The goal is awareness, movement, safer positioning, lawful judgment, and only then action if truly necessary.",
      where: pickContextWhere(),
      example: "Think: What do I know, what can I avoid, where can I move, and is there an immediate deadly threat?"
    });
  }

  // 4) lesson/section match
  const sectionMatch = findBestSectionMatch(question);
  if (sectionMatch) {
    return formatSectionResponse(sectionMatch, question);
  }

  // 5) quiz-bank concept match without giving quiz answers
  const quizConceptMatch = findQuizConceptMatch(question);
  if (quizConceptMatch) {
    return formatResponse(quizConceptMatch);
  }

  // 6) current lesson fallback
  if (currentLesson) {
    return formatResponse({
      answer: `I do not see that exact phrase directly in ${currentLesson.title}.`,
      why: `This lesson is centered on ${currentLesson.summary}`,
      where: `${currentLesson.title}`,
      example: "Ask about a section heading, a scenario, or one of the main terms from the lesson."
    });
  }

  // 7) general fallback
  return formatResponse({
    answer: "That is a fair question, but I cannot tie it directly to a specific BSA lesson concept yet.",
    why: "I am designed to stay inside your course and teach the material clearly instead of drifting into generic advice.",
    where: "Review Lessons 1–7 for textbook-backed fundamentals and Lessons 8–10 for law, mental readiness, and final judgment.",
    example: "Try asking about awareness levels, firearm basics, legal force, aftermath, gear, Louisiana law, or crisis responsibility."
  });
}

// ------------------------------
// DIRECT TEACHING RESPONSES
// ------------------------------
function findDirectConceptResponse(question) {
  const directMap = [
    {
      test: ["4 basic gun rules", "four basic gun rules", "basic gun rules", "4 firearm rules", "four firearm rules"],
      response: {
        answer: "The four basic gun safety rules are: treat every firearm as if it is loaded, never point it at anything you are not willing to destroy, keep your finger off the trigger until you are ready to fire, and be sure of your target and what is beyond it.",
        why: "Those four rules work together. If one layer fails, another layer is still there to prevent injury or death.",
        where: "This supports Lesson 2 – Self-Defense Firearm Basics, especially clearance, verification, and safe handling mindset.",
        example: "Even if someone tells you a pistol is unloaded, you still verify it yourself and still keep the muzzle in a safe direction."
      }
    },
    {
      test: ["condition white"],
      response: {
        answer: "Condition White means you are unaware and distracted.",
        why: "If you do not see a problem early, your options shrink fast.",
        where: "Lesson 1 → Awareness Levels",
        example: "Walking in public while staring at your phone and not noticing who is around you."
      }
    },
    {
      test: ["condition yellow"],
      response: {
        answer: "Condition Yellow is relaxed awareness.",
        why: "You are alert without being tense, which lets you notice trouble early and make better decisions.",
        where: "Lesson 1 → Awareness Levels",
        example: "Scanning exits, people, and movement while still acting calm and normal."
      }
    },
    {
      test: ["condition orange"],
      response: {
        answer: "Condition Orange means you have identified a possible threat and are preparing a response.",
        why: "You are no longer just generally aware. You are focused on a specific problem and thinking ahead.",
        where: "Lesson 1 → Awareness Levels",
        example: "A person changes direction to mirror your path in a parking lot."
      }
    },
    {
      test: ["condition red"],
      response: {
        answer: "Condition Red means the trigger has been met and action is required.",
        why: "At that point, the threat is no longer theoretical. You are making a real defensive decision.",
        where: "Lesson 1 → Awareness Levels",
        example: "Retreating, taking cover, or defending against an immediate deadly threat."
      }
    },
    {
      test: ["castle doctrine"],
      response: {
        answer: "Castle doctrine is the general term for laws that can lower the threshold for force in certain home-defense settings.",
        why: "Home-defense law can differ from general public-force analysis, but it does not erase the need for lawful judgment.",
        where: "Lesson 4 → Home Versus Property",
        example: "The key lesson is that defense of life and defense of property are not treated the same way."
      }
    },
    {
      test: ["permitless carry", "louisiana permitless carry"],
      response: {
        answer: "As taught in your course, Louisiana allows permitless concealed carry for eligible individuals 18 or older who are not prohibited from possessing firearms.",
        why: "Permitless carry changes permit requirements, not your legal responsibility.",
        where: "Lesson 8 → Permitless Carry in Louisiana",
        example: "You may carry lawfully and still violate the law if you carry in a prohibited place or act irresponsibly."
      }
    },
    {
      test: ["most firearm deaths", "most gun deaths"],
      response: {
        answer: "The lesson teaches that most firearm deaths are suicides, not homicides.",
        why: "That is why mental readiness, warning signs, and reducing access during crisis are part of responsible ownership.",
        where: "Lesson 9 → Suicide Prevention and Warning Signs",
        example: "Responsible ownership includes stepping in to protect life during emotional crisis."
      }
    }
  ];

  for (const item of directMap) {
    if (item.test.some((p) => question.includes(p))) {
      return item.response;
    }
  }

  return null;
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
    "test answer",
    "which choice",
    "what letter is right",
    "is it a b c or d"
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
    "what should i do",
    "suppose",
    "let's say"
  ];
  return patterns.some((p) => question.includes(p));
}

function formatBlockedResponse() {
  return `
    <b>Answer:</b> I will not give direct quiz or test answers.<br><br>
    <b>Why:</b> My job is to teach the concept so you actually understand it, not short-circuit the training.<br><br>
    <b>Where to find it:</b> Go back to the lesson or ask me to explain the idea behind the question.<br><br>
    <b>Example:</b> Ask me “why is that safer,” “what principle does that test,” or “where is that covered.”
  `;
}

// ------------------------------
// LESSON ACCESS
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

// ------------------------------
// SECTION SEARCH
// ------------------------------
function findBestSectionMatch(question) {
  const tokens = tokenize(question);
  let best = null;

  for (const lesson of getSearchableLessons()) {
    for (const section of lesson.sections || []) {
      const sectionText = [section.heading, ...(section.body || [])].join(" ").toLowerCase();

      if (sectionText.includes(question)) {
        return { lesson, section, score: 9999 };
      }

      let score = 0;

      for (const token of tokens) {
        if (section.heading.toLowerCase().includes(token)) {
          score += 5;
        }

        for (const line of section.body || []) {
          if (line.toLowerCase().includes(token)) {
            score += 2;
          }
        }

        if (lesson.summary.toLowerCase().includes(token)) {
          score += 1;
        }
      }

      if ((question.includes("rules") || question.includes("safety")) && lesson.id === 2) {
        score += 8;
      }

      if (!best || score > best.score) {
        best = { lesson, section, score };
      }
    }
  }

  if (!best || best.score <= 0) return null;
  return best;
}

function formatSectionResponse(match, question) {
  const { lesson, section } = match;
  const lessonMode = lesson.id >= 1 && lesson.id <= 7 ? "textbook" : "guided";

  const answerLine = pickBestLineForQuestion(section.body || [], question) || section.body?.[0] || lesson.summary;
  const answer = teachAnswer(answerLine, lesson, section);
  const why = buildWhyFromSection(section.body || [], lesson, section);
  const example = buildExampleFromLesson(lesson, section);

  const where =
    lessonMode === "textbook"
      ? `${lesson.title} → ${section.heading} (Textbook-based lesson)`
      : `${lesson.title} → ${section.heading} (Instructor-guided / gist-supported lesson)`;

  return formatResponse({ answer, why, where, example });
}

function pickBestLineForQuestion(lines, question) {
  const tokens = tokenize(question);
  let bestLine = null;
  let bestScore = 0;

  for (const line of lines) {
    const score = scoreTextAgainstQuestion(tokens, line);
    if (score > bestScore) {
      bestScore = score;
      bestLine = line;
    }
  }

  return bestLine;
}

function teachAnswer(line, lesson, section) {
  const lower = normalize(line);
  const heading = normalize(section.heading);

  if (heading.includes("awareness")) {
    return line;
  }

  if (heading.includes("avoidance") || heading.includes("route")) {
    return line;
  }

  if (heading.includes("clearing") || heading.includes("verification")) {
    return line;
  }

  if (heading.includes("platform") || heading.includes("controls")) {
    return line;
  }

  if (heading.includes("ammunition")) {
    return line;
  }

  if (heading.includes("reasonableness") || heading.includes("deadly force")) {
    return line;
  }

  if (heading.includes("trauma") || heading.includes("stress")) {
    return line;
  }

  if (heading.includes("alcohol") || heading.includes("drugs")) {
    return line;
  }

  if (heading.includes("suicide") || heading.includes("warning signs")) {
    return line;
  }

  if (heading.includes("final certification")) {
    return line;
  }

  if (lower.includes("condition white") || lower.includes("condition yellow") || lower.includes("condition orange") || lower.includes("condition red")) {
    return line;
  }

  return line;
}

function buildWhyFromSection(bodyLines, lesson, section) {
  const joined = bodyLines.join(" ").toLowerCase();
  const heading = section.heading.toLowerCase();

  if (joined.includes("aware") || joined.includes("awareness") || heading.includes("awareness")) {
    return "If you recognize danger early, you have more time, more space, and more options. That is the whole point.";
  }
  if (joined.includes("avoid") || heading.includes("avoidance") || heading.includes("route")) {
    return "Avoidance matters because the best defensive outcome is often preventing the encounter instead of reacting late inside it.";
  }
  if (joined.includes("verify") || joined.includes("chamber") || joined.includes("magazine")) {
    return "Safe handling starts with personal verification. You do not outsource that responsibility.";
  }
  if (joined.includes("trigger") || joined.includes("grip") || joined.includes("sights")) {
    return "Under stress, you fall back on your mechanics. That is why the fundamentals have to be repeatable.";
  }
  if (joined.includes("reasonable") || joined.includes("legal") || joined.includes("justified") || heading.includes("law")) {
    return "Legal force is judged after the fact. Confidence is not the standard. Reasonableness and justification are.";
  }
  if (joined.includes("stress") || joined.includes("trauma") || joined.includes("adrenaline")) {
    return "Stress changes perception and judgment. A responsible student understands both the event and the aftermath.";
  }
  if (joined.includes("holster") || joined.includes("laser") || joined.includes("flashlight") || joined.includes("gear")) {
    return "Gear should support judgment and skill. It should never become a substitute for them.";
  }
  if (joined.includes("permitless") || joined.includes("law enforcement") || joined.includes("impaired") || joined.includes("carry")) {
    return "Lawful carry is not just about being armed. It is about knowing where, when, and how you are still accountable.";
  }
  if (joined.includes("suicide") || joined.includes("warning signs") || joined.includes("hopeless") || joined.includes("crisis")) {
    return "Responsible ownership includes protecting life during crisis, not just responding to outside threats.";
  }
  if (lesson.id === 10) {
    return "The final evaluation is testing legal judgment, responsibility, and decision-making, not just memorization.";
  }

  return "This matters because safer judgment and earlier thinking usually produce better outcomes.";
}

function buildExampleFromLesson(lesson, section) {
  const t = `${lesson.title} ${section.heading}`.toLowerCase();

  if (t.includes("awareness")) return "Example: you notice unusual movement early and change direction before the situation gets close.";
  if (t.includes("route")) return "Example: you choose a better-lit path instead of the dark shortcut because convenience is not the standard.";
  if (t.includes("environment")) return "Example: you identify exits, barriers, and better positioning as soon as you arrive.";
  if (t.includes("firearm basics")) return "Example: you remove the magazine, lock the slide open, and verify both the chamber and feeding area yourself.";
  if (t.includes("shooting fundamentals")) return "Example: you focus on a stable stance, accountable hits, and clean trigger press before trying to rush speed.";
  if (t.includes("legal")) return "Example: you ask whether there is an immediate deadly threat instead of reacting to anger, pride, or property loss.";
  if (t.includes("aftermath")) return "Example: after a defensive event, you call 911 first and avoid disturbing the scene.";
  if (t.includes("gear")) return "Example: you pick gear you can actually carry and train with, not gear that only looks impressive.";
  if (t.includes("louisiana firearm law")) return "Example: lawful carry does not give you permission to carry in restricted places or act recklessly.";
  if (t.includes("mental readiness")) return "Example: if someone shows crisis warning signs, you take it seriously and help reduce access to firearms.";
  if (t.includes("final evaluation")) return "Example: the right answer is the one that shows lawful judgment and responsibility, not aggression.";

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
      const baseText = [item.q, item.explanation, ...(item.choices || [])].join(" ");
      const score = scoreTextAgainstQuestion(tokens, baseText);

      if (!best || score > best.score) {
        best = { lessonId: Number(lessonId), item, score };
      }
    }
  }

  if (!best || best.score <= 0) return null;

  const lesson = getLessonById(best.lessonId);

  return {
    answer: `This concept is being tested: ${stripQuizTone(best.item.q)}`,
    why: best.item.explanation || "This is covered in the lesson material connected to that quiz item.",
    where: lesson ? `${lesson.title}` : `Lesson ${best.lessonId}`,
    example: best.item.critical ? "Pay close attention here. In your final evaluation, critical mistakes matter." : null
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
    <b>Answer:</b> In a situation like that, the training points you toward the safer and more responsible response.<br><br>
    <b>Why:</b> ${best.scenario.explanation}<br><br>
    <b>Where to find it:</b> ${best.lesson.title} → Scenario Review<br><br>
    <b>Example:</b> ${best.scenario.prompt}
  `;
}

// ------------------------------
// WHERE PICKER
// ------------------------------
function pickContextWhere() {
  if (currentLesson) return currentLesson.title;
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
// BUBBLE STYLES
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
      color: rgba(255,255,255,.88);
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
