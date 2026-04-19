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
  if (question.includes("condition white")) {
    answer = "Condition White means you are unaware and not paying attention.";
    why = "This is dangerous because you won’t recognize threats early enough to respond.";
    where = "Lesson 1 – Awareness Levels";
    scenario = "Example: Walking through a parking lot while staring at your phone.";
  }

  else if (question.includes("condition yellow")) {
    answer = "Condition Yellow is relaxed awareness — alert but not paranoid.";
    why = "It allows you to notice potential threats early without stress.";
    where = "Lesson 1 – Awareness Levels";
    scenario = "Example: Scanning your surroundings while walking into a store.";
  }

  else if (question.includes("condition orange")) {
    answer = "Condition Orange means you identified a potential threat.";
    why = "You begin preparing a response if the threat becomes real.";
    where = "Lesson 1 – Awareness Levels";
    scenario = "Example: Someone acting suspicious and moving toward you.";
  }

  else if (question.includes("condition red")) {
    answer = "Condition Red means action is required — the threat is real.";
    why = "At this point, you must act to protect yourself.";
    where = "Lesson 1 – Awareness Levels";
    scenario = "Example: An attacker approaches aggressively — you move, escape, or defend.";
  }

  // === DEFAULT FALLBACK ===
  else {
    answer = "That’s a good question.";
    why = "Based on your training, focus on awareness, avoidance, and decision-making.";
    where = "Review Lessons 1–7 for core concepts, or 8–10 for applied scenarios.";
    scenario = "";
  }

  // === FORMAT RESPONSE (your structure 🔥) ===
  return `
  <b>Answer:</b> ${answer}<br><br>
  <b>Why:</b> ${why}<br><br>
  <b>Where to find it:</b> ${where}
  ${scenario ? `<br><br><b>Example:</b> ${scenario}` : ""}
  `;
}
