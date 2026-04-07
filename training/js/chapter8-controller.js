import { CH8 } from "./chapter8-data.js";

let index = 0;

const title = document.getElementById("sectionTitle");
const content = document.getElementById("sectionContent");
const scenarioBlock = document.getElementById("scenarioBlock");
const quizBlock = document.getElementById("quizBlock");
const result = document.getElementById("result");

function loadSection() {

  const data = CH8[index];

  title.textContent = data.title;
  content.textContent = data.content;

  scenarioBlock.innerHTML = `<p><strong>Scenario:</strong> ${data.scenario}</p>`;

  quizBlock.innerHTML = "";

  data.answers.forEach((a, i) => {

    const label = document.createElement("label");
    label.className = "option";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "q";
    input.value = i;

    label.appendChild(input);
    label.append(" " + a);

    quizBlock.appendChild(label);

  });

}

document.getElementById("submitBtn").onclick = () => {

  const selected = document.querySelector("input[name=q]:checked");

  if (!selected) return;

  const val = Number(selected.value);
  const correct = CH8[index].correct;

  if (val === correct) {

    result.innerHTML = "<span style='color:green'>Correct</span>";

    index++;

    if (index >= CH8.length) {
      result.innerHTML = "<strong>Chapter 8 Complete</strong>";
      return;
    }

    setTimeout(() => {
      result.innerHTML = "";
      loadSection();
    }, 800);

  } else {

    result.innerHTML = "<span style='color:red'>Incorrect — retry required</span>";

  }

};

loadSection();
