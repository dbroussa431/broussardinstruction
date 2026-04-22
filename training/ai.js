// =====================================================================
// BSA AI - CLOSED SYSTEM INSTRUCTOR 5.5
// =====================================================================

(function () {
  const panel = document.getElementById("aiPanel");
  const input = document.getElementById("aiInput");
  const sendBtn = document.getElementById("aiSend");
  const messages = document.getElementById("aiMessages");
  const toggleBtn = document.getElementById("aiToggleBtn");
  const closeBtn = document.getElementById("aiClose");

  if (!panel || !input || !sendBtn || !messages || !toggleBtn) {
    console.warn("BSA AI init failed: missing required elements.");
    return;
  }

  const lessonData = Array.isArray(window.LESSONS) ? window.LESSONS : [];
  const currentLessonId = Number(new URLSearchParams(window.location.search).get("lesson") || 0);

  const DOCTRINE = {
    yellow: {
      answer:
        "Condition Yellow means calm awareness. You are alert, not paranoid. You are paying attention early so you have time, distance, and options before a problem develops.",
      source: "Developing a Personal Protection Plan → Awareness Levels"
    },
    white: {
      answer:
        "Condition White means you are unaware and distracted. This is where people get caught off guard because they are not paying attention to what is developing around them.",
      source: "Developing a Personal Protection Plan → Awareness Levels"
    },
    orange: {
      answer:
        "Condition Orange means you have identified something specific that may become a threat. Your attention narrows to that issue and you start preparing decisions early.",
      source: "Developing a Personal Protection Plan → Awareness Levels"
    },
    red: {
      answer:
        "Condition Red means a decision point has been reached and action is required. If you are in Condition Red, earlier opportunities may already have been lost.",
      source: "Developing a Personal Protection Plan → Awareness Levels"
    },
    noBeThere: {
      answer:
        "The 'No Be There' principle means you do not need to stay and investigate trouble. If something feels wrong, you create distance early. The goal is not to win the confrontation. The goal is to not be there when it happens.",
      source: "Developing a Personal Protection Plan → The “No Be There” Principle"
    },
    selfDefense: {
      answer:
        "Self-defense is not about fighting. It is about avoiding the fight entirely. A firearm is not a solution to bad decisions. The earlier you recognize a problem, the more options you have.",
      source: "Developing a Personal Protection Plan → The Real Goal of Personal Protection"
    },
    responsibility: {
      answer:
        "Carrying a firearm does not give you more authority. It gives you more responsibility. The goal is not to use the firearm. The goal is to never need it.",
      source: "Firearm Basics and Responsibility → The Reality of Carrying a Firearm"
    },
    universalSafetyRules: {
      answer:
        "The universal safety rules are simple: treat every firearm as if it is loaded, never point it at anything you are not willing to destroy, keep your finger off the trigger until you have made the decision to shoot, and be sure of your target and what is beyond it.",
      source: "Firearm Basics and Responsibility → Universal Safety Rules"
    },
    useOfForce: {
      answer:
        "You do not look for a reason to use force. Force is a last resort. The correct mindset is avoidance first, lawful judgment second, and only then force if there is no safer lawful option left.",
      source: "Legal Use of Force and Aftermath"
    },
    castleDoctrine: {
      answer:
        "Castle Doctrine is a legal concept tied to defensive force in the home, but it does not erase the need for lawful judgment. You are still responsible for what you do and why you did it.",
      source: "Louisiana Firearm Law"
    },
    permitlessCarry: {
      answer:
        "Permitless carry changes permit requirements. It does not remove your responsibility to know the law, restricted locations, notification requirements, and standards for lawful behavior.",
      source: "Louisiana Firearm Law"
    },
    suicideRisk: {
      answer:
        "A major part of responsible firearm ownership is understanding crisis risk, warning signs, and access reduction. Mental readiness includes protecting life by reducing access to lethal means during crisis.",
      source: "Mental Readiness and Responsibility"
    }
  };

  const ALIASES = [
    { key: "yellow", phrases: ["condition yellow", "yellow condition", "yellow awareness", "what is yellow", "what is condition yellow", "condtion yelow", "condition yelow", "conditon yellow"] },
    { key: "white", phrases: ["condition white", "white condition", "what is white", "what is condition white"] },
    { key: "orange", phrases: ["condition orange", "orange condition", "what is orange", "what is condition orange"] },
    { key: "red", phrases: ["condition red", "red condition", "what is red", "what is condition red"] },
    { key: "noBeThere", phrases: ["no be there", "nobe there", "avoidance", "avoid danger", "leave early", "stay away", "move early", "avoid problems"] },
    { key: "selfDefense", phrases: ["self defense", "self-defense", "real goal of personal protection", "goal of self defense", "goal of personal protection"] },
    { key: "responsibility", phrases: ["responsibility", "responsible firearm owner", "reality of carrying", "carry responsibility"] },
    { key: "universalSafetyRules", phrases: ["universal safety rules", "safety rules", "four safety rules", "gun safety rules", "firearm safety rules"] },
    { key: "useOfForce", phrases: ["use of force", "when should i shoot", "when can i shoot", "use force", "shoot someone", "kill someone", "deadly force"] },
    { key: "castleDoctrine", phrases: ["castle doctrine"] },
    { key: "permitlessCarry", phrases: ["permitless carry", "constitutional carry"] },
    { key: "suicideRisk", phrases: ["suicide", "warning signs", "crisis", "mental readiness", "reduce access", "protect life during crisis"] }
  ];

  const QUIZ_REFUSAL_PHRASES = [
    "what is the answer",
    "what's the answer",
    "give me the answer",
    "quiz answer",
    "correct answer",
    "which option is right",
    "what letter is right",
    "just give me the answer",
    "tell me the answer"
  ];

  const GREETINGS = ["hi", "hello", "hey", "good morning", "good afternoon"];
  const THANKS = ["thanks", "thank you", "appreciate it"];
  const HELP = ["help", "can you help", "what can you do", "what do you do"];

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokens(text) {
    return normalize(text)
      .split(" ")
      .filter(Boolean)
      .filter((w) => w.length > 2);
  }

  function includesPhrase(question, phrase) {
    return normalize(question).includes(normalize(phrase));
  }

  function levenshtein(a, b) {
    a = normalize(a);
    b = normalize(b);
    const m = a.length;
    const n = b.length;
    if (!m) return n;
    if (!n) return m;

    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    return dp[m][n];
  }

  function fuzzyPhrase(question, phrase) {
    const q = normalize(question);
    const p = normalize(phrase);
    if (q.includes(p)) return true;

    const qWords = q.split(" ").filter(Boolean);
    const pWords = p.split(" ").filter(Boolean);

    if (pWords.length === 1) {
      return qWords.some((word) => {
        const dist = levenshtein(word, pWords[0]);
        const maxLen = Math.max(word.length, pWords[0].length);
        return maxLen > 0 && dist / maxLen <= 0.34;
      });
    }

    const windows = [];
    for (let i = 0; i <= qWords.length - pWords.length; i++) {
      windows.push(qWords.slice(i, i + pWords.length).join(" "));
    }

    return windows.some((w) => {
      const dist = levenshtein(w, p);
      const maxLen = Math.max(w.length, p.length);
      return maxLen > 0 && dist / maxLen <= 0.28;
    });
  }

  function isQuizAnswerRequest(question) {
    const q = normalize(question);
    return QUIZ_REFUSAL_PHRASES.some((p) => q.includes(p));
  }

  function isGreeting(question) {
    const q = normalize(question);
    return GREETINGS.some((g) => q === g || q.startsWith(g + " "));
  }

  function isThanks(question) {
    const q = normalize(question);
    return THANKS.some((t) => q.includes(t));
  }

  function isHelp(question) {
    const q = normalize(question);
    return HELP.some((h) => q.includes(h));
  }

  function doctrineMatch(question) {
    for (const item of ALIASES) {
      for (const phrase of item.phrases) {
        if (fuzzyPhrase(question, phrase)) {
          return item.key;
        }
      }
    }
    return null;
  }

  function scoreLine(question, line, heading, lessonTitle, isCurrentLesson) {
    const qTokens = tokens(question);
    const lineText = normalize(line);
    const headingText = normalize(heading);
    const lessonText = normalize(lessonTitle);

    let score = 0;

    for (const t of qTokens) {
      if (lineText.includes(t)) score += 3;
      if (headingText.includes(t)) score += 4;
      if (lessonText.includes(t)) score += 2;
    }

    const q = normalize(question);
    if (lineText.includes(q)) score += 8;
    if (headingText.includes(q)) score += 10;

    const headingTokens = tokens(heading);
    const overlap = headingTokens.filter((t) => qTokens.includes(t)).length;
    score += overlap * 5;

    if (isCurrentLesson) score += 2;

    return score;
  }

  function searchLessons(question) {
    if (!lessonData.length) return null;

    let best = null;
    let bestScore = 0;

    for (const lesson of lessonData) {
      const isCurrent = Number(lesson.id) === currentLessonId;
      for (const section of lesson.sections || []) {
        for (const line of section.body || []) {
          const score = scoreLine(question, line, section.heading, lesson.title, isCurrent);
          if (score > bestScore) {
            bestScore = score;
            best = {
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              heading: section.heading,
              line,
              summary: lesson.summary || ""
            };
          }
        }
      }
    }

    return bestScore >= 5 ? best : null;
  }

  function buildSourceText(match) {
    return `${match.lessonTitle} → ${match.heading}`;
  }

  function doctrineWrap(answer, source) {
    return `
<b>This is where people get this wrong.</b><br><br>
${answer}<br><br>
<b>Why it matters:</b><br>
If you recognize the problem early, you still have options. If you wait, your options disappear.<br><br>
<b>Source:</b><br>
${source}<br><br>
<i>Think early. Move early. Avoid early.</i>
`;
  }

  function knowledgeWrap(match) {
    return `
<b>This is where people get this wrong.</b><br><br>
${match.line}<br><br>
<b>What matters:</b><br>
${match.summary || "Understanding this early gives you better decisions later."}<br><br>
<b>Source:</b><br>
${buildSourceText(match)}<br><br>
<i>If you wait, your options disappear.</i>
`;
  }

  function fallbackWrap() {
    const current = lessonData.find((l) => Number(l.id) === currentLessonId);
    return `
<b>Good question.</b><br><br>
Ask me using a concept from the training and I’ll break it down clearly.<br><br>
<b>Current focus:</b><br>
${current ? current.title : "Course review"}<br><br>
<i>I teach the principle — not just the words.</i>
`;
  }

  function answerQuestion(question) {
    if (isGreeting(question)) {
      return `
<b>I’m here.</b><br><br>
Ask me about a concept from the training and I’ll help you think it through.<br><br>
<i>I teach — I don’t spoon-feed.</i>
`;
    }

    if (isThanks(question)) {
      return `
<b>Good.</b><br><br>
Keep going. Understanding matters more than memorizing.<br><br>
<i>That is how you stay out of trouble before it starts.</i>
`;
    }

    if (isHelp(question)) {
      return `
<b>Here’s what I do.</b><br><br>
I explain concepts from the training, correct bad thinking, and point you back to the right lesson material.<br><br>
<i>Ask me the principle you’re actually trying to understand.</i>
`;
    }

    if (isQuizAnswerRequest(question)) {
      return `
<b>No.</b><br><br>
I’m not giving you quiz answers.<br><br>
<b>Why:</b><br>
If you only memorize the answer, you fail the judgment part.<br><br>
<i>Ask me to explain the concept instead.</i>
`;
    }

    const matchedDoctrine = doctrineMatch(question);
    if (matchedDoctrine && DOCTRINE[matchedDoctrine]) {
      const item = DOCTRINE[matchedDoctrine];
      return doctrineWrap(item.answer, item.source);
    }

    const match = searchLessons(question);
    if (match) {
      return knowledgeWrap(match);
    }

    return fallbackWrap();
  }

  function addMessage(text, type) {
    const div = document.createElement("div");
    div.className = "msg " + type;
    div.innerHTML = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function handleInput() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";
    sendBtn.disabled = true;

    setTimeout(() => {
      try {
        const reply = answerQuestion(text);
        addMessage(reply, "ai");
      } finally {
        sendBtn.disabled = false;
        input.focus();
      }
    }, 180);
  }

  toggleBtn.addEventListener("click", () => {
    panel.classList.toggle("hidden");
    if (!panel.classList.contains("hidden")) {
      input.focus();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      panel.classList.add("hidden");
    });
  }

  sendBtn.addEventListener("click", handleInput);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleInput();
  });

  addMessage(
    `Ask me about any concept from Lessons 1–10.<br><br><b>I teach — I don’t give answers.</b>`,
    "ai"
  );
})();
