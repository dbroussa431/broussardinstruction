// ===============================
// FIREBASE INIT (make sure config exists in HTML)
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===============================
// HELPERS
// ===============================
function formatDate(val) {
  if (!val) return "None";

  try {
    if (val.toDate) return val.toDate().toLocaleString();
    return new Date(val).toLocaleString();
  } catch {
    return "Invalid Date";
  }
}

function renderEmailStatus(type, time) {
  if (!type || type === "None") {
    return `<span class="badge badge-none">None</span>`;
  }

  return `
    <div>
      <span class="badge badge-${type}">${type}</span>
      <div style="font-size:11px;color:#666;">
        ${formatDate(time)}
      </div>
    </div>
  `;
}

function mapStudent(docSnap) {
  const data = docSnap.data() || {};

  return {
    id: docSnap.id,
    name: data.name || "—",
    email: data.email || "—",
    course: "Louisiana Concealed Carry",
    price: data.price || 0,

    paymentMethod: data.paymentMethod || "—",
    paymentStatus: data.paymentStatus || "—",
    portalStatus: "active",

    accessCode: data.accessCode || "—",

    // FIXED DATA MAPPING
    currentLesson:
      data.progress ||
      (Array.isArray(data.completedLessons)
        ? data.completedLessons.length
        : 0),

    currentStage: data.stage || "—",
    attempts: data.attempts || 0,
    totalTime: data.totalTime || "0m 0s",
    progress: data.progress || 0,

    finalEvaluation: data.finalEvaluation || "—",

    lastActivity: data.lastLoginAt || null,

    emailType: data.lastEmailType || "None",
    emailSentAt: data.lastEmailSentAt || null
  };
}

// ===============================
// LOAD DATA
// ===============================
async function loadStudents() {
  const tableBody = document.getElementById("studentTableBody");
  tableBody.innerHTML = "";

  const snapshot = await getDocs(collection(db, "portalStudents"));

  let totalStudents = 0;
  let paidStudents = 0;
  let revenue = 0;

  snapshot.forEach((docSnap) => {
    const student = mapStudent(docSnap);

    totalStudents++;

    if (student.paymentStatus === "paid") {
      paidStudents++;
      revenue += student.price || 0;
    }

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${student.name}</td>
      <td>${student.email}</td>
      <td>${student.course}</td>
      <td>$${student.price}</td>

      <td>${student.paymentMethod}</td>
      <td>${student.paymentStatus}</td>
      <td>${student.portalStatus}</td>

      <td>${student.accessCode}</td>

      <td>${student.currentLesson}</td>
      <td>${student.currentStage}</td>

      <td>${student.attempts}</td>
      <td>${student.totalTime}</td>

      <td>${student.progress}</td>

      <td>${student.finalEvaluation}</td>

      <td>${formatDate(student.lastActivity)}</td>

      <td>${renderEmailStatus(student.emailType, student.emailSentAt)}</td>

      <td>
        <button class="edit-btn" data-id="${student.id}">Edit</button>
        <button class="delete-btn" data-id="${student.id}">Delete</button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  // ===============================
  // UPDATE DASHBOARD STATS
  // ===============================
  document.getElementById("totalStudents").innerText = totalStudents;
  document.getElementById("paidStudents").innerText = paidStudents;
  document.getElementById("revenueCollected").innerText = `$${revenue}`;

  attachEvents();
}

// ===============================
// BUTTON EVENTS
// ===============================
function attachEvents() {
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;

      if (!confirm("Delete this student?")) return;

      await deleteDoc(doc(db, "portalStudents", id));
      loadStudents();
    });
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      alert("Edit coming soon for ID: " + id);
    });
  });
}

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  loadStudents();
});
