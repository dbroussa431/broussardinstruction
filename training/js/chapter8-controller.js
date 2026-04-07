import { CHAPTER8 } from "./chapter8-data.js";

let state = JSON.parse(localStorage.getItem("ch8")) || {
part: "law",
index: 0,
stage: "gist"
};

const content = document.getElementById("content");
const btn = document.getElementById("continueBtn");

function save() {
localStorage.setItem("ch8", JSON.stringify(state));
}

function render() {

let section = CHAPTER8[state.part][state.index];

if (state.stage === "gist") {

content.innerHTML = `
<h2>${section.title}</h2>
${section.gist.map(p => `<p>${p}</p>`).join("")}
`;

btn.onclick = () => {
state.stage = "scenario";
save();
render();
};

}

else if (state.stage === "scenario") {

content.innerHTML = `
<h2>Scenario</h2>
<p>${section.scenario.question}</p>
${section.scenario.answers.map((a,i)=>
`<button onclick="answer(${i})">${a}</button>`
).join("")}
`;

window.answer = (i) => {
if(i === section.scenario.correct){
state.stage = "quiz";
save();
render();
}else{
alert("Try again");
}
};

btn.style.display = "none";

}

else if (state.stage === "quiz") {

content.innerHTML = `
<h2>Quiz</h2>
${section.quiz.map((q,i)=>`
<p>${q.q}</p>
${q.options.map((o,j)=>
`<button onclick="quiz(${i},${j})">${o}</button>`
).join("")}
`).join("")}
`;

let score = 0;

window.quiz = (qi, ai) => {
if(ai === section.quiz[qi].correct){
score++;
}

if(qi === section.quiz.length - 1){

if(score >= section.quiz.length){
next();
}else{
alert("Retry section");
state.stage = "gist";
save();
render();
}

}
};

}

}

function next(){

state.index++;

if(state.index >= CHAPTER8[state.part].length){

if(state.part === "law"){
state.part = "mental";
state.index = 0;
state.stage = "gist";
}
else if(state.part === "mental"){
state.part = "final";
state.index = 0;
state.stage = "final";
renderFinal();
return;
}

}

state.stage = "gist";
save();
render();

}

function renderFinal(){

content.innerHTML = `
<h2>Final Quiz</h2>
${CHAPTER8.final.map((q,i)=>`
<p>${q.q}</p>
${q.options.map((o,j)=>
`<button onclick="final(${i},${j})">${o}</button>`
).join("")}
`).join("")}
`;

let score = 0;

window.final = (qi, ai) => {

if(ai === CHAPTER8.final[qi].correct){
score++;
}

if(qi === CHAPTER8.final.length - 1){

if(score >= CHAPTER8.final.length){
alert("Lesson Complete");
localStorage.removeItem("ch8");
window.location.href = "dashboard.html";
}else{
alert("Retry final");
renderFinal();
}

}

};

}

render();
