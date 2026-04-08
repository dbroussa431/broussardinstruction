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
let editingId = null;

const body = document.getElementById("studentTableBody");
const addStudentBtn = document.getElementById("addStudentBtn");
const refreshBtn = document.getElementById("refreshBtn");
const exportBtn = document.getElementById("exportBtn");
const modal = document.getElementById("studentModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const regenCodeBtn = document.getElementById("regenCodeBtn");
const formWrap = document.getElementById("studentFormWrap");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const searchInput = document.getElementById("searchInput");
const paymentFilter = document.getElementById("paymentFilter");
const portalFilter = document.getElementById("portalFilter");
const sortBy = document.getElementById("sortBy");
const applyFiltersBtn = document.getElementById("applyFiltersBtn");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");

const fields = {
  name: document.getElementById("studentName"),
  email: document.getElementById("studentEmail"),
  course: document.getElementById("studentCourse"),
  price: document.getElementById("studentPrice"),
  paymentMethod: document.getElementById("studentPaymentMethod"),
  paymentStatus: document.getElementById("studentPaymentStatus"),
  portalStatus: document.getElementById("studentPortalStatus"),
  tier: document.getElementById("studentTier"),
  accessCode: document.getElementById("generatedCode")
};

function normalizeAccessCode(value) {
  return String(value || "").trim().toUpperCase().replace(/\s+/g, "");
}

function normalizePaymentStatus(student) {
  const status = String(student.paymentStatus || "").trim().toLowerCase();
  if (status === "paid" || status === "pending" || status === "waived") return status;
  if (student.paid === true) return "paid";
  if (String(student.paymentMethod || "").trim().toLowerCase() === "waived") return "waived";
  return "pending";
}

function isPaidStudent(student) {
  return normalizePaymentStatus(student) === "paid" || student.paid === true;
}

function revenueForStudent(student) {
  if (!isPaidStudent(student)) return 0;
  const price = Number(student.price || 0);
  return Number.isFinite(price) ? price : 0;
}

function generateAccessCode(tier = "FREE") {
  const cleanTier = String(tier || "FREE").trim().toUpperCase();
  if (cleanTier === "FULL") return `BSA-FULL-${Math.floor(1000 + Math.random() * 9000)}`;
  if (cleanTier === "DISC") return `BSA-DISC-${Math.floor(1000 + Math.random() * 9000)}`;
  return `BSA-FREE-${Math.floor(1000 + Math.random() * 9000)}`;
}

function formatSeconds(totalSeconds = 0) {
  const safe = Math.max(0, Number(totalSeconds || 0));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}m ${seconds}s`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getTotalLessons() {
  return (window.LESSONS || []).length || 10;
}

function getFinalEvaluationProgress(student) {
  const finalLessonId = 10;
  const finalProgress = student?.progress?.[finalLessonId] || student?.progress?.["10"] || null;

  if (!finalProgress) {
    return {
      exists: false,
      score: 0,
      quizPassed: false,
      criticalFail: false,
      label: "—",
      className: ""
    };
  }

  const score = Number(finalProgress.quizScore || 0);
  const quizPassed = !!finalProgress.quizPassed;
  const criticalFail = !!finalProgress.criticalFail;

  if (criticalFail) {
    return {
      exists: true,
      score,
      quizPassed,
      criticalFail,
      label: "CRITICAL FAIL",
      className: "locked"
    };
  }

  if (quizPassed || score >= 80) {
    return {
      exists: true,
      score,
      quizPassed: true,
      criticalFail: false,
      label: `PASS ${score}%`,
      className: "active"
    };
  }

  return {
    exists: true,
    score,
    quizPassed: false,
    criticalFail: false,
    label: `FAIL ${score}%`,
    className: "pending"
  };
}

function stageLabel(student) {
  const progress = student.progress || {};
  const completed = Array.isArray(student.completedLessons) ? student.completedLessons.length : 0;
  const total = getTotalLessons();
  const finalEval = getFinalEvaluationProgress(student);

  if (finalEval.criticalFail) return "Critical Fail";
  if (completed >= total) return "Completed";
  if (finalEval.exists && !finalEval.quizPassed) return "Final Evaluation Retake";
  if (Object.values(progress).some((p) => p?.quizPassed)) return "In Progress";
  if (Object.values(progress).some((p) => p?.scenarioCompleted)) return "Ready for Quiz";
  if (Object.values(progress).some((p) => p?.contentViewed)) return "Scenario Review";

  return "Not Started";
}

function currentLessonLabel(student) {
  const progress = student.progress || {};
  const visited = Math.max(0, ...Object.values(progress).map((p) => Number(p?.lastLessonVisited || 0)));
  const completed = Array.isArray(student.completedLessons) ? student.completedLessons.length : 0;
  const total = getTotalLessons();
  const current = visited || (completed + 1);
  return current > total ? "Complete" : `Lesson ${current}`;
}

function progressLabel(student) {
  const total = getTotalLessons();
  const completed = Array.isArray(student.completedLessons) ? student.completedLessons.length : 0;
  const finalEval = getFinalEvaluationProgress(student);

  return finalEval.exists
    ? `${completed} / ${total} • ${finalEval.label}`
    : `${completed} / ${total}`;
}

function totalAttempts(student) {
  return Object.values(student.progress || {}).reduce((sum, p) => sum + Number(p?.attempts || 0), 0);
}

function totalQuizTime(student) {
  return Object.values(student.progress || {}).reduce((sum, p) => sum + Number(p?.totalQuizTimeSeconds || 0), 0);
}

function lastActivity(student) {
  const timestamps = Object.values(student.progress || {})
    .map((p) => p?.lastActivityAt)
    .filter(Boolean)
    .sort();
  return timestamps.pop() || student.lastLoginAt || student.updatedAt || "—";
}

function formatFirestoreDate(value) {
  if (!value) return "—";
  if (typeof value === "string") return value;
  if (value?.toDate && typeof value.toDate === "function") {
    try {
      return value.toDate().toLocaleString();
    } catch {
      return "—";
    }
  }
  return "—";
}

function paymentBadge(status) {
  const safe = String(status || "pending").toLowerCase();
  return `<span class="status-pill ${escapeHtml(safe)}">${escapeHtml(safe)}</span>`;
}

function portalBadge(status) {
  const safe = String(status || "active").toLowerCase();
  return `<span class="status-pill ${escapeHtml(safe)}">${escapeHtml(safe)}</span>`;
}

function finalEvalBadge(student) {
  const finalEval = getFinalEvaluationProgress(student);
  if (!finalEval.exists) return `<span class="status-pill">—</span>`;
  return `<span class="status-pill ${escapeHtml(finalEval.className)}">${escapeHtml(finalEval.label)}</span>`;
}

function showModalMessage(message, kind = "bad") {
  modalMessage.textContent = message;
  modalMessage.classList.remove("hidden", "ok", "bad");
  modalMessage.classList.add(kind);
}

function clearModalMessage() {
  modalMessage.textContent = "";
  modalMessage.classList.add("hidden");
  modalMessage.classList.remove("ok", "bad");
}

function resetForm() {
  editingId = null;
  modalTitle.textContent = "Add Student";
  fields.name.value = "";
  fields.email.value = "";
  fields.course.value = "Louisiana Concealed Carry";
  fields.price.value = "150";
  fields.paymentMethod.value = "PayPal";
  fields.paymentStatus.value = "paid";
  fields.portalStatus.value = "active";
  fields.tier.value = "FULL";
  fields.accessCode.value = generateAccessCode(fields.tier.value);
  clearModalMessage();
}

function fillForm(student) {
  editingId = student.id;
  modalTitle.textContent = "Edit Student";
  fields.name.value = student.name || "";
  fields.email.value = student.email || "";
  fields.course.value = student.course || "Louisiana Concealed Carry";
  fields.price.value = String(Number(student.price || 0));
  fields.paymentMethod.value = student.paymentMethod || "PayPal";
  fields.paymentStatus.value = normalizePaymentStatus(student);
  fields.portalStatus.value = student.status || "active";
  fields.tier.value = String(student.tier || "FREE").toUpperCase();
  fields.accessCode.value = normalizeAccessCode(student.accessCode || generateAccessCode(fields.tier.value));
  clearModalMessage();
}

function openModalForAdd() {
  resetForm();
  modal.showModal();
}

function openModalForEdit(studentId) {
  const student = studentRows.find((s) => s.id === studentId);
  if (!student) return;
  fillForm(student);
  modal.showModal();
}

function closeModal() {
  modal.close();
}

function applyStats(rows) {
  const totalStudents = rows.length;
  const pending = rows.filter((s) => normalizePaymentStatus(s) === "pending").length;
  const paid = rows.filter((s) => isPaidStudent(s)).length;
  const revenue = rows.reduce((sum, s) => sum + revenueForStudent(s), 0);

  document.getElementById("statTotalStudents").textContent = totalStudents;
  document.getElementById("statPendingPayments").textContent = pending;
  document.getElementById("statPaidStudents").textContent = paid;
  document.getElementById("statRevenue").textContent =
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(revenue);
}

function filteredRows() {
  const term = searchInput.value.trim().toLowerCase();
  let rows = [...studentRows];

  if (term) {
    rows = rows.filter((s) =>
      [s.name, s.email, s.accessCode].join(" ").toLowerCase().includes(term)
    );
  }

  if (paymentFilter.value !== "all") {
    rows = rows.filter((s) => normalizePaymentStatus(s) === paymentFilter.value);
  }

  if (portalFilter.value !== "all") {
    rows = rows.filter((s) => String(s.status || "") === portalFilter.value);
  }

  if (sortBy.value === "name") {
    rows.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  }

  if (sortBy.value === "progress") {
    rows.sort((a, b) => {
      const aCount = Array.isArray(a.completedLessons) ? a.completedLessons.length : 0;
      const bCount = Array.isArray(b.completedLessons) ? b.completedLessons.length : 0;
      return bCount - aCount;
    });
  }

  if (sortBy.value === "newest") {
    rows.sort((a, b) =>
      String(b.createdAt || b.updatedAt || "").localeCompare(String(a.createdAt || a.updatedAt || ""))
    );
  }

  return rows;
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(String(value || ""));
  } catch (err) {
    console.error("Clipboard copy failed:", err);
  }
}

async function regenCode(studentId) {
  const student = studentRows.find((s) => s.id === studentId);
  if (!student) return;

  const newCode = generateAccessCode(student.tier || "FREE");

  try {
    await updateDoc(doc(db, "portalStudents", studentId), {
      accessCode: newCode,
      updatedAt: serverTimestamp()
    });
    await loadAdminData();
  } catch (err) {
    console.error("Regenerate code failed:", err);
    alert("Could not regenerate code.");
  }
}

async function togglePortalStatus(studentId) {
  const student = studentRows.find((s) => s.id === studentId);
  if (!student) return;

  const nextStatus = String(student.status || "active") === "active" ? "locked" : "active";

  try {
    await updateDoc(doc(db, "portalStudents", studentId), {
      status: nextStatus,
      updatedAt: serverTimestamp()
    });
    await loadAdminData();
  } catch (err) {
    console.error("Status update failed:", err);
    alert("Could not update portal status.");
  }
}

async function removeStudent(studentId) {
  const student = studentRows.find((s) => s.id === studentId);
  if (!student) return;

  const confirmed = window.confirm(`Delete ${student.name || "this student"}? This cannot be undone.`);
  if (!confirmed) return;

  try {
    await deleteDoc(doc(db, "portalStudents", studentId));
    await loadAdminData();
  } catch (err) {
    console.error("Delete student failed:", err);
    alert("Could not delete student.");
  }
}

function exportCsv() {
  const rows = filteredRows();
  const header = [
    "Name",
    "Email",
    "Course",
    "Price",
    "Payment Method",
    "Payment Status",
    "Portal Status",
    "Access Code",
    "Current Lesson",
    "Current Stage",
    "Attempts",
    "Total Quiz Time",
    "Progress",
    "Final Evaluation",
    "Last Activity"
  ];

  const lines = rows.map((s) => {
    const finalEval = getFinalEvaluationProgress(s);
    return ([
      s.name || "",
      s.email || "",
      s.course || "",
      s.price || "",
      s.paymentMethod || "",
      normalizePaymentStatus(s),
      s.status || "",
      s.accessCode || "",
      currentLessonLabel(s),
      stageLabel(s),
      totalAttempts(s),
      formatSeconds(totalQuizTime(s)),
      progressLabel(s),
      finalEval.label,
      formatFirestoreDate(lastActivity(s))
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
  });

  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "bsa_admin_export.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function renderRows() {
  const rows = filteredRows();
  applyStats(studentRows);

  body.innerHTML = rows.length ? rows.map((student) => {
    const payStatus = normalizePaymentStatus(student);

    return `
      <tr>
        <td>${escapeHtml(student.name || "—")}</td>
        <td class="cell-wrap">${escapeHtml(student.email || "—")}</td>
        <td>${escapeHtml(student.course || "Louisiana Concealed Carry")}</td>
        <td>${escapeHtml(student.price || 0)}</td>
        <td>${escapeHtml(student.paymentMethod || "—")}</td>
        <td>${paymentBadge(payStatus)}</td>
        <td>${portalBadge(student.status || "active")}</td>
        <td class="cell-wrap">${escapeHtml(student.accessCode || "—")}</td>
        <td>${escapeHtml(currentLessonLabel(student))}</td>
        <td>
          ${escapeHtml(stageLabel(student))}
          <div style="margin-top:6px;">${finalEvalBadge(student)}</div>
        </td>
        <td>${totalAttempts(student)}</td>
        <td>${escapeHtml(formatSeconds(totalQuizTime(student)))}</td>
        <td>${escapeHtml(progressLabel(student))}</td>
        <td class="cell-wrap">${escapeHtml(formatFirestoreDate(lastActivity(student)))}</td>
        <td>
          <div class="mini-actions">
            <button class="btn btn-outline" type="button" data-copy="${escapeHtml(student.accessCode || "")}">Copy</button>
            <button class="btn btn-outline" type="button" data-edit="${student.id}">Edit</button>
            <button class="btn btn-outline" type="button" data-regen="${student.id}">Regen</button>
            <button class="btn btn-outline" type="button" data-toggle="${student.id}">
              ${String(student.status || "active") === "active" ? "Lock" : "Unlock"}
            </button>
            <button class="btn btn-danger" type="button" data-delete="${student.id}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join("") : `<tr><td colspan="15">No student records found.</td></tr>`;
}

