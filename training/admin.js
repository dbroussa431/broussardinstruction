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

const body = document.getElementById("studentTableBody");

// =====================
// DATE FIXES (CRITICAL)
// =====================
function safeDate(value) {
  if (!value) return null;

  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d) ? null : d;
  }

  if (value?.toDate) {
    try { return value.toDate(); } catch { return null; }
  }

  return null;
}

function formatNiceDate(value) {
  const date = safeDate(value);
  if (!date) return "—";

  const diff = Date.now() - date.getTime();

  const min = Math.floor(diff / 60000);
  const hr = Math.floor(diff / 3600000);
  const day = Math.floor(diff / 86400000);

  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  if (hr < 24) return `${hr} hr ago`;
  if (day < 7) return `${day} day(s) ago`;

  return date.toLocaleString();
}

// =====================
// CORE DATA LOGIC
// =====================
function lastActivity(student) {
  const timestamps = Object.values(student.progress || {})
    .map(p => safeDate(p?.lastActivityAt))
    .filter(Boolean)
    .sort((a,b)=>a-b);

  return timestamps.pop()
    || safeDate(student.lastLoginAt)
    || safeDate(student.updatedAt)
    || safeDate(student.createdAt)
    || null;
}

function totalAttempts(student) {
  return Object.values(student.progress || {})
    .reduce((sum, p) => sum + (p?.attempts || 0), 0);
}

function totalQuizTime(student) {
  return Object.values(student.progress || {})
    .reduce((sum, p) => sum + (p?.totalQuizTimeSeconds || 0), 0);
}

function formatTime(sec = 0) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

// =====================
// EMAIL TRACKING
// =====================
function emailStatus(student) {
  if (!student.lastEmailType) {
    return `<span class="status-pill">None</span>`;
  }

  return `
    <span class="status-pill">
      ${student.lastEmailType}
    </span>
    <br>
    <small>${formatNiceDate(student.lastEmailSentAt)}</small>
  `;
}

// =====================
// RENDER
// =====================
function renderRows() {
  body.innerHTML = studentRows.map(s => `
    <tr>
      <td>${s.name || "—"}</td>
      <td>${s.email || "—"}</td>
      <td>${s.course || ""}</td>
      <td>${s.price || 0}</td>
      <td>${s.paymentMethod || ""}</td>
      <td>${s.paymentStatus || ""}</td>
      <td>${s.status || ""}</td>
      <td>${s.accessCode || ""}</td>

      <td>${s.currentLesson || "—"}</td>
      <td>${s.currentStage || "—"}</td>

      <td>${totalAttempts(s)}</td>
      <td>${formatTime(totalQuizTime(s))}</td>

      <td>${s.progressLabel || "—"}</td>

      <td>${formatNiceDate(lastActivity(s))}</td>

      <td>${emailStatus(s)}</td>

      <td>
        <button onclick="editStudent('${s.id}')">Edit</button>
        <button onclick="deleteStudent('${s.id}')">Delete</button>
      </td>
    </tr>
  `).join("");
}

// =====================
// LOAD DATA (SAFE)
// =====================
async function loadAdminData() {
  try {
    const snap = await getDocs(collection(db, "portalStudents"));

    studentRows = snap.docs.map(docSnap => {
      const d = docSnap.data() || {};

      return {
        id: docSnap.id,
        name: d.name || "",
        email: d.email || "",
        course: d.course || "",
        price: d.price || 0,
        paymentMethod: d.paymentMethod || "",
        paymentStatus: d.paymentStatus || "",
        status: d.status || "active",
        accessCode: d.accessCode || "",

        progress: d.progress || {},

        lastLoginAt: d.lastLoginAt || null,
        updatedAt: d.updatedAt || null,
        createdAt: d.createdAt || null,

        // EMAIL TRACKING
        lastEmailType: d.lastEmailType || null,
        lastEmailSentAt: d.lastEmailSentAt || null
      };
    });

    renderRows();

  } catch (err) {
    console.error("LOAD ERROR:", err);
    body.innerHTML = `<tr><td colspan="17">Error loading data</td></tr>`;
  }
}

// =====================
loadAdminData();
