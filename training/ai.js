// ==============================
// ELEMENTS
// ==============================
const aiBtn = document.getElementById("aiToggleBtn");
const aiPanel = document.getElementById("aiPanel");
const aiClose = document.getElementById("aiClose");
const aiSend = document.getElementById("aiSend");
const aiInput = document.getElementById("aiInput");
const aiMessages = document.getElementById("aiMessages");


// ==============================
// UI CONTROLS
// ==============================

// OPEN / TOGGLE
aiBtn.onclick = () => {
  aiPanel.classList.toggle("hidden");
};

// CLOSE
aiClose.onclick = () => {
  aiPanel.classList.add("hidden");
};


// ==============================
// SEND MESSAGE
// ==============================
aiSend.onclick = async () => {
  const question = aiInput.value.trim();
  if (!question) return;

  addMessage("You", question);
  aiInput.value = "";

  const response = await instructorAI(question);

  addMessage("Instructor", response);
};

// ENTER KEY SUPPORT
aiInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") aiSend.click();
});


// ==============================
// MESSAGE DISPLAY
// ==============================
function addMessage(sender, text) {
  const div = document.createElement("div");
  div.innerHTML = `<strong>${sender}:</strong> ${text}`;
  aiMessages.appendChild(div);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}


// ==============================
// 🧠 INSTRUCTOR AI ENGINE
// ==============================
async function instructorAI(q) {
  const question = q.toLowerCase();

  const lessonMap = [

    // ==========================
    // AWARENESS LEVELS
    // ==========================
    {
      keywords: ["condition white", "unaware", "not paying attention"],
      answer: "Condition White means you are unaware and not paying attention.",
      why: "You cannot recognize danger early, which removes your ability to avoid or prepare.",
      where: "Lesson 1 – Awareness Levels",
      example: "Walking through a parking lot while looking at your phone."
    },

    {
      keywords: ["condition yellow", "yellow awareness", "alert but calm"],
      answer: "Condition Yellow is a relaxed state of awareness.",
      why: "You are alert enough to notice changes without being stressed or paranoid.",
      where: "Lesson 1 – Awareness Levels",
      example: "Scanning your surroundings while entering a store."
    },

    {
      keywords: ["condition orange", "potential threat", "suspicious"],
      answer: "Condition Orange means you have identified a potential threat.",
      why: "You begin preparing a response if the situation escalates.",
      where: "Lesson 1 – Awareness Levels",
      example: "Someone acting unusually and moving toward you."
    },

    {
      keywords: ["condition red", "attack", "immediate threat"],
      answer: "Condition Red means action is required because the threat is real.",
      why: "At this point, hesitation can be dangerous — you must act.",
      where: "Lesson 1 – Awareness Levels",
      example: "An attacker approaches aggressively — you move, escape, or defend."
    },


    // ==========================
    // AVOIDANCE & ROUTES
    // ==========================
    {
      keywords: ["avoid danger", "avoidance", "best defense"],
      answer: "The best defensive decision is often the one that avoids the encounter entirely.",
      why: "Avoidance removes the need to make high-risk decisions under pressure.",
      where: "Lesson 1 – Avoidance and Route Choice",
      example: "Choosing a well-lit path instead of a dark shortcut."
    },

    {
      keywords: ["route", "safe route", "where should i go"],
      answer: "Route selection means choosing paths that maximize safety and visibility.",
      why: "Better routes give you more options and reduce risk.",
      where: "Lesson 1 – Avoidance and Route Choice",
      example: "Parking near entrances instead of isolated areas."
    },

    {
      keywords: ["shortcut", "dark area", "isolated"],
      answer: "Avoid isolated or low-light areas whenever possible.",
      why: "These environments increase vulnerability and reduce reaction time.",
      where: "Lesson 1 – Avoidance and Route Choice",
      example: "Cutting through an empty alley instead of walking around."
    },


    // ==========================
    // ENVIRONMENT
    // ==========================
    {
      keywords: ["cover", "concealment", "barrier"],
      answer: "Environmental advantages include cover, concealment, barriers, and escape routes.",
      why: "Using your environment gives you a tactical advantage before force is needed.",
      where: "Lesson 1 – Environmental Advantages",
      example: "Positioning yourself near an exit or behind a solid object."
    },

    {
      keywords: ["escape route", "exit plan"],
      answer: "An escape route is a planned way to leave a situation safely.",
      why: "Knowing exits reduces hesitation during a threat.",
      where: "Lesson 1 – Environmental Advantages",
      example: "Noticing multiple exits when entering a building."
    },

    {
      keywords: ["low light", "dark"],
      answer: "Low-light environments increase risk.",
      why: "They limit your ability to detect threats early.",
      where: "Lesson 1 – Environmental Advantages",
      example: "Poorly lit parking lots or streets."
    },


    // ==========================
    // HABITS
    // ==========================
    {
      keywords: ["daily habits", "routine safety"],
      answer: "Daily habits include locking doors, setting alarms, and staying aware.",
      why: "Consistent habits prevent avoidable mistakes.",
      where: "Lesson 1 – Home and Daily Habits",
      example: "Always checking surroundings before exiting your vehicle."
    },

    {
      keywords: ["mental rehearsal", "practice scenarios"],
      answer: "Mental rehearsal is thinking through situations before they happen.",
      why: "It prepares your brain to act faster under stress.",
      where: "Lesson 1 – Home and Daily Habits",
      example: "Planning what you would do if approached aggressively."
    },

    {
      keywords: ["preparedness", "paranoia"],
      answer: "Preparedness is not paranoia — it is disciplined awareness.",
      why: "You are not expecting danger everywhere, but you are ready if it happens.",
      where: "Lesson 1 – Home and Daily Habits",
      example: "Being aware in public without acting fearful."
    }
  ];


  // ==============================
  // MATCH ENGINE
  // ==============================
  const match = lessonMap.find(item =>
    item.keywords.some(k => question.includes(k))
  );

  if (match) {
    return formatResponse(match);
  }


  // ==============================
  // FALLBACK
  // ==============================
  return formatResponse({
    answer: "I don’t see that directly in Lesson 1.",
    why: "This lesson focuses on awareness, avoidance, and decision-making.",
    where: "Review Awareness Levels, Routes, Environment, and Habits.",
    example: "Try asking about awareness levels, routes, or safety habits."
  });
}


// ==============================
// RESPONSE FORMATTER
// ==============================
function formatResponse({ answer, why, where, example }) {
  return `
    <b>Answer:</b> ${answer}<br><br>
    <b>Why:</b> ${why}<br><br>
    <b>Where to find it:</b> ${where}
    ${example ? `<br><br><b>Example:</b> ${example}` : ""}
  `;
}
