// =====================================================================
// BSA DAVID TEACHER - AI.JS 5.2
// =====================================================================

// ---------- UI HOOKS ----------
const panel = document.getElementById("aiPanel");
const input = document.getElementById("aiInput");
const sendBtn = document.getElementById("aiSend");
const messages = document.getElementById("aiMessages");
const toggleBtn = document.getElementById("askInstructor");

// ---------- TOGGLE ----------
if (toggleBtn) {
  toggleBtn.onclick = () => {
    panel.style.display = panel.style.display === "flex" ? "none" : "flex";
  };
}

// ---------- UTIL ----------
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim();
}

function similarity(a, b) {
  let longer = a.length > b.length ? a : b;
  let shorter = a.length > b.length ? b : a;

  let same = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer[i] === shorter[i]) same++;
  }

  return same / longer.length;
}

function fuzzyIncludes(input, keyword) {
  input = normalize(input);
  keyword = normalize(keyword);

  if (input.includes(keyword)) return true;

  return similarity(input, keyword) > 0.6;
}

// ---------- CHAT UI ----------
function addMessage(text, type = "ai") {
  const div = document.createElement("div");
  div.className = type === "user" ? "msg user" : "msg ai";
  div.innerHTML = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// ---------- CORE BRAIN ----------

function getIntent(input) {
  input = normalize(input);

  // CONDITION YELLOW
  if (
    fuzzyIncludes(input, "yellow") ||
    fuzzyIncludes(input, "condition yellow") ||
    fuzzyIncludes(input, "awareness")
  ) {
    return "yellow";
  }

  // NO BE THERE
  if (
    fuzzyIncludes(input, "no be there") ||
    fuzzyIncludes(input, "avoid") ||
    fuzzyIncludes(input, "stay away")
  ) {
    return "avoidance";
  }

  // SELF DEFENSE
  if (
    fuzzyIncludes(input, "self defense") ||
    fuzzyIncludes(input, "fight") ||
    fuzzyIncludes(input, "protect")
  ) {
    return "mindset";
  }

  // FIREARM USE
  if (
    fuzzyIncludes(input, "when shoot") ||
    fuzzyIncludes(input, "use gun") ||
    fuzzyIncludes(input, "firearm")
  ) {
    return "use_of_force";
  }

  return "unknown";
}

// ---------- RESPONSE SYSTEM ----------

function respond(intent, input) {
  switch (intent) {
    case "yellow":
      return `
<b>Good question.</b><br><br>
Condition Yellow means you're relaxed — but aware of your surroundings.<br><br>
Not paranoid. Not distracted.<br><br>
You’re paying attention early so you don’t have to react late.<br><br>
<i>Think about it — the earlier you see something, the more options you have.</i>
`;

    case "avoidance":
      return `
<b>This is the core idea.</b><br><br>
The goal is not to win the fight.<br>
The goal is to not be there.<br><br>
Most people wait too long and then try to react.<br><br>
You don’t wait. You move early.<br><br>
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

    case "use_of_force":
      return `
<b>Careful here.</b><br><br>
You don’t look for a reason to use force.<br><br>
Force is a last resort — when everything else has failed.<br><br>
If you’re thinking correctly, you avoid most situations long before that point.<br><br>
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

// ---------- MAIN FLOW ----------
function handleInput() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");

  const intent = getIntent(text);
  const reply = respond(intent, text);

  setTimeout(() => {
    addMessage(reply, "ai");
  }, 300);

  input.value = "";
}

// ---------- EVENTS ----------
if (sendBtn) sendBtn.onclick = handleInput;

if (input) {
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleInput();
  });
}

// ---------- START MESSAGE ----------
addMessage(
  `Ask me about a concept, why it matters, or where to review it.<br><br>
<b>I teach — I don’t give answers.</b>`,
  "ai"
);
