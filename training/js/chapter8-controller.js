import { CH8 } from "./chapter8-data.js";

let section = 0;

function loadSection() {

  const s = CH8[section];

  document.getElementById("sectionTitle").textContent = s.title;

  document.getElementById("sectionContent").innerHTML =
    s.gist ? s.gist.map(g => `<li>${g}</li>`).join("") : "";

  document.getElementById("scenarioBlock").innerHTML =
    `<strong>Scenario:</strong> ${s.scenario}`;

  const quiz = document.getElementById("quizBlock");
  quiz.innerHTML = "";

  s.questions.sort(() => Math.random() - 0.5);

  s.questions.forEach((q, i) => {

    const div = document.createElement("div");
    div.className = "question-card";

    div.innerHTML = `<h4>${i + 1}. ${q.q}</h4>`;

    q.choices.forEach((c, idx) => {

      div.innerHTML += `
        <label class="option">
          <input type="radio" name="q${i}" value="${idx}">
          ${c}
        </label>
      `;

    });

    quiz.appendChild(div);

  });

}

document.getElementById("submitBtn").onclick = () => {

  const s = CH8[section];
  let correct = 0;

  s.questions.forEach((q, i) => {

    const selected = document.querySelector(`input[name=q${i}]:checked`);

    if (selected && Number(selected.value) === q.answer) correct++;

  });

  const percent = (correct / s.questions.length) * 100;

  if (percent >= 80) {

    section++;

    if (section >= CH8.length) {
      document.getElementById("result").innerHTML = "<strong>CHAPTER COMPLETE</strong>";
      return;
    }

    loadSection();

  } else {

    document.getElementById("result").innerHTML =
      "<span style='color:red'>FAILED — REPEAT SECTION</span>";

  }

};

loadSection();
