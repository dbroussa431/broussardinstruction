import { db } from "../firebase-config.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const studentsRef = collection(db, "portalStudents");

const state = {
  students: [],
  filtered: [],
  editingId: null
};

const els = {};

function cacheEls() {
  [
    "metricStudents",
    "metricStudentsSmall",
    "metricPending",
    "metricPendingSmall",
    "metricPaid",
    "metricPaidSmall",
    "metricRevenue",
    "metricRevenueSmall",
    "addStudentBtn",
    "quickAddBtn",
    "refreshBtn",
    "reloadBtn",
    "exportBtn",
    "logoutBtn",
    "searchInput",
    "searchInput2",
    "paymentFilter",
    "paymentFilter2",
    "portalFilter",
    "tierFilter",
    "sortInput",
    "sortInput2",
    "filterBtn",
    "clearFiltersBtn",
    "studentTableBody",
    "studentModalBackdrop",
    "studentForm",
    "modalTitle",
    "studentName",
    "studentEmail",
    "priceTier",
    "price",
    "paymentMethod",
    "paymentStatusSelect",
    "portalStatus",
    "progressLabel",
    "progressPercent",
    "completionDate",
    "certificateIssued",
    "courseVersion",
    "accessCode",
    "notes",
    "cancelStudentBtn",
    "saveStudentBtn"
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function generateCode(tier = "FULL") {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BSA-${String(tier).toUpperCase()}-${rand}`;
}

function tierPrice(tier) {
  switch (String(tier).toUpperCase()) {
    case "DISC":
      return 100;
    case "FREE":
      return 0;
    case "FULL":
    default:
      return 150;
  }
}

function normalizeStudent(id, raw = {}) {
  const name = String(raw.name || "").trim();
  const paymentStatus = String(raw.paymentStatus || (raw.paid ? "Paid" : "Pending")).trim();
  const portalStatus = String(raw.status || raw.portalStatus || "active").trim().toLowerCase();
  const completedLessons = Array.isArray(raw.completedLessons) ? raw.completedLessons : [];
  const progressPercent = Number(
    raw.progressPercent ?? (completedLessons.length ? Math.round((completedLessons.length / 8) * 100) : 0)
  );
  const progressLabel = String(
    raw.progressLabel || (completedLessons.length ? `Lesson ${completedLessons.length}` : "Not Started")
  ).trim();
  const tier = String(raw.tier || "FULL").toUpperCase();

  return {
    id,
    name,
    email: String(raw.email || "").trim(),
    accessCode: String(raw.accessCode || raw.code || "").trim(),
    tier,
    course:
      tier === "DISC"
        ? "Discounted Class"
        : tier === "FREE"
          ? "Free (Waived)"
          : "Louisiana Concealed Carry",
    price: Number(raw.price ?? raw.amountDue ?? tierPrice(tier)),
    paymentMethod: String(raw.paymentMethod || (tier === "FREE" ? "Waived" : "Direct")).trim(),
    paymentStatus,
    portalStatus,
    progressLabel,
    progressPercent,
    completionDate: String(raw.completionDate || ""),
    certificateIssued: !!raw.certificateIssued,
    notes: String(raw.notes || ""),
    courseVersion: String(raw.courseVersion || "2026-03"),
    paid: paymentStatus === "Paid",
    createdAt: raw.createdAt || null,
    updatedAt: raw.updatedAt || null,
    completedLessons
  };
}

async function loadStudents() {
  const snap = await getDocs(studentsRef);
  state.students = snap.docs.map((d) => normalizeStudent(d.id, d.data()));
  applyFilters();
  renderMetrics();
}

function renderMetrics() {
  const total = state.students.length;
  const paidStudents = state.students.filter((s) => s.paymentStatus === "Paid").length;
  const pendingPayments = state.students.filter((s) => s.paymentStatus !== "Paid").length;
  const revenue = state.students
    .filter((s) => s.paymentStatus === "Paid")
    .reduce((sum, s) => sum + Number(s.price || 0), 0);

  if (els.metricStudents) els.metricStudents.textContent = total;
  if (els.metricStudentsSmall) els.metricStudentsSmall.textContent = total;
  if (els.metricPaid) els.metricPaid.textContent = paidStudents;
  if (els.metricPaidSmall) els.metricPaidSmall.textContent = paidStudents;
  if (els.metricPending) els.metricPending.textContent = pendingPayments;
  if (els.metricPendingSmall) els.metricPendingSmall.textContent = pendingPayments;
  if (els.metricRevenue) els.metricRevenue.textContent = `$${revenue.toLocaleString()}`;
  if (els.metricRevenueSmall) els.metricRevenueSmall.textContent = `$${revenue.toLocaleString()}`;
}

function paymentClass(status) {
  const s = String(status).toLowerCase();
  if (s === "paid") return "paid";
  if (s === "waived") return "waived";
  if (s === "unpaid") return "unpaid";
  return "pending";
}

function portalClass(status) {
  const s = String(status).toLowerCase();
  if (s === "locked") return "locked";
  if (s === "expired") return "expired";
  return "active";
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderTable() {
  if (!els.studentTableBody) return;

  if (!state.filtered.length) {
    els.studentTableBody.innerHTML = `
      <tr>
        <td colspan="10">No matching students found.</td>
      </tr>
    `;
    return;
  }

  els.studentTableBody.innerHTML = state.filtered
    .map((student) => {
      const prettyStatus =
        student.portalStatus.charAt(0).toUpperCase() + student.portalStatus.slice(1);

      return `
        <tr>
          <td>${escapeHtml(student.name)}</td>
          <td>${escapeHtml(student.email)}</td>
          <td>${escapeHtml(student.course)}</td>
          <td>$${Number(student.price).toLocaleString()}</td>
          <td>${escapeHtml(student.paymentMethod)}</td>
          <td>
            <span class="payment-pill ${paymentClass(student.paymentStatus)}">
              ${escapeHtml(student.paymentStatus)}
            </span>
          </td>
          <td>
            <span class="status-pill ${portalClass(student.portalStatus)}">
              ${escapeHtml(prettyStatus)}
            </span>
          </td>
          <td>
            <div>${escapeHtml(student.progressLabel)}</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width:${student.progressPercent}%"></div>
            </div>
          </td>
          <td>${student.progressPercent}%</td>
          <td>
            <div class="action-group">
              <button class="btn btn-blue btn-sm" data-action="edit" data-id="${student.id}">
                View/Edit
              </button>
              <button class="btn btn-green btn-sm" data-action="toggle-lock" data-id="${student.id}">
                ${student.portalStatus === "locked" ? "Unlock" : "Lock"}
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function currentSearch() {
  return (els.searchInput?.value || els.searchInput2?.value || "").trim().toLowerCase();
}

function currentPaymentFilter() {
  return els.paymentFilter?.value || els.paymentFilter2?.value || "";
}

function currentSort() {
  return els.sortInput?.value || els.sortInput2?.value || "newest";
}

function applyFilters() {
  const search = currentSearch();
  const payment = currentPaymentFilter();
  const portal = els.portalFilter?.value || "";
  const tier = els.tierFilter?.value || "";
  const sort = currentSort();

  let items = [...state.students];

  if (search) {
    items = items.filter((s) => {
      return (
        s.name.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search) ||
        s.accessCode.toLowerCase().includes(search)
      );
    });
  }

  if (payment) items = items.filter((s) => s.paymentStatus === payment);
  if (portal) items = items.filter((s) => s.portalStatus === portal);
  if (tier) items = items.filter((s) => s.tier === tier);

  switch (sort) {
    case "name":
      items.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "amountHigh":
      items.sort((a, b) => b.price - a.price);
      break;
    case "amountLow":
      items.sort((a, b) => a.price - b.price);
      break;
    case "progressHigh":
      items.sort((a, b) => b.progressPercent - a.progressPercent);
      break;
    case "newest":
    default:
      items.sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
      break;
  }

  state.filtered = items;
  renderTable();
}

function syncSearchInputs(source) {
  if (source === els.searchInput && els.searchInput2) {
    els.searchInput2.value = els.searchInput.value;
  }
  if (source === els.searchInput2 && els.searchInput) {
    els.searchInput.value = els.searchInput2.value;
  }
}

function syncPaymentFilters(source) {
  if (source === els.paymentFilter && els.paymentFilter2) {
    els.paymentFilter2.value = els.paymentFilter.value;
  }
  if (source === els.paymentFilter2 && els.paymentFilter) {
    els.paymentFilter.value = els.paymentFilter2.value;
  }
}

function openModal(student = null) {
  state.editingId = student?.id || null;
  if (els.modalTitle) {
    els.modalTitle.textContent = student ? "Edit Student" : "Add Student";
  }

  els.studentName.value = student?.name || "";
  els.studentEmail.value = student?.email || "";
  els.priceTier.value = student?.tier || "FULL";
  els.price.value = student?.price ?? tierPrice(student?.tier || "FULL");
  els.paymentMethod.value = student?.paymentMethod || "Direct";
  els.paymentStatusSelect.value = student?.paymentStatus || "Pending";
  els.portalStatus.value = student?.portalStatus || "active";
  els.progressLabel.value = student?.progressLabel || "Not Started";
  els.progressPercent.value = student?.progressPercent ?? 0;
  els.completionDate.value = student?.completionDate || "";
  els.certificateIssued.value = student?.certificateIssued ? "true" : "false";
  els.courseVersion.value = student?.courseVersion || "2026-03";
  els.accessCode.value = student?.accessCode || "";
  els.notes.value = student?.notes || "";

  els.studentModalBackdrop.classList.remove("hidden");
}

function closeModal() {
  state.editingId = null;
  els.studentModalBackdrop.classList.add("hidden");
  if (els.studentForm) els.studentForm.reset();
  if (els.price) els.price.value = 150;
  if (els.progressPercent) els.progressPercent.value = 0;
  if (els.courseVersion) els.courseVersion.value = "2026-03";
}

async function saveStudent(event) {
  event.preventDefault();

  const tier = els.priceTier.value;
  const paymentStatus = els.paymentStatusSelect.value;
  const portalStatus = els.portalStatus.value;

  const payload = {
    name: els.studentName.value.trim(),
    email: els.studentEmail.value.trim().toLowerCase(),
    tier,
    price: Number(els.price.value || tierPrice(tier)),
    amountDue: Number(els.price.value || tierPrice(tier)),
    paymentMethod: els.paymentMethod.value,
    paymentStatus,
    paid: paymentStatus === "Paid",
    status: portalStatus,
    portalStatus,
    progressLabel: els.progressLabel.value,
    progressPercent: Number(els.progressPercent.value || 0),
    completionDate: els.completionDate.value || "",
    certificateIssued: els.certificateIssued.value === "true",
    courseVersion: els.courseVersion.value.trim() || "2026-03",
    accessCode: (els.accessCode.value.trim() || generateCode(tier)).toUpperCase(),
    notes: els.notes.value.trim(),
    updatedAt: serverTimestamp()
  };

  if (!payload.name || !payload.email) return;

  if (state.editingId) {
    await updateDoc(doc(db, "portalStudents", state.editingId), payload);
  } else {
    await addDoc(studentsRef, {
      ...payload,
      progress: {},
      completedLessons: [],
      createdAt: serverTimestamp()
    });
  }

  closeModal();
  await loadStudents();
}

async function toggleLock(id) {
  const student = state.students.find((s) => s.id === id);
  if (!student) return;

  const nextStatus = student.portalStatus === "locked" ? "active" : "locked";

  await updateDoc(doc(db, "portalStudents", id), {
    status: nextStatus,
    portalStatus: nextStatus,
    updatedAt: serverTimestamp()
  });

  await loadStudents();
}

function exportCSV() {
  const rows = [
    [
      "Name",
      "Email",
      "Course",
      "Tier",
      "Price",
      "Payment Method",
      "Payment Status",
      "Portal Status",
      "Progress Label",
      "Progress %",
      "Access Code",
      "Course Version",
      "Notes"
    ]
  ];

  state.filtered.forEach((student) => {
    rows.push([
      student.name,
      student.email,
      student.course,
      student.tier,
      student.price,
      student.paymentMethod,
      student.paymentStatus,
      student.portalStatus,
      student.progressLabel,
      student.progressPercent,
      student.accessCode,
      student.courseVersion,
      student.notes
    ]);
  });

  const csv = rows
    .map((row) => row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bsa-admin-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function bindEvents() {
  [els.addStudentBtn, els.quickAddBtn].forEach((btn) => {
    btn?.addEventListener("click", () => openModal());
  });

  [els.refreshBtn, els.reloadBtn].forEach((btn) => {
    btn?.addEventListener("click", loadStudents);
  });

  els.exportBtn?.addEventListener("click", exportCSV);
  els.cancelStudentBtn?.addEventListener("click", closeModal);

  els.studentModalBackdrop?.addEventListener("click", (e) => {
    if (e.target === els.studentModalBackdrop) closeModal();
  });

  els.studentForm?.addEventListener("submit", saveStudent);

  els.priceTier?.addEventListener("change", () => {
    els.price.value = tierPrice(els.priceTier.value);
    if (els.priceTier.value === "FREE") {
      els.paymentMethod.value = "Waived";
      els.paymentStatusSelect.value = "Waived";
    }
  });

  [els.searchInput, els.searchInput2].forEach((input) => {
    input?.addEventListener("input", (e) => {
      syncSearchInputs(e.target);
      applyFilters();
    });
  });

  [els.paymentFilter, els.paymentFilter2].forEach((select) => {
    select?.addEventListener("change", (e) => {
      syncPaymentFilters(e.target);
      applyFilters();
    });
  });

  [els.portalFilter, els.tierFilter, els.sortInput, els.sortInput2].forEach((el) => {
    el?.addEventListener("change", applyFilters);
  });

  els.clearFiltersBtn?.addEventListener("click", () => {
    if (els.searchInput) els.searchInput.value = "";
    if (els.searchInput2) els.searchInput2.value = "";
    if (els.paymentFilter) els.paymentFilter.value = "";
    if (els.paymentFilter2) els.paymentFilter2.value = "";
    if (els.portalFilter) els.portalFilter.value = "";
    if (els.tierFilter) els.tierFilter.value = "";
    if (els.sortInput) els.sortInput.value = "newest";
    if (els.sortInput2) els.sortInput2.value = "newest";
    applyFilters();
  });

  els.studentTableBody?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === "edit") {
      const student = state.students.find((s) => s.id === id);
      if (student) openModal(student);
    }

    if (action === "toggle-lock") {
      toggleLock(id);
    }
  });

  els.logoutBtn?.addEventListener("click", () => {
    window.location.href = "/training/index.html";
  });
}

async function init() {
  cacheEls();
  bindEvents();
  await loadStudents();
}

window.addEventListener("DOMContentLoaded", init);
