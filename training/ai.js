// =====================================================================
// BSA AI — COMPLETE INSTRUCTOR MODEL 5.4
// =====================================================================

const input = document.getElementById("aiInput");
const sendBtn = document.getElementById("aiSend");
const messages = document.getElementById("aiMessages");
const toggleBtn = document.getElementById("aiToggleBtn");
const panel = document.getElementById("aiPanel");
const closeBtn = document.getElementById("aiClose");

// ---------- UI ----------
toggleBtn.onclick = () => panel.classList.toggle("hidden");
if (closeBtn) closeBtn.onclick = () => panel.classList.add("hidden");

function addMessage(text, type="ai"){
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.innerHTML = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// ---------- UTIL ----------
function normalize(t){
  return t.toLowerCase().replace(/[^\w\s]/g,"").trim();
}

// ---------- DOCTRINE ----------
function applyDoctrine(q){
  if(q.includes("shoot") || q.includes("kill")){
    return {
      type:"force",
      warning:true
    };
  }

  if(q.includes("fight")){
    return {
      type:"mindset",
      warning:false
    };
  }

  return { type:"general" };
}

// ---------- KNOWLEDGE ----------
function searchLessons(q){
  if(!window.LESSONS) return null;

  q = normalize(q);

  let best=null;
  let score=0;

  LESSONS.forEach(l=>{
    l.sections.forEach(s=>{
      s.body.forEach(line=>{
        let match = similarity(q,line);
        if(match>score){
          score=match;
          best={lesson:l.title,heading:s.heading,line};
        }
      });
    });
  });

  return score>0.3 ? best : null;
}

function similarity(a,b){
  a=normalize(a); b=normalize(b);
  let match=0;
  for(let i=0;i<Math.min(a.length,b.length);i++){
    if(a[i]===b[i]) match++;
  }
  return match/b.length;
}

// ---------- RESPONSE ----------
function respond(q){

  const doctrine = applyDoctrine(q);
  const lesson = searchLessons(q);

  // FORCE / DANGEROUS THINKING
  if(doctrine.type==="force"){
    return `
<b>Stop.</b><br><br>
You're thinking about this the wrong way.<br><br>

Force is not the goal.<br>
Avoidance is the goal.<br><br>

If you're at the point where you're asking that, you've already made earlier mistakes.<br><br>

<i>Think earlier. Move earlier. Avoid earlier.</i>
`;
  }

  // LESSON MATCH
  if(lesson){
    return `
<b>This is where people get this wrong.</b><br><br>

${lesson.line}<br><br>

<b>What matters:</b><br>
You either recognize this early — or you deal with it late.<br><br>

<b>Source:</b><br>
${lesson.lesson} → ${lesson.heading}<br><br>

<i>If you wait, your options disappear.</i>
`;
  }

  // DEFAULT
  return `
<b>Good question.</b><br><br>
Ask using a concept from the training and I’ll break it down.<br><br>
<i>Think about what problem you're actually trying to solve.</i>
`;
}

// ---------- MAIN ----------
function handleInput(){
  const text = input.value.trim();
  if(!text) return;

  addMessage(text,"user");

  setTimeout(()=>{
    addMessage(respond(text),"ai");
  },250);

  input.value="";
}

sendBtn.onclick = handleInput;
input.addEventListener("keypress",(e)=>{
  if(e.key==="Enter") handleInput();
});

// ---------- START ----------
addMessage(`
Ask me anything from the training.<br><br>
<b>I will correct your thinking — not just answer you.</b>
`);
