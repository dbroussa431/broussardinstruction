import { CHAPTER8 } from "./chapter8-data.js";

const content = document.getElementById("content");
const progress = document.getElementById("progress");
const btn = document.getElementById("continueBtn");

let state = JSON.parse(localStorage.getItem("ch8")) || {
part: "law",
index: 0,
stage: "gist"
};

function save(){
localStorage.setItem("ch8", JSON.stringify(state));
}

function updateProgress(){
progress.textContent = `${state.part.toUpperCase()} - Checkpoint ${state.index+1}`;
}

function render(){

updateProgress();

const section = CHAPTER8[state.part][state.index];

if(state.stage === "gist"){

content.innerHTML = `
<div class="card">
<h2>${section.title}</h2>
${section.gist.map(p=>`<p>${p}</p>`).join("")}
</div>
`;

btn.style.display="block";
btn.onclick=()=>{
state.stage="scenario";
save();
render();
};

}

else if(state.stage==="scenario"){

btn.style.display="none";

content.innerHTML = `
<div class="card">
<h2>Scenario</h2>
<p>${section.scenario.question}</p>
${section.scenario.answers.map((a,i)=>
`<button data-i="${i}">${a}</button>`
).join("")}
</div>
`;

document.querySelectorAll("button[data-i]").forEach(b=>{
b.onclick = ()=>{
const i = Number(b.dataset.i);
if(i===section.scenario.correct){
state.stage="quiz";
save();
render();
}else{
alert("Review the material and try again.");
}
};
});

}

else if(state.stage==="quiz"){

btn.style.display="none";

const pool = section.quizPool;
const selected = shuffle(pool).slice(0,5);

let answers = [];

content.innerHTML = `
<div class="card">
<h2>Quiz</h2>
${selected.map((q,i)=>`
<p>${q.q}</p>
${q.options.map((o,j)=>`
<button data-q="${i}" data-a="${j}">${o}</button>
`).join("")}
`).join("")}
<button id="submitQuiz">Submit</button>
</div>
`;

document.querySelectorAll("button[data-q]").forEach(b=>{
b.onclick = ()=>{
answers[b.dataset.q] = Number(b.dataset.a);
b.style.background="#ccc";
};
});

document.getElementById("submitQuiz").onclick=()=>{

let correct=0;

selected.forEach((q,i)=>{
if(answers[i]===q.correct) correct++;
});

if(correct>=4){
next();
}else{
alert("You must pass this checkpoint.");
state.stage="gist";
save();
render();
}

};

}

}

function next(){

state.index++;

if(state.index >= CHAPTER8[state.part].length){

if(state.part==="law"){
state.part="mental";
state.index=0;
}
else if(state.part==="mental"){
renderFinal();
return;
}

}

state.stage="gist";
save();
render();

}

function renderFinal(){

content.innerHTML = `
<div class="card">
<h2>Final Check</h2>
${CHAPTER8.final.map((q,i)=>`
<p>${q.q}</p>
${q.options.map((o,j)=>`
<button data-q="${i}" data-a="${j}">${o}</button>
`).join("")}
`).join("")}
<button id="submitFinal">Submit</button>
</div>
`;

let answers=[];

document.querySelectorAll("button[data-q]").forEach(b=>{
b.onclick=()=>{
answers[b.dataset.q]=Number(b.dataset.a);
};
});

document.getElementById("submitFinal").onclick=()=>{

let correct=0;

CHAPTER8.final.forEach((q,i)=>{
if(answers[i]===q.correct) correct++;
});

if(correct>=CHAPTER8.final.length){
alert("Lesson Complete");
localStorage.removeItem("ch8");
window.location.href="dashboard.html";
}else{
alert("Retry final section");
renderFinal();
}

};

}

function shuffle(arr){
return arr.sort(()=>Math.random()-0.5);
}

render();
