// ==============================
// FIREBASE IMPORT
// ==============================
import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// ==============================
// GLOBAL STATE
// ==============================
let students = [];

// ==============================
// INIT
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  loadStudents();

  document.getElementById("refreshBtn").addEventListener("click", loadStudents);
  document.getElementById("exportBtn").addEventListener("click", exportCSV);
  document.getElementById("addStudentBtn").addEventListener("click", openModal);
  document.getElementById("closeModalBtn").addEventListener("click", closeModal);
  document.getElementById("cancelModalBtn").addEventListener("click", closeModal);
  document.getElementById("studentFormWrap").addEventListener("submit", saveStudent);
});

// ==============================
// LOAD STUDENTS
// ==============================
async function loadStudents() {
  const tbody = document.getElementById("studentTableBody");
  tbody.innerHTML = `<tr><td colspan="16">Loading student records...</td></tr>`;

  try {
    const snapshot = await getDocs(collection(db, "portalStudents"));

    students = [];

    snapshot.forEach((docSnap) => {
      students.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    renderTable();
    updateStats();

  } catch (err) {
    console.error("LOAD ERROR:", err);
    tbody.innerHTML = `<tr><td colspan="16">Error loading data</td></tr>`;
  }
}

// ==============================
// RENDER TABLE
// ==============================
function renderTable() {
  const tbody = document.getElementById("studentTableBody");

  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="16">No students found</td></tr>`;
    return;
  }

  tbody.innerHTML = students.map(s => `
    <tr>
      <td>${s.name || "-"}</td>
      <td>${s.email || "-"}</td>
      <td>${s.course || "Louisiana Concealed Carry"}</td>
      <td>$${s.price || 0}</td>
      <td>${s.paymentMethod || "-"}</td>
      <td>${formatStatus(s.paymentStatus)}</td>
      <td>${formatStatus(s.portalStatus)}</td>
      <td>${s.accessCode || "-"}</td>
      <td>${s.currentLesson || "-"}</td>
      <td>${s.currentStage || "-"}</td>
      <td>${s.attempts || 0}</td>
      <td>${formatTime(s.totalTime)}</td>
      <td>${formatProgress(s.progress)}</td>
      <td>${formatStatus(s.finalStatus)}</td>
      <td>${formatDate(s.lastLoginAt)}</td>
      <td>
        <button onclick="deleteStudent('${s.id}')">Delete</button>
      </td>
    </tr>
  `).join("");
}

// ==============================
// STATS
// ==============================
function updateStats() {
  document.getElementById("statTotalStudents").innerText = students.length;

  const paid = students.filter(s => s.paymentStatus === "paid").length;
  const pending = students.filter(s => s.paymentStatus === "pending").length;

  const revenue = students.reduce((sum, s) => {
    return sum + (s.paymentStatus === "paid" ? (s.price || 0) : 0);
  }, 0);

  document.getElementById("statPaidStudents").innerText = paid;
  document.getElementById("statPendingPayments").innerText = pending;
  document.getElementById("statRevenue").innerText = `$${revenue}`;
}

// ==============================
// SAVE STUDENT
// ==============================
async function saveStudent(e) {
  e.preventDefault();

  const student = {
    name: document.getElementById("studentName").value,
    email: document.getElementById("studentEmail").value,
    course: document.getElementById("studentCourse").value,
    price: Number(document.getElementById("studentPrice").value),
    paymentMethod: document.getElementById("studentPaymentMethod").value,
    paymentStatus: document.getElementById("studentPaymentStatus").value,
    portalStatus: document.getElementById("studentPortalStatus").value,
    accessCode: document.getElementById("generatedCode").value,
    createdAt: new Date(),
    lastLoginAt: new Date()
  };

  try {
    await addDoc(collection(db, "portalStudents"), student);
    closeModal();
    loadStudents();
  } catch (err) {
    console.error("SAVE ERROR:", err);
  }
}

// ==============================
// DELETE
// ==============================
window.deleteStudent = async function(id) {
  if (!confirm("Delete student?")) return;

  await deleteDoc(doc(db, "portalStudents", id));
  loadStudents();
};

// ==============================
// EXPORT CSV
// ==============================
function exportCSV() {
  let csv = "Name,Email,Course,Price\n";

  students.forEach(s => {
    csv += `${s.name},${s.email},${s.course},${s.price}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "students.csv";
  a.click();
}

// ==============================
// MODAL
// ==============================
function openModal() {
  document.getElementById("studentModal").showModal();
}

function closeModal() {
  document.getElementById("studentModal").close();
}

// ==============================
// FORMATTERS
// ==============================
function formatDate(ts) {
  if (!ts) return "—";

  try {
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleString();
  } catch {
    return "—";
  }
}

function formatTime(seconds) {
  if (!seconds) return "0m";

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return `${m}m ${s}s`;
}

function formatProgress(p) {
  if (!p) return "—";

  if (typeof p === "number") return `${p}/10`;

  return "—";
}

function formatStatus(s) {
  if (!s) return "None";

  return `<span class="status-pill ${s}">${s}</span>`;
}