async function loadAdminData() {
  body.innerHTML = `<tr><td colspan="15">Loading student records...</td></tr>`;

  try {
    const snap = await getDocs(collection(db, "portalStudents"));
    studentRows = snap.docs.map((docSnap) => {
      const raw = docSnap.data() || {};
      return {
        id: docSnap.id,
        name: raw.name || "Student",
        email: raw.email || "",
        course: raw.course || "Louisiana Concealed Carry",
        price: Number(raw.price || 0),
        paymentMethod: raw.paymentMethod || "PayPal",
        paymentStatus: raw.paymentStatus || "",
        paid: raw.paid === true,
        status: raw.status || "active",
        accessCode: normalizeAccessCode(raw.accessCode || ""),
        tier: String(raw.tier || "FREE").toUpperCase(),
        progress: raw.progress || {},
        completedLessons: Array.isArray(raw.completedLessons) ? raw.completedLessons : [],
        createdAt: raw.createdAt || "",
        updatedAt: raw.updatedAt || "",
        lastLoginAt: raw.lastLoginAt || ""
      };
    });

    renderRows();
  } catch (err) {
    console.error("ADMIN LOAD ERROR:", err);
    body.innerHTML = `<tr><td colspan="15">Error loading student records.</td></tr>`;
  }
}

