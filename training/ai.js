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
aiBtn.onclick = () => aiPanel.classList.toggle("hidden");
aiClose.onclick = () => aiPanel.classList.add("hidden");

aiSend.onclick = async () => {
  const question = aiInput.value.trim();
  if (!question) return;

  addMessage("You", question);
  aiInput.value = "";

  const response = await instructorAI(question);
  addMessage("Instructor", response);
};

aiInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") aiSend.click();
});

function addMessage(sender, text) {
  const div = document.createElement("div");
  div.innerHTML = `<strong>${sender}:</strong> ${text}`;
  aiMessages.appendChild(div);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

// ==============================
// 🧠 CORE AI ENGINE
// ==============================
async function instructorAI(q) {
  const question = q.toLowerCase();

  // ==========================
  // SCENARIO MODE DETECTION
  // ==========================
  const isScenario = question.includes("what if") || question.includes("scenario");

  if (isScenario) {
    return handleScenario(question);
  }

  // ==========================
  // LESSON SEARCH (REAL DATA)
  // ==========================
  for (const lesson of window.LESSONS) {

    // SEARCH SECTIONS
    for (const section of lesson.sections) {
      for (const line of section.body) {

        const text = line.toLowerCase();

        if (question.split(" ").some(word => text.includes(word))) {
          return formatResponse({
            answer: cleanLine(line),
            why: explainLine(line),
            where: `${lesson.title} → ${section.heading}`,
            example: null
          });
        }
      }
    }

    // SEARCH SCENARIOS
    for (const scenario of lesson.scenarios || []) {
      const prompt = scenario.prompt.toLowerCase();

      if (question.split(" ").some(word => prompt.includes(word))) {
        return `
          <b>Scenario Guidance:</b><br><br>
          ${scenario.prompt}<br><br>

          <b>Correct Approach:</b><br>
          ${scenario.choices[scenario.answer]}<br><br>

          <b>Why:</b><br>
          ${scenario.explanation}<br><br>

          <b>Lesson Source:</b><br>
          ${lesson.title}
        `;
      }
    }
  }

  // ==========================
  // FALLBACK
  // ==========================
  return formatResponse({
    answer: "That’s a good question, but I don’t see it directly in your current lesson.",
    why: "Focus on awareness, avoidance, legal judgment, and responsible decision-making.",
    where: "Review Lessons 1–7 for fundamentals or 8–10 for applied judgment.",
    example: "Try asking about awareness levels, legal force, or scenario decisions."
  });
}

// ==============================
// 🎯 SCENARIO MODE (ADVANCED)
// ==============================
function handleScenario(question) {

  return `
    <b>Scenario Analysis:</b><br><br>

    Based on your training, your priorities should be:<br><br>

    1. <b>Awareness</b> – Identify the threat early<br>
    2. <b>Avoidance</b> – Create distance if possible<br>
    3. <b>Positioning</b> – Use movement, light, and barriers<br>
    4. <b>Decision</b> – Only escalate if legally justified<br><br>

    <b>Instructor Guidance:</b><br>
    Do not rush to force. Your goal is to stay ahead of the problem, not react late.<br><br>

    <b>Reference:</b><br>
    Lessons 1 (Awareness), 4 (Legal), and 8 (Law)
  `;
}

// ==============================
// 🧠 HELPER: CLEAN LINE
// ==============================
function cleanLine(line) {
  return line.replace(/^\w+ is /i, "").trim();
}

// ==============================
// 🧠 HELPER: EXPLANATION ENGINE
// ==============================
function explainLine(line) {

  if (line.toLowerCase().includes("avoid")) {
    return "Avoidance reduces risk before force is needed.";
  }

  if (line.toLowerCase().includes("awareness")) {
    return "Awareness gives you time to act early instead of reacting late.";
  }

  if (line.toLowerCase().includes("law")) {
    return "Legal decisions are judged after the event, not in the moment.";
  }

  return "This is a core concept tied to safety and decision-making.";
}

// ==============================
// 🎯 RESPONSE FORMAT
// ==============================
function formatResponse({ answer, why, where, example }) {
  return `
    <b>Answer:</b> ${answer}<br><br>
    <b>Why:</b> ${why}<br><br>
    <b>Where to find it:</b> ${where}
    ${example ? `<br><br><b>Example:</b> ${example}` : ""}
  `;
}
