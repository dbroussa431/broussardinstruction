(function () {
  const LESSON_ID = Number(new URLSearchParams(window.location.search).get("lesson") || 0);

  const root = document.createElement("div");
  root.id = "teacherAssistantRoot";
  root.innerHTML = `
    <button id="teacherAssistantToggle" aria-label="Open instructor support">
      <span class="ta-avatar">DB</span>
      <span class="ta-label">Ask Instructor</span>
    </button>

    <div id="teacherAssistantPanel" class="hidden" aria-live="polite">
      <div class="ta-head">
        <div>
          <strong>Instructor Support</strong>
          <div class="ta-sub">David A. Broussard, Sr.</div>
        </div>
        <button id="teacherAssistantClose" class="ta-close" aria-label="Close">×</button>
      </div>

      <div id="teacherAssistantMessages" class="ta-messages">
        <div class="ta-msg ta-msg-assistant">
          Ask a lesson question and I’ll help explain the concept.
          <br><br>
          I will not give direct quiz answers.
        </div>
      </div>

      <form id="teacherAssistantForm" class="ta-form">
        <input id="teacherAssistantInput" type="text" placeholder="Ask about the lesson..." autocomplete="off">
        <button type="submit">Send</button>
      </form>
    </div>
  `;
  document.body.appendChild(root);

  const style = document.createElement("style");
  style.textContent = `
    #teacherAssistantRoot{
      position:fixed;
      right:18px;
      bottom:18px;
      z-index:9999;
      font-family:Arial,Helvetica,sans-serif;
    }
    #teacherAssistantToggle{
      display:flex;
      align-items:center;
      gap:10px;
      border:0;
      background:#1f468c;
      color:#fff;
      padding:12px 14px;
      border-radius:999px;
      box-shadow:0 12px 28px rgba(19,40,78,.24);
      cursor:pointer;
      font-weight:800;
    }
    .ta-avatar{
      width:34px;
      height:34px;
      display:grid;
      place-items:center;
      border-radius:999px;
      background:#d8a62a;
      color:#111;
      font-size:.86rem;
      font-weight:900;
    }
    .ta-label{
      white-space:nowrap;
    }
    #teacherAssistantPanel{
      width:min(380px, calc(100vw - 24px));
      height:500px;
      background:#fff;
      border:1px solid #d9e0ec;
      border-radius:18px;
      box-shadow:0 18px 45px rgba(19,40,78,.22);
      overflow:hidden;
      display:flex;
      flex-direction:column;
      margin-top:12px;
    }
    #teacherAssistantPanel.hidden{
      display:none;
    }
    .ta-head{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      padding:14px 16px;
      background:linear-gradient(135deg,#17356b,#1f468c);
      color:#fff;
    }
    .ta-sub{
      font-size:.85rem;
      opacity:.88;
      margin-top:4px;
    }
    .ta-close{
      border:0;
      background:rgba(255,255,255,.15);
      color:#fff;
      width:34px;
      height:34px;
      border-radius:10px;
      cursor:pointer;
      font-size:1.1rem;
    }
    .ta-messages{
      flex:1;
      overflow:auto;
      padding:14px;
      background:#f7f9fd;
    }
    .ta-msg{
      max-width:88%;
      padding:10px 12px;
      border-radius:14px;
      margin-bottom:10px;
      line-height:1.5;
      font-size:.95rem;
    }
    .ta-msg-user{
      background:#1f468c;
      color:#fff;
      margin-left:auto;
      border-bottom-right-radius:6px;
    }
    .ta-msg-assistant{
      background:#fff;
      color:#142033;
      border:1px solid #d9e0ec;
      border-bottom-left-radius:6px;
    }
    .ta-form{
      display:grid;
      grid-template-columns:1fr auto;
      gap:10px;
      padding:12px;
      border-top:1px solid #d9e0ec;
      background:#fff;
    }
    .ta-form input{
      border:1px solid #d9e0ec;
      border-radius:12px;
      padding:12px;
      font:inherit;
    }
    .ta-form button{
      border:0;
      border-radius:12px;
      background:#d8a62a;
      color:#111;
      font-weight:800;
      padding:0 14px;
      cursor:pointer;
    }
  `;
  document.head.appendChild(style);

  const toggle = document.getElementById("teacherAssistantToggle");
  const panel = document.getElementById("teacherAssistantPanel");
  const close = document.getElementById("teacherAssistantClose");
  const form = document.getElementById("teacherAssistantForm");
  const input = document.getElementById("teacherAssistantInput");
  const messages = document.getElementById("teacherAssistantMessages");

  toggle.addEventListener("click", () => panel.classList.toggle("hidden"));
  close.addEventListener("click", () => panel.classList.add("hidden"));

  function addMessage(text, who) {
    const div = document.createElement("div");
    div.className = `ta-msg ta-msg-${who}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function lessonContext() {
    const lesson = (window.LESSONS || []).find(l => l.id === LESSON_ID);
    if (!lesson) return null;
    return lesson;
  }

  function answerForQuestion(userText) {
    const text = String(userText || "").toLowerCase().trim();
    const lesson = lessonContext();

    const refusesQuiz =
      text.includes("what is the answer") ||
      text.includes("give me the answer") ||
      text.includes("which option") ||
      text.includes("correct answer") ||
      text.includes("quiz answer");

    if (refusesQuiz) {
      return "I can help explain the concept, but I will not give direct quiz answers. Ask me what the rule means or what principle the lesson is teaching.";
    }

    if (!lesson) {
      return "Ask me about the lesson you are currently viewing and I’ll help explain the concept.";
    }

    if (text.includes("summary") || text.includes("gist")) {
      return `${lesson.title}: ${lesson.summary}`;
    }

    for (const section of lesson.sections || []) {
      const heading = String(section.heading || "").toLowerCase();
      if (text.includes(heading.split(" ")[0]) || text.includes(heading)) {
        return `${section.heading}: ${(section.body || []).join(" ")}`;
      }
    }

    if (LESSON_ID === 8) {
      return "For Louisiana law, focus on where carry is restricted, notification requirements, impairment restrictions, and the difference between lawful carry and lawful use of force.";
    }

    if (LESSON_ID === 9) {
      return "For mental readiness, focus on warning signs, crisis response, substance impairment, and your responsibility to reduce access to firearms during a crisis.";
    }

    if (LESSON_ID === 10) {
      return "For the final evaluation, concentrate on lawful judgment, restraint, and responsible decision-making. I can explain concepts, but not give direct answers.";
    }

    return "I can explain the lesson concept if you ask about a topic from the page, like awareness, force law, stress, mental health, or responsibility.";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, "user");
    input.value = "";

    const reply = answerForQuestion(text);
    window.setTimeout(() => addMessage(reply, "assistant"), 250);
  });
})();
