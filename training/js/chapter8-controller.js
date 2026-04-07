import { CH8_SECTIONS } from "./chapter8-data.js";

let sectionIndex = 0;

const title = document.getElementById("sectionTitle");
const content = document.getElementById("sectionContent");
const scenarioBlock = document.getElementById("scenarioBlock");
const quizBlock = document.getElementById("quizBlock");
const result = document.getElementById("result");

function renderSection() {

const s = CH8_SECTIONS[sectionIndex];

title.textContent = s.title;

content.innerHTML = s.gist.map(g => `<li>${g}</li>`).join("");

scenarioBlock.innerHTML = `<strong>Scenario:</strong> ${s.scenario}`;

quizBlock.innerHTML = "";

s.questions.sort(() => Math.random() - 0.5);

s.questions.forEach((q, i) => {

```
const block = document.createElement("div");
block.className = "question-card";

block.innerHTML = `<h4>${i + 1}. ${q.q}</h4>`;

const options = document.createElement("div");

q.choices.forEach((c, idx) => {

  const label = document.createElement("label");
  label.className = "option";

  label.innerHTML = `
    <input type="radio" name="q_${i}" value="${idx}">
    ${c}
  `;

  options.appendChild(label);

});

block.appendChild(options);
quizBlock.appendChild(block);
```

});

}

document.getElementById("submitBtn").onclick = () => {

const s = CH8_SECTIONS[sectionIndex];
let correct = 0;

s.questions.forEach((q, i) => {

```
const selected = document.querySelector(`input[name=q_${i}]:checked`);

if (selected && Number(selected.value) === q.answer) {
  correct++;
}
```

});

const percent = (correct / s.questions.length) * 100;

if (percent >= 80) {

```
result.innerHTML = "<span style='color:green'>PASS</span>";

sectionIndex++;

if (sectionIndex >= CH8_SECTIONS.length) {
  result.innerHTML = "<strong>CHAPTER 8 COMPLETE</strong>";
  return;
}

setTimeout(() => {
  result.innerHTML = "";
  renderSection();
}, 1000);
```

} else {

```
result.innerHTML = "<span style='color:red'>FAILED — REPEAT SECTION</span>";
```

}

};

renderSection();
