const aiBtn = document.getElementById("aiToggleBtn");
const aiPanel = document.getElementById("aiPanel");
const aiClose = document.getElementById("aiClose");
const aiSend = document.getElementById("aiSend");
const aiInput = document.getElementById("aiInput");
const aiMessages = document.getElementById("aiMessages");

// OPEN
aiBtn.onclick = () => {
  aiPanel.classList.toggle("hidden");
};

// CLOSE
aiClose.onclick = () => {
  aiPanel.classList.add("hidden");
};

// SEND MESSAGE
aiSend.onclick = async () => {
  const question = aiInput.value.trim();
  if (!question) return;

  addMessage("You", question);
  aiInput.value = "";

  const response = await fakeAIResponse(question);

  addMessage("Instructor", response);
};

// ENTER KEY
aiInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") aiSend.click();
});

// DISPLAY MESSAGE
function addMessage(sender, text) {
  const div = document.createElement("div");
  div.innerHTML = `<strong>${sender}:</strong> ${text}`;
  aiMessages.appendChild(div);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

// TEMP AI (we replace this next step)
async function fakeAIResponse(q) {
  const question = q.toLowerCase();

  let answer = "";
  let why = "";
  let where = "";
  let scenario = "";

  // === LESSON 1 EXAMPLE (expand this later) ===
  const lessonMap = [

  // === AWARENESS LEVELS ===
  {
    keywords: ["condition white", "unaware", "not paying attention"],
    answer: "Condition White means you are unaware and not paying attention.",
    why: "You cannot recognize danger early, which removes your ability to avoid or prepare.",
    where: "Lesson 1 – Awareness Levels",
    example: "Walking through a parking lot while looking at your phone."
  },

  {
    keywords: ["condition yellow", "aware", "alert"],
    answer: "Condition Yellow is a relaxed state of awareness.",
    why: "You are alert enough to notice changes in your environment without being stressed.",
    where: "Lesson 1 – Awareness Levels",
    example: "Scanning entrances, exits, and people while in public."
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


  // === AVOIDANCE & ROUTE CHOICE ===
  {
    keywords: ["avoid danger", "avoidance", "best defense"],
    answer: "The best defensive decision is often the one that avoids the encounter entirely.",
    why: "Avoiding a situation removes the need to react under pressure.",
    where: "Lesson 1 – Avoidance and Route Choice",
    example: "Choosing a well-lit path instead of a dark shortcut."
  },

  {
    keywords: ["route", "safe route", "where to go"],
    answer: "Route selection means choosing paths that maximize safety and visibility.",
    why: "Better routes give you more options and reduce risk.",
    where: "Lesson 1 – Avoidance and Route Choice",
    example: "Parking near entrances instead of isolated areas."
  },

  {
    keywords: ["isolated area", "dark area", "shortcut"],
    answer: "Avoid isolated or low-light areas whenever possible.",
    why: "These environments reduce visibility and increase vulnerability.",
    where: "Lesson 1 – Avoidance and Route Choice",
    example: "Cutting through an empty alley instead of walking around."
  },


  // === ENVIRONMENTAL ADVANTAGES ===
  {
    keywords: ["cover", "concealment", "barriers"],
    answer: "Environmental advantages include cover, concealment, barriers, and escape routes.",
    why: "Using your environment gives you a tactical advantage before force is needed.",
    where: "Lesson 1 – Environmental Advantages",
    example: "Positioning yourself near an exit or behind a solid object."
  },

  {
    keywords: ["escape route", "exit"],
    answer: "An escape route is a planned way to leave a situation safely.",
    why: "Knowing your exits reduces hesitation during a threat.",
    where: "Lesson 1 – Environmental Advantages",
    example: "Noticing multiple exits when entering a building."
  },

  {
    keywords: ["low light", "dark"],
    answer: "Low-light environments increase risk.",
    why: "They limit your ability to see threats and react early.",
    where: "Lesson 1 – Environmental Advantages",
    example: "Poorly lit parking lots or streets."
  },


  // === HABITS ===
  {
    keywords: ["daily habits", "routine", "safety habits"],
    answer: "Daily habits include locking doors, setting alarms, and staying aware.",
    why: "Consistent habits reduce the chance of preventable mistakes.",
    where: "Lesson 1 – Home and Daily Habits",
    example: "Always locking your vehicle and checking surroundings before exiting."
  },

  {
    keywords: ["mental rehearsal", "practice thinking"],
    answer: "Mental rehearsal is thinking through situations before they happen.",
    why: "It prepares your brain to act quickly under stress.",
    where: "Lesson 1 – Home and Daily Habits",
    example: "Thinking through what you would do if someone approached aggressively."
  },

  {
    keywords: ["preparedness", "paranoia"],
    answer: "Preparedness is not paranoia — it is disciplined awareness.",
    why: "You are not expecting danger everywhere, but you are ready if it happens.",
    where: "Lesson 1 – Home and Daily Habits",
    example: "Being aware in public without acting fearful."
  }

];
  // === DEFAULT FALLBACK ===
 return formatResponse({
  answer: "I don’t see that directly in Lesson 1.",
  why: "This lesson focuses on awareness, avoidance, and environmental decision-making.",
  where: "Review Lesson 1 sections: Awareness, Routes, Environment, and Habits",
  example: "Try asking about awareness levels, routes, or daily safety habits."
});

  // === FORMAT RESPONSE (your structure 🔥) ===
  return `
  <b>Answer:</b> ${answer}<br><br>
  <b>Why:</b> ${why}<br><br>
  <b>Where to find it:</b> ${where}
  ${scenario ? `<br><br><b>Example:</b> ${scenario}` : ""}
  `;
}
