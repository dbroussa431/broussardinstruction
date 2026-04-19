// =====================================
// BSA DAVID TEACHER - IMPROVED AI.JS
// =====================================

// ------------------------------
// CONSTANTS
// ------------------------------
const LABELS = {
  instructor: "BSA David Teacher",
  user: "You",
};
const CSS = {
  hidden: "hidden",
};

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
  aiBtn?.remove();
  aiPanel?.remove();
} else {
  initAI();
}

// ------------------------------
// INIT
// ------------------------------
function initAI() {
  if (!aiBtn || !aiPanel || !aiClose || !aiSend || !aiInput || !aiMessages) return;

  aiBtn.addEventListener("click", togglePanel);
  aiClose.addEventListener("click", () => aiPanel.classList.add(CSS.hidden));
  aiSend.addEventListener("click", handleAISend);
  aiInput.addEventListener("keypress", e => e.key === "Enter" && handleAISend());
}

function togglePanel() {
  aiPanel.classList.toggle(CSS.hidden);
  if (!aiPanel.classList.contains(CSS.hidden) && aiMessages.children.length === 0) {
    addInstructorMessage(getWelcomeMessage());
  }
}

// ------------------------------
// SEND LOGIC
// ------------------------------
async function handleAISend() {
  const question = aiInput.value.trim();
  if (!question || aiSend.disabled) return;

  addUserMessage(question);
  aiInput.value = "";
  aiSend.disabled = true;

  const thinkingId = addInstructorThinking();

  try {
    const response = await instructorAI(question);
    replaceMessage(thinkingId, renderInstructor(response));
  } catch (err) {
    console.error("AI response error:", err);
    replaceMessage(
      thinkingId,
      renderInstructor(
        formatResponse({
          answer: "I ran into an internal problem while building that response.",
          why: "The logic hit an unexpected condition while processing the question.",
          where: currentLesson ? currentLesson.title : "General course review",
          example: "Try shortening your question or reference a lesson heading.",
        })
      )
    );
  } finally {
    aiSend.disabled = false;
  }
}

// ------------------------------
// UI HELPERS
// ------------------------------
function renderMessage(label, body, role) {
  return `
    <div class="ai-msg ai-msg-${role}">
      <div class="ai-msg-label">${label}</div>
      <div class="ai-msg-body">${body}</div>
    </div>
  `;
}

function renderInstructor(html) {
  return renderMessage(LABELS.instructor, html, "instructor");
}
function renderUser(html) {
  return renderMessage(LABELS.user, escapeHtml(html), "user");
}

function addUserMessage(text) {
  const wrap = document.createElement("div");
  wrap.className = "ai-msg-row ai-msg-row-user";
  wrap.innerHTML = renderUser(text);
  aiMessages.appendChild(wrap);
  scrollAIToBottom();
}

function addInstructorMessage(html) {
  const wrap = document.createElement("div");
  wrap.className = "ai-msg-row ai-msg-row-instructor";
  wrap.innerHTML = renderInstructor(html);
  aiMessages.appendChild(wrap);
  scrollAIToBottom();
}

function addInstructorThinking() {
  const id = `thinking-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const wrap = document.createElement("div");
  wrap.className = "ai-msg-row ai-msg-row-instructor";
  wrap.dataset.msgId = id;
  wrap.innerHTML = renderInstructor(`<i class="thinking">Thinking</i>`);
  aiMessages.appendChild(wrap);
  scrollAIToBottom();
  return id;
}

function replaceMessage(id, html) {
  const target = aiMessages.querySelector(`[data-msg-id="${id}"]`);
  if (target) target.innerHTML = html;
  else addInstructorMessage(html);
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
// WELCOME MESSAGE
// ------------------------------
function getWelcomeMessage() {
  const lessonLabel = currentLesson
    ? `You are in ${escapeHtml(currentLesson.title)}.`
    : "You are on the student dashboard.";

  return `
    <b>${LABELS.instructor}</b><br><br>
    Ask me about:
    <ul style="margin:8px 0 0 18px;padding:0;">
      <li>what a concept means</li>
      <li>why it matters</li>
      <li>where to review it</li>
      <li>a simple example or scenario if it helps</li>
    </ul>
    <br>
    ${lessonLabel}<br><br>
    <b>Important:</b> I teach, explain, and review. I do not give direct quiz answers or assistance during quizzes.
  `;
}

// ------------------------------
// TEACHING BRAIN (unchanged logic)
// ------------------------------
// Your full instructorAI() and helper logic go here — unchanged for compatibility.
// (You can paste your existing logic segment from "CORE INSTRUCTOR BRAIN" downwards.)

// ------------------------------
// STYLES — with spinner animation
// ------------------------------
injectAIChatStyles();

function injectAIChatStyles() {
  if (document.getElementById("aiChatBubbleStyles")) return;
  const style = document.createElement("style");
  style.id = "aiChatBubbleStyles";
  style.textContent = `
    .ai-msg-row { display: flex; margin: 10px 0; width: 100%; }
    .ai-msg-row-user { justify-content: flex-end; }
    .ai-msg-row-instructor { justify-content: flex-start; }
    .ai-msg {
      max-width: 88%;
      border-radius: 14px;
      padding: 10px 12px;
      line-height: 1.45;
      box-shadow: 0 2px 8px rgba(0,0,0,.06);
      font-size: 14px;
    }
    .ai-msg-user { background: #1e3a8a; color: #fff; border-bottom-right-radius: 4px; }
    .ai-msg-instructor { background: #f8fbff; color: #142033; border: 1px solid #d9e0ec; border-bottom-left-radius: 4px; }
    .ai-msg-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 6px; opacity: .82; }
    .ai-msg-user .ai-msg-label { color: rgba(255,255,255,.88); }
    .ai-msg-instructor .ai-msg-label { color: #1f468c; }
    .ai-msg-body { white-space: normal; word-break: break-word; }

    /* subtle animated thinking indicator */
    .thinking::after {
      content: '';
      display: inline-block;
      width: 1ch;
      animation: dots 1.2s steps(4, end) infinite;
    }
    @keyframes dots {
      0%, 20% { content: ''; }
      40% { content: '.'; }
      60% { content: '..'; }
      80%, 100% { content: '...'; }
    }
  `;
  document.head.appendChild(style);
}
