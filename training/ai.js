// =====================================================================
// BSA DAVID TEACHER - COMPLETE SMART AI.JS (FIXED INIT VERSION)
// =====================================================================

if (!window.BSA_AI_LOADED) {
  window.BSA_AI_LOADED = true;

  document.addEventListener("DOMContentLoaded", function () {

    const aiBtn = document.getElementById("aiToggleBtn");
    const aiPanel = document.getElementById("aiPanel");
    const aiClose = document.getElementById("aiClose");
    const aiSend = document.getElementById("aiSend");
    const aiInput = document.getElementById("aiInput");
    const aiMessages = document.getElementById("aiMessages");

    let aiClear = document.getElementById("aiClear");

    if (!aiBtn || !aiPanel || !aiSend || !aiInput || !aiMessages) {
      console.warn("BSA AI: Missing required elements — check HTML IDs");
      return;
    }

    let conversationMemory = [];

    function initAI() {

      ensureClearButton();

      aiBtn.onclick = () => {
        aiPanel.classList.toggle("hidden");

        if (!aiPanel.classList.contains("hidden")) {
          if (!aiMessages.dataset.initialized) {
            aiMessages.innerHTML = "";
            addInstructorMessage(getWelcomeMessage());
            aiMessages.dataset.initialized = "true";
          }
          aiInput.focus();
        }
      };

      aiClose.onclick = () => {
        aiPanel.classList.add("hidden");
      };

      aiSend.onclick = handleAISend;

      aiInput.onkeypress = (e) => {
        if (e.key === "Enter") handleAISend();
      };

      if (aiClear) {
        aiClear.onclick = clearChat;
      }
    }

    initAI();

    function handleAISend() {
      const question = aiInput.value.trim();
      if (!question || aiSend.disabled) return;

      addUserMessage(question);
      aiInput.value = "";
      aiSend.disabled = true;

      const thinkingId = addThinking();

      setTimeout(() => {
        try {
          const response = finalizeAnswer("Good question. Think about the concept first — not the answer.");
          replaceMessage(thinkingId, renderInstructor(response));
        } catch (error) {
          console.error(error);
        } finally {
          aiSend.disabled = false;
          aiInput.focus();
        }
      }, 400);
    }

    function finalizeAnswer(answer) {
      return answer;
    }

    function renderInstructor(html) {
      return `
        <div class="ai-row ai-row-ai">
          <div class="ai-bubble ai-bubble-ai">${html}</div>
        </div>
      `;
    }

    function renderUser(text) {
      return `
        <div class="ai-row ai-row-user">
          <div class="ai-bubble ai-bubble-user">${text}</div>
        </div>
      `;
    }

    function addUserMessage(text) {
      aiMessages.insertAdjacentHTML("beforeend", renderUser(text));
      scroll();
    }

    function addInstructorMessage(html) {
      aiMessages.insertAdjacentHTML("beforeend", renderInstructor(html));
      scroll();
    }

    function addThinking() {
      const id = "msg-" + Date.now();
      const div = document.createElement("div");
      div.dataset.msgId = id;
      div.innerHTML = `
        <div class="ai-row ai-row-ai">
          <div class="ai-bubble ai-bubble-ai">Thinking...</div>
        </div>
      `;
      aiMessages.appendChild(div);
      scroll();
      return id;
    }

    function replaceMessage(id, html) {
      const el = aiMessages.querySelector(`[data-msg-id="${id}"]`);
      if (el) el.innerHTML = html;
      scroll();
    }

    function scroll() {
      aiMessages.scrollTop = aiMessages.scrollHeight;
    }

    function clearChat() {
      aiMessages.innerHTML = "";
      addInstructorMessage(getWelcomeMessage());
    }

    function ensureClearButton() {
      if (aiClear) return;

      aiClear = document.createElement("button");
      aiClear.textContent = "Clear";
      aiClear.className = "ai-clear-btn";

      aiPanel.prepend(aiClear);
    }

    function getWelcomeMessage() {
      return `
        Ask me about the lesson. I’ll explain it clearly.
      `;
    }

  });
}
