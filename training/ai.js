// =====================================================================
// BSA DAVID AI - 5.3
// =====================================================================

console.log("AI LOADED");

// ---------- ELEMENTS ----------
const panel = document.getElementById("aiPanel");
const input = document.getElementById("aiInput");
const sendBtn = document.getElementById("aiSend");
const messages = document.getElementById("aiMessages");

const toggleBtn = document.getElementById("aiToggleBtn");
const closeBtn = document.getElementById("aiClose");

// ---------- SAFETY CHECK ----------
if (!panel || !input || !sendBtn || !messages || !toggleBtn) {
  console.warn("AI INIT FAILED: Missing elements");
}

// ---------- TOGGLE ----------
toggleBtn.onclick = () => {
  panel.classList.toggle("hidden");
};

if (closeBtn) {
  closeBtn.onclick = () => panel.classList.add("hidden");
}

// ---------- UTIL ----------
function normalize(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, "").trim();
}

function fuzzyMatch(input, keyword) {
  input = normalize(input);
  keyword = normalize(keyword);

  if (input.includes(keyword)) return true;

  let matches = 0;
  for (let i = 0; i < Math.min(input.length, keyword.length); i++) {
    if (input[i] === keyword[i]) matches++;
  }

  return (matches / keyword.length) > 0.6;
}

// ---------- CHAT UI ----------
function addMessage(text, type = "ai") {
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.innerHTML = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// ---------- INTENT ----------
function getIntent(text) {
  text = normalize(text);

  if (
    fuzzyMatch(text, "condition yellow") ||
    fuzzyMatch(text, "yellow") ||
    fuzzyMatch(text, "awareness")
  ) return "yellow";

  if (
    fuzzyMatch(text, "no be there") ||
    fuzzyMatch(text, "avoid") ||
    fuzzyMatch(text, "stay away")
  ) return "avoidance";

  if (
    fuzzyMatch(text, "self defense") ||
    fuzzyMatch(text, "fight") ||
    fuzzyMatch(text, "protect")
  ) return "mindset";

  if (
    fuzzyMatch(text, "when shoot") ||
    fuzzyMatch(text, "use gun") ||
    fuzzyMatch(text, "firearm")
  ) return "force";

  return "unknown";
}

// ---------- RESPONSE ----------
function respond(intent) {
  switch (intent) {

    case "yellow":
      return `
      <b>Good question.</b><br><br>
      Condition Yellow means you're aware of your surroundings.<br><br>
      Not paranoid. Not distracted.<br><br>
      You're paying attention early so you don’t have to react late.<br><br>
      <i>The earlier you see something, the more options you have.</i>
      `;

    case "avoidance":
      return `
      <b>This is the core idea.</b><br><br>
      The goal is not to win the fight.<br>
      The goal is to not be there.<br><br>
      Most people wait too long and react late.<br><br>
      You move early.<br><br>
      <i>If something feels off — that’s enough. You leave.</i>
      `;

    case "mindset":
      return `
      <b>Let’s correct something.</b><br><br>
      Self-defense is not about fighting.<br><br>
      It’s about avoiding the fight entirely.<br><br>
      A firearm is not a solution to bad decisions.<br><br>
      <i>The goal is to never need it.</i>
      `;

    case "force":
      return `
      <b>Careful here.</b><br><br>
      You don’t look for a reason to use force.<br><br>
      Force is a last resort.<br><br>
      If you're thinking correctly, you avoid most situations long before this point.<br><br>
      <i>Think early decisions — not last-second reactions.</i>
      `;

    default:
      return `
      <b>Good question.</b><br><br>
      Ask using a lesson concept and I’ll explain it clearly.<br><br>
      <i>Think about the concept — not just the answer.</i>
      `;
  }
}

// ---------- MAIN ----------
function handleInput() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");

  const intent = getIntent(text);

  setTimeout(() => {
    addMessage(respond(intent), "ai");
  }, 250);

  input.value = "";
}

// ---------- EVENTS ----------
sendBtn.onclick = handleInput;

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleInput();
});

// ---------- START ----------
addMessage(
  `Ask me about a concept, why it matters, or where to review it.<br><br>
  <b>I teach — I don’t give answers.</b>`,
  "ai"
);
