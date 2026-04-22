// =====================================================================
// BSA DAVID TEACHER - AI.JS 5.2
// =====================================================================


if (!window.BSA_AI_LOADED) {
  window.BSA_AI_LOADED = true;

  (function () {

    const aiBtn = document.getElementById("aiToggleBtn");
    const aiPanel = document.getElementById("aiPanel");
    const aiClose = document.getElementById("aiClose");
    const aiSend = document.getElementById("aiSend");
    const aiInput = document.getElementById("aiInput");
    const aiMessages = document.getElementById("aiMessages");

    if (!aiBtn || !aiPanel) return;

    let conversationMemory = [];

    // ===============================
    // INIT
    // ===============================
    aiBtn.onclick = () => {
      aiPanel.classList.toggle("hidden");

      if (!aiMessages.dataset.init) {
        aiMessages.innerHTML = "";
        addInstructorMessage(getWelcome());
        aiMessages.dataset.init = "1";
      }

      aiInput.focus();
    };

    aiClose.onclick = () => aiPanel.classList.add("hidden");
    aiSend.onclick = sendMessage;

    aiInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });

    // ===============================
    // SEND MESSAGE
    // ===============================
    function sendMessage() {
      const text = aiInput.value.trim();
      if (!text) return;

      addUserMessage(text);
      aiInput.value = "";
      aiSend.disabled = true;

      const thinkingId = addThinking();

      setTimeout(() => {
        const response = instructorAI(text);
        replaceMessage(thinkingId, renderAI(response));
        aiSend.disabled = false;
        aiInput.focus();
      }, 350);
    }

    // ===============================
    // CORE AI (FIXED LOGIC ORDER)
    // ===============================
    function instructorAI(qRaw) {
      const q = qRaw.toLowerCase();

      // 1. DIRECT ANSWERS FIRST
      if (q.includes("condition yellow")) {
        return finalize("Condition Yellow means you are relaxed — but aware of your surroundings.");
      }

      if (q.includes("condition white")) {
        return finalize("Condition White means you are unaware and mentally checked out.");
      }

      if (q.includes("no be there")) {
        return finalize("The goal is simple — don’t be there when the problem happens.");
      }

      if (q.includes("responsibility")) {
        return finalize("Carrying a firearm increases responsibility, not authority.");
      }

      // 2. NORMAL FLOW
      if (q === "hi" || q === "hello") {
        return finalize("I’m here. Ask me about the lesson.");
      }

      if (q.includes("help")) {
        return finalize("Ask me about a concept and I’ll break it down.");
      }

      if (q.includes("answer") || q.includes("quiz")) {
        return `
          I’m not giving quiz answers.<br><br>
          <strong>Why it matters:</strong> You need to understand the concept.<br><br>
          Ask me to explain it instead.
        `;
      }

      // 3. FALLBACK
      return finalize("Ask using a lesson concept and I’ll explain it clearly.");
    }

    // ===============================
    // STYLE LAYER (YOUR VOICE)
    // ===============================
    function finalize(text) {
  return `
    <strong>Good — this is where people get this wrong.</strong><br><br>

    ${text}<br><br>

    <strong>Here’s the part you need to understand:</strong><br>
    If you don’t recognize this early, you lose options.<br><br>

    <em>Think about it — don’t just memorize it.</em>
  `;
}

    // ===============================
    // UI RENDERING
    // ===============================
    function renderAI(html) {
      return `
        <div class="ai-row ai-row-ai">
          <div class="ai-bubble ai-bubble-ai">${html}</div>
        </div>
      `;
    }

    function renderUser(text) {
      return `
        <div class="ai-row ai-row-user">
          <div class="ai-bubble ai-bubble-user">${escape(text)}</div>
        </div>
      `;
    }

    function addUserMessage(text) {
      aiMessages.insertAdjacentHTML("beforeend", renderUser(text));
      scroll();
    }

    function addInstructorMessage(html) {
      aiMessages.insertAdjacentHTML("beforeend", renderAI(html));
      scroll();
    }

    function addThinking() {
      const id = "t" + Date.now();
      aiMessages.insertAdjacentHTML("beforeend", `
        <div class="ai-row ai-row-ai" data-id="${id}">
          <div class="ai-bubble ai-bubble-ai">Thinking...</div>
        </div>
      `);
      scroll();
      return id;
    }

    function replaceMessage(id, html) {
      const el = aiMessages.querySelector(`[data-id="${id}"]`);
      if (el) el.outerHTML = html;
      scroll();
    }

    function scroll() {
      aiMessages.scrollTop = aiMessages.scrollHeight;
    }

    function escape(str) {
      return str.replace(/[&<>"']/g, m => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
      }[m]));
    }

    function getWelcome() {
      return `
        Ask me about a concept, why it matters, or where to review it.<br><br>
        <strong>I teach — I don’t give answers.</strong>
      `;
    }

  })();
}
