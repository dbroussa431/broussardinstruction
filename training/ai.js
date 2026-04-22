// =====================================================================
// BSA DAVID INSTRUCTOR AI v6.0
// 
// =====================================================================

(function () {
  if (window.__BSA_AI_BOOTED__) return;
  window.__BSA_AI_BOOTED__ = true;

  // ------------------------------------------------------------
  // ELEMENTS
  // ------------------------------------------------------------
  const panel =
    document.getElementById("aiPanel") ||
    document.querySelector(".ai-panel");

  const input =
    document.getElementById("aiInput") ||
    document.querySelector("#aiPanel input");

  const sendBtn =
    document.getElementById("aiSend") ||
    document.querySelector("#aiPanel button");

  const messages =
    document.getElementById("aiMessages") ||
    document.querySelector(".ai-messages");

  const toggleBtn =
    document.getElementById("aiToggleBtn") ||
    document.getElementById("askInstructor");

  const closeBtn =
    document.getElementById("aiClose") ||
    document.querySelector("#aiPanel .ai-close");

  if (!panel || !input || !sendBtn || !messages || !toggleBtn) {
    console.warn("BSA AI: required UI elements missing.");
    return;
  }

  // ------------------------------------------------------------
  // PAGE CONTEXT
  // ------------------------------------------------------------
  const pagePath = window.location.pathname.toLowerCase();
  const isQuizPage = pagePath.includes("quiz");
  const lessonId = Number(new URLSearchParams(window.location.search).get("lesson") || 0);
  const lessons = Array.isArray(window.LESSONS) ? window.LESSONS : [];
  const currentLesson = lessons.find((l) => Number(l.id) === lessonId) || null;

  if (isQuizPage) {
    toggleBtn.style.display = "none";
    panel.style.display = "none";
    return;
  }

  // ------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------
  const memory = [];

  // ------------------------------------------------------------
  // TONE / DOCTRINE
  // ------------------------------------------------------------
  const DOCTRINE = {
    truths: [
      "The goal is not to win the fight. The goal is to not be there.",
      "Early awareness gives you options. Late awareness gives you problems.",
      "A firearm does not fix bad decisions.",
      "Force is a last resort, not a plan.",
      "Carrying increases responsibility, not authority."
    ],
    mistakes: [
      "waiting too long",
      "not noticing early",
      "asking what to do instead of what was missed",
      "focusing on tools instead of judgment",
      "trying to react late instead of move early"
    ]
  };

  const CONCEPTS = [
    {
      id: "condition_white",
      aliases: [
        "condition white",
        "white condition",
        "what is condition white",
        "what is white",
        "unaware",
        "distracted"
      ],
      answer:
        "Condition White means you are unaware and distracted. That is where people get caught off guard because they are mentally checked out instead of paying attention.",
      why:
        "If you are not paying attention, you lose time. If you lose time, your options disappear.",
      follow:
        "What would you miss first if you were distracted in a parking lot or store?"
    },
    {
      id: "condition_yellow",
      aliases: [
        "condition yellow",
        "what is yellow",
        "what is condition yellow",
        "yellow condition",
        "condtion yelow",
        "condition yelow",
        "conition yellow",
        "awareness level yellow",
        "relaxed awareness",
        "calm awareness"
      ],
      answer:
        "Condition Yellow is relaxed awareness. You are alert, not paranoid. You are paying attention early so nothing surprises you.",
      why:
        "Most people get into trouble because they were not paying attention early enough to move, leave, or create distance.",
      follow:
        "Where in your daily life are you most likely to drop out of Yellow and drift into distraction?"
    },
    {
      id: "condition_orange",
      aliases: [
        "condition orange",
        "what is orange",
        "what is condition orange",
        "orange condition",
        "something feels wrong",
        "something isnt right",
        "specific alert",
        "specific threat"
      ],
      answer:
        "Condition Orange means something specific is not right. You are no longer just generally aware. Your attention is now on a developing problem.",
      why:
        "This is where hesitation starts costing you. If you wait for certainty, you usually give away time and position.",
      follow:
        "What should happen first when something feels off: curiosity or movement?"
    },
    {
      id: "condition_red",
      aliases: [
        "condition red",
        "what is red",
        "what is condition red",
        "red condition",
        "action required",
        "imminent threat"
      ],
      answer:
        "Condition Red means a decision point has been reached and action is required. You are now reacting to something that should have been recognized earlier.",
      why:
        "Red is expensive. By the time you are here, earlier opportunities to avoid, move, or disengage may already be gone.",
      follow:
        "What earlier failure usually causes people to end up in Red?"
    },
    {
      id: "no_be_there",
      aliases: [
        "no be there",
        "what does no be there mean",
        "avoidance",
        "leave early",
        "move early",
        "stay away",
        "avoid trouble",
        "dont be there",
        "do not be there"
      ],
      answer:
        "The 'No Be There' principle means you do not stay and investigate trouble. If something feels wrong, that is enough to move. The goal is not to prove courage. The goal is to avoid the problem before it owns the timeline.",
      why:
        "People lose options by staying too long. Delay turns manageable problems into force problems.",
      follow:
        "What do most people wait for before moving that they should not wait for?"
    },
    {
      id: "self_defense",
      aliases: [
        "self defense",
        "self-defense",
        "real goal of personal protection",
        "what is self defense",
        "fight",
        "winning the fight"
      ],
      answer:
        "Self-defense is not about fighting. It is about avoiding the fight entirely. If your thinking starts with force, your thinking already went wrong.",
      why:
        "A weapon cannot correct a bad decision chain. Awareness, movement, and judgment come first.",
      follow:
        "What is the difference between being capable of force and looking for a reason to use it?"
    },
    {
      id: "responsibility",
      aliases: [
        "responsibility",
        "carrying responsibility",
        "reality of carrying",
        "armed responsibility",
        "owning a gun",
        "carrying a firearm"
      ],
      answer:
        "Carrying a firearm does not give you more authority. It gives you more responsibility. The standard goes up, not down.",
      why:
        "Once armed, your judgment matters even more. You do not get to be sloppy just because you have a tool.",
      follow:
        "How does being armed change what you should tolerate, say, or do in public?"
    },
    {
      id: "universal_safety_rules",
      aliases: [
        "safety rules",
        "universal safety rules",
        "gun safety rules",
        "firearm safety rules",
        "four safety rules"
      ],
      answer:
        "The core safety rules are simple: treat every firearm as if it is loaded, never point it at anything you are not willing to destroy, keep your finger off the trigger until you have made the decision to shoot, and know your target and what is beyond it.",
      why:
        "Most gun handling mistakes come from acting casual with something that demands discipline.",
      follow:
        "Which safety rule do people violate first when they rush?"
    },
    {
      id: "use_of_force",
      aliases: [
        "use of force",
        "deadly force",
        "when should i shoot",
        "when can i shoot",
        "when do i draw",
        "should i shoot",
        "use force",
        "kill someone"
      ],
      answer:
        "You do not look for a reason to use force. Force is a last resort when earlier layers failed and there is no safer lawful option left.",
      why:
        "The better question is usually not 'when do I shoot?' It is 'what should have happened earlier so this never got here?'",
      follow:
        "What earlier decision usually prevents the force question from ever needing to be asked?"
    },
    {
      id: "approach_distance",
      aliases: [
        "someone approaches me",
        "someone walking toward me",
        "closing distance",
        "approach me",
        "stranger approaching",
        "parking lot approach",
        "what if someone walks up"
      ],
      answer:
        "The first issue is not the approach. It is when you noticed it. If you are paying attention early, you manage distance, change angle, create movement, and avoid being fixed in place.",
      why:
        "Most people wait until it feels uncomfortable. By then they are already behind the situation.",
      follow:
        "If someone is closing distance, what matters first: explanation or space?"
    },
    {
      id: "shooting_fundamentals",
      aliases: [
        "shooting fundamentals",
        "how do i shoot better",
        "aim better",
        "trigger control",
        "front sight",
        "target focus",
        "sight alignment",
        "sight picture",
        "grip",
        "recoil control"
      ],
      answer:
        "Good shooting comes from consistency: grip, sight alignment, front sight focus when appropriate, and clean trigger press. People usually try to go fast before they can go clean.",
      why:
        "Speed without control is wasted motion. Mechanics matter, but they still sit underneath decision-making and judgment.",
      follow:
        "What are you actually losing first when you miss: sights, trigger control, or discipline?"
    },
    {
      id: "reaction_time",
      aliases: [
        "reaction time",
        "how fast can someone react",
        "why awareness matters",
        "time and distance",
        "late reaction"
      ],
      answer:
        "Reaction time is exactly why awareness matters. People imagine they will just react on time. Usually they do not. If you see it late, you are already paying a penalty.",
      why:
        "Awareness buys time. Time creates options. Without time, people default to panic, flinch, or bad force decisions.",
      follow:
        "What would you rather have in a real encounter: better reactions or earlier recognition?"
    },
    {
      id: "gear",
      aliases: [
        "what should i carry",
        "best gun",
        "best flashlight",
        "holster",
        "optic",
        "sling",
        "belt",
        "gear",
        "equipment"
      ],
      answer:
        "Gear supports decisions. It does not replace them. The wrong mindset with expensive gear is still the wrong mindset. Tools matter, but they come after judgment, awareness, and consistency.",
      why:
        "People love to solve thinking problems with shopping. That does not work.",
      follow:
        "Are you trying to solve a skill problem, a judgment problem, or just a gear preference?"
    },
    {
      id: "mental_readiness",
      aliases: [
        "mental readiness",
        "stress response",
        "freeze",
        "tunnel vision",
        "fear",
        "hesitation",
        "panic"
      ],
      answer:
        "Mental readiness is about recognizing how stress changes performance. Under pressure, people lose clarity, vision narrows, and hesitation gets expensive.",
      why:
        "If you do not account for human stress effects, you build fantasy plans instead of usable ones.",
      follow:
        "What falls apart first under pressure: your mechanics or your judgment?"
    },
    {
      id: "home_defense",
      aliases: [
        "home defense",
        "protect my home",
        "house defense",
        "castle doctrine",
        "home invasion",
        "defending my house"
      ],
      answer:
        "Home defense is still judgment-driven. Being in the home does not erase responsibility. You still need identification, safe angles, target confirmation, and clean thinking.",
      why:
        "People act like the location alone solves the decision. It does not.",
      follow:
        "What is the danger of assuming the house automatically makes every force decision simple?"
    }
  ];

  const QUIZ_REQUESTS = [
    "give me the answer",
    "what is the answer",
    "whats the answer",
    "what's the answer",
    "quiz answer",
    "correct answer",
    "which option",
    "what letter",
    "just tell me the answer"
  ];

  const GREETINGS = ["hi", "hello", "hey", "good morning", "good afternoon"];
  const HELP_PHRASES = ["help", "what can you do", "can you help"];
  const THANKS = ["thanks", "thank you", "appreciate it"];

  // ------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------
  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function tokenize(text) {
    return normalize(text)
      .split(/\s+/)
      .filter(Boolean)
      .filter((w) => w.length > 2);
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

    return windows.some((windowText) => {
      const dist = levenshtein(windowText, p);
      const maxLen = Math.max(windowText.length, p.length);
      return maxLen > 0 && dist / maxLen <= 0.28;
    });
  }

  function scoreTokenOverlap(question, text) {
    const qTokens = tokenize(question);
    const textNorm = normalize(text);
    let score = 0;

    for (const t of qTokens) {
      if (textNorm.includes(t)) score += 3;
      else {
        const root = t.slice(0, Math.max(3, t.length - 2));
        if (textNorm.includes(root)) score += 1;
      }
    }

    return score;
  }

  function currentFocusText() {
    if (currentLesson) return currentLesson.title;
    if (pagePath.includes("dashboard")) return "dashboard review";
    if (pagePath.includes("scenario")) return "scenario review";
    return "course review";
  }

  function greetingResponse() {
    return `
<b>I’m here.</b><br><br>
Ask me about a concept, situation, or mistake pattern from the training.<br><br>
<b>Current focus:</b> ${escapeHtml(currentFocusText())}<br><br>
<i>I teach thinking, not answer-hunting.</i>
`;
  }

  function helpResponse() {
    return `
<b>Here is what I do.</b><br><br>
I explain doctrine, correct bad thinking, connect lesson material, and force the issue back to judgment when needed.<br><br>
<b>Current focus:</b> ${escapeHtml(currentFocusText())}<br><br>
<i>Ask me what it means, why it matters, or what most people get wrong.</i>
`;
  }

  function thanksResponse() {
    return `
<b>Good.</b><br><br>
Keep going. Understanding matters more than memorizing.<br><br>
<i>The goal is not to sound informed. The goal is to think correctly early.</i>
`;
  }

  function blockQuizAnswerResponse() {
    return `
<b>No.</b><br><br>
I’m not giving quiz answers.<br><br>
<b>Why:</b><br>
If you only memorize a choice, you miss the judgment behind it.<br><br>
<i>Ask me to explain the principle the question is testing.</i>
`;
  }

  function doctrineResponse(concept) {
    return `
<b>This is where people get this wrong.</b><br><br>
${concept.answer}<br><br>
<b>Why it matters:</b><br>
${concept.why}<br><br>
<b>Think about this:</b><br>
${concept.follow}
`;
  }

  function lessonResponse(match) {
    return `
<b>Back up.</b><br><br>
${match.line}<br><br>
<b>Why it matters:</b><br>
${match.summary || "If you do not understand the principle early, your decisions get worse later."}<br><br>
<b>Source:</b><br>
${escapeHtml(match.lessonTitle)} → ${escapeHtml(match.heading)}<br><br>
<i>Most people miss this because they jump to reaction before they understand the setup.</i>
`;
  }

  function fallbackResponse() {
    return `
<b>You’re still asking too wide.</b><br><br>
Give me the concept, situation, or mistake you’re actually trying to understand.<br><br>
<b>Try:</b><br>
- what is condition yellow<br>
- what if someone closes distance<br>
- why does awareness matter<br>
- when does force become the wrong question<br><br>
<i>The clearer the concept, the cleaner the correction.</i>
`;
  }

  // ------------------------------------------------------------
  // CONCEPT MATCHING
  // ------------------------------------------------------------
  function findConcept(question) {
    let best = null;
    let bestScore = 0;

    for (const concept of CONCEPTS) {
      let score = 0;

      for (const phrase of concept.aliases) {
        if (fuzzyPhrase(question, phrase)) score += 10;
        score += scoreTokenOverlap(question, phrase);
      }

      if (score > bestScore) {
        bestScore = score;
        best = concept;
      }
    }

    return bestScore >= 8 ? best : null;
  }

  function findLessonMatch(question) {
    if (!lessons.length) return null;

    let best = null;
    let bestScore = 0;

    for (const lesson of lessons) {
      const lessonBias = Number(lesson.id) === lessonId ? 2 : 0;

      for (const section of lesson.sections || []) {
        const headingScore = scoreTokenOverlap(question, section.heading) * 2;

        for (const line of section.body || []) {
          const score =
            lessonBias +
            headingScore +
            scoreTokenOverlap(question, line) +
            (fuzzyPhrase(question, section.heading) ? 8 : 0) +
            (fuzzyPhrase(question, line) ? 10 : 0);

          if (score > bestScore) {
            bestScore = score;
            best = {
              lessonTitle: lesson.title,
              heading: section.heading,
              line,
              summary: lesson.summary || ""
            };
          }
        }
      }
    }

    return bestScore >= 7 ? best : null;
  }

  // ------------------------------------------------------------
  // INPUT ROUTING
  // ------------------------------------------------------------
  function isGreeting(question) {
    const q = normalize(question);
    return GREETINGS.some((g) => q === g || q.startsWith(g + " "));
  }

  function isHelp(question) {
    const q = normalize(question);
    return HELP_PHRASES.some((p) => q.includes(p));
  }

  function isThanks(question) {
    const q = normalize(question);
    return THANKS.some((p) => q.includes(p));
  }

  function isQuizRequest(question) {
    const q = normalize(question);
    return QUIZ_REQUESTS.some((p) => q.includes(p));
  }

  function remember(userText, aiText) {
    memory.push({
      user: userText,
      ai: aiText,
      time: Date.now()
    });

    if (memory.length > 8) memory.shift();
  }

  function maybeBridge(question) {
    if (memory.length < 1) return "";

    const recent = memory[memory.length - 1];
    const nowTokens = tokenize(question);
    const oldTokens = tokenize(recent.user);
    const overlap = nowTokens.filter((t) => oldTokens.includes(t));

    if (overlap.length >= 2) {
      return "This connects to what you just asked. ";
    }

    return "";
  }

  function answer(question) {
    if (isGreeting(question)) return greetingResponse();
    if (isHelp(question)) return helpResponse();
    if (isThanks(question)) return thanksResponse();
    if (isQuizRequest(question)) return blockQuizAnswerResponse();

    const bridge = maybeBridge(question);

    const concept = findConcept(question);
    if (concept) {
      return doctrineResponse({
        ...concept,
        answer: bridge + concept.answer
      });
    }

    const lessonMatch = findLessonMatch(question);
    if (lessonMatch) {
      if (bridge) {
        lessonMatch.line = bridge + lessonMatch.line;
      }
      return lessonResponse(lessonMatch);
    }

    return fallbackResponse();
  }

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  function addMessage(html, type) {
    const div = document.createElement("div");
    div.className = "msg " + type;
    div.innerHTML = html;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function handleSend() {
    const text = input.value.trim();
    if (!text || sendBtn.disabled) return;

    addMessage(escapeHtml(text), "user");
    input.value = "";
    sendBtn.disabled = true;

    setTimeout(() => {
      const reply = answer(text);
      addMessage(reply, "ai");
      remember(text, reply);
      sendBtn.disabled = false;
      input.focus();
    }, 180);
  }

  // ------------------------------------------------------------
  // EVENTS
  // ------------------------------------------------------------
  toggleBtn.addEventListener("click", () => {
    const hiddenByClass = panel.classList.contains("hidden");
    const hiddenByStyle = panel.style.display === "none" || panel.style.display === "";

    if (hiddenByClass) {
      panel.classList.remove("hidden");
      panel.style.display = "flex";
    } else if (hiddenByStyle) {
      panel.style.display = "flex";
    } else {
      if (panel.classList.contains("hidden")) {
        panel.classList.remove("hidden");
      } else {
        panel.style.display = "none";
      }
    }

    if (panel.style.display === "flex" || !panel.classList.contains("hidden")) {
      input.focus();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      panel.style.display = "none";
      panel.classList.add("hidden");
    });
  }

  sendBtn.addEventListener("click", handleSend);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSend();
  });

  // ------------------------------------------------------------
  // BOOT
  // ------------------------------------------------------------
  addMessage(
    `
Ask me about a concept, situation, or mistake from the training.<br><br>
<b>I teach thinking — not answer hunting.</b><br><br>
<i>Most problems are missed early before they are reacted to late.</i>
`,
    "ai"
  );
})();
