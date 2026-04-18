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
  return "Good question. We'll wire real AI next.";
}