async function saveStudent(event) {
  event.preventDefault();
  clearModalMessage();

  const name = fields.name.value.trim();
  const email = fields.email.value.trim().toLowerCase();
  const course = fields.course.value.trim();
  const price = Number(fields.price.value || 0);
  const paymentMethod = fields.paymentMethod.value;
  const paymentStatus = fields.paymentStatus.value;
  const portalStatus = fields.portalStatus.value;
  const tier = fields.tier.value;
  const accessCode = normalizeAccessCode(fields.accessCode.value || generateAccessCode(tier));

  if (!name) {
    showModalMessage("Student name is required.", "bad");
    return;
  }

  const payload = {
    name,
    email,
    course,
    price,
    paymentMethod,
    paymentStatus,
    tier,
    status: portalStatus,
    accessCode,
    paid: paymentStatus === "paid",
    updatedAt: serverTimestamp()
  };

  try {
    if (editingId) {
      await updateDoc(doc(db, "portalStudents", editingId), payload);
      showModalMessage("Student updated successfully.", "ok");
    } else {
      await addDoc(collection(db, "portalStudents"), {
        ...payload,
        progress: {},
        completedLessons: [],
        createdAt: new Date().toISOString()
      });
      showModalMessage("Student saved successfully.", "ok");
    }

    await loadAdminData();
    setTimeout(() => modal.close(), 500);
  } catch (err) {
    console.error("Save student failed:", err);
    showModalMessage("Could not save student record.", "bad");
  }
}

