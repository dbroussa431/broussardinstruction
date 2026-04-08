import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const body = document.getElementById("tableBody");

document.getElementById("logoutBtn").onclick = () => {
  localStorage.removeItem("bsa_admin_auth");
  window.location.href = "admin-login.html";
};

function getProgress(student) {
  return student.completedLessons?.length || 0;
}

function getAttempts(student) {
  return Object.values(student.progress || {})
    .reduce((a, b) => a + (b.attempts || 0), 0);
}

function getStage(student) {
  const p = student.progress || {};

  if (student.completedLessons?.length === 10) return "Complete";
  if (Object.values(p).some(x => x.quizPassed)) return "In Progress";
  if (Object.values(p).some(x => x.scenarioCompleted)) return "Quiz Ready";
  if (Object.values(p).some(x => x.contentViewed)) return "Scenario";
  return "Not Started";
}

function getFinal(student) {
  const final = student.progress?.["10"];

  if (!final) return "—";

  if (final.criticalFail) return "CRITICAL FAIL";
  if (final.quizScore >= 80) return "PASS";
  return "FAIL";
}

async function load() {

  const snap = await getDocs(collection(db, "portalStudents"));

  let total = 0;
  let pending = 0;
  let passedFinal = 0;
  let critical = 0;

  let html = "";

  snap.forEach(docSnap => {

    const s = docSnap.data();
    const id = docSnap.id;

    total++;

    if (s.paymentStatus !== "paid") pending++;

    const final = s.progress?.["10"];

    if (final?.criticalFail) critical++;
    if (final?.quizScore >= 80 && !final?.criticalFail) passedFinal++;

    html += `
      <tr>
        <td>${s.name}</td>
        <td>${s.email}</td>
        <td>${getProgress(s)}/10</td>
        <td>${getStage(s)}</td>
        <td>${getAttempts(s)}</td>
        <td>${getFinal(s)}</td>
        <td>
          <button onclick="lock('${id}')">Lock</button>
          <button onclick="unlock('${id}')">Unlock</button>
          <button onclick="del('${id}')">Delete</button>
        </td>
      </tr>
    `;
  });

  body.innerHTML = html;

  document.getElementById("statTotal").textContent = total;
  document.getElementById("statPending").textContent = pending;
  document.getElementById("statPassedFinal").textContent = passedFinal;
  document.getElementById("statCritical").textContent = critical;
}

// ACTIONS
window.lock = async (id) => {
  await updateDoc(doc(db, "portalStudents", id), { status: "locked" });
  load();
};

window.unlock = async (id) => {
  await updateDoc(doc(db, "portalStudents", id), { status: "active" });
  load();
};

window.del = async (id) => {
  if (!confirm("Delete student?")) return;
  await deleteDoc(doc(db, "portalStudents", id));
  load();
};

load();
