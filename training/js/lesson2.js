import { completeLesson } from './lesson-common.js';

document.getElementById("quiz").onsubmit = (e) => {
  e.preventDefault();
  const answer = document.querySelector('input[name="q1"]:checked')?.value;

  if (answer === "b") {
    alert("PASS");
  } else {
    alert("FAIL");
    return;
  }
};

document.getElementById("complete").onclick = () => {
  completeLesson(2);
};