addStudentBtn.addEventListener("click", openModalForAdd);
refreshBtn.addEventListener("click", loadAdminData);
exportBtn.addEventListener("click", exportCsv);

regenCodeBtn.addEventListener("click", () => {
  fields.accessCode.value = generateAccessCode(fields.tier.value);
});

fields.tier.addEventListener("change", () => {
  fields.accessCode.value = generateAccessCode(fields.tier.value);
});

closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);
formWrap.addEventListener("submit", saveStudent);

applyFiltersBtn.addEventListener("click", renderRows);
clearFiltersBtn.addEventListener("click", () => {
  searchInput.value = "";
  paymentFilter.value = "all";
  portalFilter.value = "all";
  sortBy.value = "newest";
  renderRows();
});

searchInput.addEventListener("input", renderRows);
paymentFilter.addEventListener("change", renderRows);
portalFilter.addEventListener("change", renderRows);
sortBy.addEventListener("change", renderRows);

body.addEventListener("click", async (event) => {
  const copyBtn = event.target.closest("[data-copy]");
  const editBtn = event.target.closest("[data-edit]");
  const regenBtn = event.target.closest("[data-regen]");
  const toggleBtn = event.target.closest("[data-toggle]");
  const deleteBtn = event.target.closest("[data-delete]");

  if (copyBtn) {
    await copyText(copyBtn.getAttribute("data-copy"));
    return;
  }

  if (editBtn) {
    openModalForEdit(editBtn.getAttribute("data-edit"));
    return;
  }

  if (regenBtn) {
    await regenCode(regenBtn.getAttribute("data-regen"));
    return;
  }

  if (toggleBtn) {
    await togglePortalStatus(toggleBtn.getAttribute("data-toggle"));
    return;
  }

  if (deleteBtn) {
    await removeStudent(deleteBtn.getAttribute("data-delete"));
  }
});

loadAdminData();
