import { db } from "./firebase-config.js?v=4";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let studentRows = [];

const body = document.getElementById("studentTableBody");

// 🔐 LOGOUT
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.onclick = () => {
    localStorage.removeItem("bsa_admin_auth");
    window.location.href = "admin-login.html";
  };
}

// HELPERS
function normalizePaymentStatus(student) {
  const s = String(student.paymentStatus || "").toLowerCase();
  if (["paid", "pending", "waived"].includes(s)) return s;
  if (student.paid) return "paid";
  return "pending";
}

function getProgress(student) {
  return student.completedLessons?.length || 0;
}

function getAttempts(student) {
  return Object.values(student.progress || {})
    .reduce((a, b) => a + (b?.attempts || 0), 0);
}

function getStage(student) {
  const p = student.progress || {};

  if (student.completedLessons?.length === 10) return "Completed";
  if (Object.values(p).some(x => x.quizPassed)) return "In Progress";
  if (Object.values(p).some(x => x.scenarioCompleted)) return "Quiz Ready";
  if (Object.values(p).some(x => x.contentViewed)) return "Scenario";
  return "Not Started";
}

function getFinal(student) {
  const f = student.progress?.["10"];
  if (!f) return "—";
  if (f.criticalFail) return "CRITICAL FAIL";
  if (f.quizScore >= 80) return "PASS";
  return "FAIL";
}

function getRevenue(student) {
  if (normalizePaymentStatus(student) !== "paid") return 0;
  return Number(student.price || 0);
}

// LOAD
async function loadAdminData() {

  body.innerHTML = `<tr><td colspan="15">Loading...</td></tr>`;

  const snap = await getDocs(collection(db, "portalStudents"));

  let total = 0;
  let pending = 0;
  let paid = 0;
  let revenue = 0;
  let critical = 0;
  let passedFinal = 0;

  let html = "";

  snap.forEach(docSnap => {

    const s = docSnap.data();
    const id = docSnap.id;

    total++;

    const payStatus = normalizePaymentStatus(s);
    if (payStatus === "pending") pending++;
    if (payStatus === "paid") {
      paid++;
      revenue += getRevenue(s);
    }

    const final = s.progress?.["10"];
    if (final?.criticalFail) critical++;
    if (final?.quizScore >= 80 && !final?.criticalFail) passedFinal++;

    html += `
      <tr>
        <td>${s.name || "—"}</td>
        <td>${s.email || "—"}</td>
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

  body.innerHTML = html || `<tr><td colspan="15">No records</td></tr>`;

  // STATS (if exist in HTML)
  if (document.getElementById("statTotal")) {
    document.getElementById("statTotal").textContent = total;
    document.getElementById("statPending").textContent = pending;
    document.getElementById("statPassedFinal").textContent = passedFinal;
    document.getElementById("statCritical").textContent = critical;
  }
}

// ACTIONS
window.lock = async (id) => {
  await updateDoc(doc(db, "portalStudents", id), { status: "locked" });
  loadAdminData();
};

window.unlock = async (id) => {
  await updateDoc(doc(db, "portalStudents", id), { status: "active" });
  loadAdminData();
};

window.del = async (id) => {
  if (!confirm("Delete student?")) return;
  await deleteDoc(doc(db, "portalStudents", id));
  loadAdminData();
};

// INIT
loadAdminData();
