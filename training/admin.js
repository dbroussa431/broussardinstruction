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

// =============================
// SAFE DATE HANDLING (FIXES INVALID DATE)
// =============================
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

// =============================
// CORE CALCULATIONS
// =============================
function totalAttempts(student) {
  return Object.values(student.progress || {})
    .reduce((sum, p) => sum + Number(p?.attempts || 0), 0);
}

function totalQuizTime(student) {
  return Object.values(student.progress || {})
    .reduce((sum, p) => sum + Number(p?.totalQuizTimeSeconds || 0), 0);
}

function formatSeconds(sec = 0) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

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

// =============================
// EMAIL STATUS COLUMN
// =============================
function emailStatus(student) {
  if (!student.lastEmailType) {
    return `<span class="status-pill none">None</span>`;
  }

  let cls = "pending";
  if (student.lastEmailType === "14-day") cls = "warning";
  if (student.lastEmailType === "30-day") cls = "danger";

  return `
    <div>
      <span class="status-pill ${cls}">
        ${student.lastEmailType}
      </span>
      <br>
      <small>${formatNiceDate(student.lastEmailSentAt)}</small>
    </div>
  `;
}

// =============================
// RENDER TABLE (FULL)
// =============================
function renderRows() {
  const body = document.getElementById("studentTableBody");

  body.innerHTML = studentRows.length
    ? studentRows.map(student => `
      <tr>
        <td>${student.name || "—"}</td>
        <td class="cell-wrap">${student.email || "—"}</td>
        <td>${student.course || ""}</td>
        <td>${student.price || 0}</td>
        <td>${student.paymentMethod || ""}</td>
        <td>${student.paymentStatus || ""}</td>
        <td>${student.status || ""}</td>
        <td>${student.accessCode || ""}</td>

        <td>${student.currentLesson || "—"}</td>
        <td>${student.currentStage || "—"}</td>

        <td>${totalAttempts(student)}</td>
        <td>${formatSeconds(totalQuizTime(student))}</td>

        <td>${student.progressLabel || "—"}</td>

        <td>${formatNiceDate(lastActivity(student))}</td>

        <td>${emailStatus(student)}</td>

        <td>
          <div class="mini-actions">
            <button onclick="editStudent('${student.id}')">Edit</button>
            <button onclick="deleteStudent('${student.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join("")
    : `<tr><td colspan="17">No student records found.</td></tr>`;
}

// =============================
// LOAD DATA (SAFE + COMPLETE)
// =============================
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
        price: Number(d.price || 0),
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
    console.error("ADMIN LOAD ERROR:", err);
    document.getElementById("studentTableBody").innerHTML =
      `<tr><td colspan="17">Error loading student records.</td></tr>`;
  }
}

// =============================
// DELETE (kept simple)
// =============================
window.deleteStudent = async function(id) {
  if (!confirm("Delete this student?")) return;

  await deleteDoc(doc(db, "portalStudents", id));
  loadAdminData();
};

// =============================
loadAdminData();
