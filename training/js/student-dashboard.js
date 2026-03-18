import { db } from './firebase-config.js';
import {
  doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const studentId = localStorage.getItem("studentId");

const studentRef = doc(db, "students", studentId);
const progressRef = doc(db, "progress", studentId);

const studentSnap = await getDoc(studentRef);
const progressSnap = await getDoc(progressRef);

const student = studentSnap.data();
const progress = progressSnap.exists() ? progressSnap.data() : {};

document.getElementById("info").innerHTML = `
Name: ${student.name}<br>
Progress: ${(progress.completedLessons || []).length}/8
`;

let lessonsHTML = "";

for (let i = 1; i <= 8; i++) {
  const unlocked = i === 1 || (progress.completedLessons || []).includes(i - 1);

  lessonsHTML += `
    <div>
      Lesson ${i}
      ${unlocked ? `<button onclick="go(${i})">Open</button>` : "Locked"}
    </div>
  `;
}

document.getElementById("lessons").innerHTML = lessonsHTML;

window.go = (num) => {
  window.location.href = `lessons/lesson${num}.html`;
};
🔥 6. LESSON ENGINE (SHARED)

📁 /training/js/lesson-common.js

import { db } from './firebase-config.js';
import {
  doc, getDoc, setDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function completeLesson(lessonNumber) {
  const studentId = localStorage.getItem("studentId");

  const ref = doc(db, "progress", studentId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      completedLessons: [lessonNumber]
    });
  } else {
    const data = snap.data();
    const updated = [...new Set([...(data.completedLessons || []), lessonNumber])];

    await updateDoc(ref, {
      completedLessons: updated
    });
  }

  alert("Lesson Completed");
  window.location.href = "../dashboard.html";
}
