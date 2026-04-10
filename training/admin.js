import { db } from "./firebase-config.js?v=5";
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
let editingId = null;

const body = document.getElementById("studentTableBody");

// =============================
// 🔥 TIME + ACTIVITY FORMATTING
// =============================
function formatFirestoreDate(value) {
  if (!value) return "—";

  let date;

  if (typeof value === "string") {
    date = new Date(value);
  } else if (value?.toDate) {
    date = value.toDate();
  } else {
    return "—";
  }

  const now = new Date();
  const diff = now - date;

  const min = Math.floor(diff / 60000);
  const hr = Math.floor(diff / 3600000);
  const day = Math.floor(diff / 86400000);

  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  if (hr < 24) return `${hr} hr ago`;
  if (day < 7) return `${day} day(s) ago`;

  return date.toLocaleString();
}

// =============================
// 🔥 EMAIL STATUS LOGIC
// =============================
function emailStatusLabel(student) {
  if (!student.lastEmailType) {
    return `<span class="status-pill">None</span>`;
  }

  let className = "";
  if (student.lastEmailType === "7-day") className = "pending";
  if (student.lastEmailType === "14-day") className = "warning";
  if (student.lastEmailType === "30-day") className = "danger";

  return `
    <span class="status-pill ${className}">
      ${student.lastEmailType}
    </span>
    <br>
    <small>${formatFirestoreDate(student.lastEmailSentAt)}</small>
  `;
}

// =============================
// 🔥 CORE HELPERS
// =============================
function normalizePaymentStatus(student) {
  return String(student.paymentStatus || "pending").toLowerCase();
}

function totalAttempts(student) {
  return Object.values(student.progress || {}).reduce(
    (sum, p) => sum + Number(p?.attempts || 0),
    0
  );
}

function totalQuizTime(student) {
  return Object.values(student.progress || {}).reduce(
    (sum, p) => sum + Number(p?.totalQuizTimeSeconds || 0),
    0
  );
}

function formatSeconds(seconds = 0) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function lastActivity(student) {
  const timestamps = Object.values(student.progress || {})
    .map(p => p?.lastActivityAt)
    .filter(Boolean)
    .sort();

  return timestamps.pop() || student.lastLoginAt || "—";
}

// =============================
// 🔥 RENDER TABLE
// =============================
function renderRows() {
  body.innerHTML = studentRows.length
    ? studentRows.map(student => `
      <tr>
        <td>${student.name}</td>
        <td>${student.email}</td>
        <td>${student.course}</td>
        <td>${student.price}</td>
        <td>${student.paymentMethod}</td>
        <td>${normalizePaymentStatus(student)}</td>
        <td>${student.status}</td>
        <td>${student.accessCode}</td>

        <td>${totalAttempts(student)}</td>
        <td>${formatSeconds(totalQuizTime(student))}</td>

        <td>${formatFirestoreDate(lastActivity(student))}</td>

        <td>${emailStatusLabel(student)}</td>

        <td>
          <button data-edit="${student.id}">Edit</button>
          <button data-delete="${student.id}">Delete</button>
        </td>
      </tr>
    `).join("")
    : `<tr><td colspan="12">No data</td></tr>`;
}

// =============================
// 🔥 LOAD DATA
// =============================
async function loadAdminData() {
  const snap = await getDocs(collection(db, "portalStudents"));

  studentRows = snap.docs.map(docSnap => {
    const raw = docSnap.data();

    return {
      id: docSnap.id,
      ...raw
    };
  });

  renderRows();
}

// =============================
// 🔥 DELETE
// =============================
body.addEventListener("click", async (e) => {
  if (e.target.dataset.delete) {
    await deleteDoc(doc(db, "portalStudents", e.target.dataset.delete));
    loadAdminData();
  }
});

// =============================
loadAdminData();
