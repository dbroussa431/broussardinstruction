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
  editingId: null,
  initialized: false
};

const els = {};

const FIELD_ALIASES = {
  metricStudents: ["metricStudents"],
  metricStudentsSmall: ["metricStudentsSmall"],
  metricPending: ["metricPending"],
  metricPendingSmall: ["metricPendingSmall"],
  metricPaid: ["metricPaid"],
  metricPaidSmall: ["metricPaidSmall"],
  metricRevenue: ["metricRevenue"],
  metricRevenueSmall: ["metricRevenueSmall"],

  addStudentBtn: ["addStudentBtn"],
  quickAddBtn: ["quickAddBtn"],
  refreshBtn: ["refreshBtn"],
  reloadBtn: ["reloadBtn"],
  exportBtn: ["exportBtn"],
  logoutBtn: ["logoutBtn"],

  searchInput: ["searchInput"],
  searchInput2: ["searchInput2"],
  paymentFilter: ["paymentFilter"],
  paymentFilter2: ["paymentFilter2"],
  portalFilter: ["portalFilter"],
  tierFilter: ["tierFilter"],
  sortInput: ["sortInput"],
  sortInput2: ["sortInput2"],
  filterBtn: ["filterBtn"],
  clearFiltersBtn: ["clearFiltersBtn"],

  studentTableBody: ["studentTableBody"],
  studentModalBackdrop: ["studentModalBackdrop", "studentModal", "studentModalOverlay"],
  studentForm: ["studentForm", "editStudentForm"],
  modalTitle: ["modalTitle", "studentModalTitle"],

  studentName: ["studentName", "editStudentName"],
  studentEmail: ["studentEmail", "editStudentEmail"],
  priceTier: ["priceTier", "courseTier", "course", "tier"],
  price: ["price", "studentPrice"],
  paymentMethod: ["paymentMethod"],
  paymentStatusSelect: ["paymentStatusSelect", "paymentStatus"],
  portalStatus: ["portalStatus"],
  progressLabel: ["progressLabel"],
  progressPercent: ["progressPercent"],
  startDate: ["startDate", "startedAt"],
  completionDate: ["completionDate", "completedAt"],
  certificateIssued: ["certificateIssued"],
  courseVersion: ["courseVersion"],
  accessCode: ["accessCode"],
  notes: ["notes"],

  cancelStudentBtn: ["cancelStudentBtn"],
  saveStudentBtn: ["saveStudentBtn"]
};

function resolveEl(...ids) {
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) return el;
  }
  return null;
}

function cacheEls() {
  Object.entries(FIELD_ALIASES).forEach(([key, ids]) => {
    els[key] = resolveEl(...ids);
  });
}

function generateCode(tier = "FULL") {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BSA-${String(tier).toUpperCase()}-${rand}`;
}

function tierPrice(tier) {
  switch (normalizeTier(tier)) {
    case "DISC":
      return 100;
    case "FREE":
      return 0;
    case "FULL":
    default:
      return 150;
  }
}

function normalizeTier(value = "") {
  const v = String(value).trim().toUpperCase();

  if (v.includes("FREE")) return "FREE";
  if (v.includes("DISC")) return "DISC";
  if (v.includes("FULL")) return "FULL";

  return v || "FULL";
}

function normalizePortalStatus(value = "") {
  const v = String(value).trim().toLowerCase();
  if (v === "locked") return "locked";
  if (v === "expired") return "expired";
  return "active";
}

function displayPortalStatus(value = "") {
  const v = normalizePortalStatus(value);
  if (v === "locked") return "Locked";
  if (v === "expired") return "Expired";
  return "Active";
}

function normalizePaymentStatus(value = "", paid = false) {
  const raw = String(value || "").trim().toLowerCase();

  if (!raw) return paid ? "Paid" : "Pending";
  if (raw === "paid") return "Paid";
  if (raw === "waived") return "Waived";
  if (raw === "unpaid") return "Unpaid";
  if (raw === "pending") return "Pending";

  return String(value).trim();
}

function formatDateForInput(value) {
  if (!value) return "";

  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
    return "";
  }

  if (typeof value === "object") {
    if (typeof value.toDate === "function") {
      const d = value.toDate();
      if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    }

    if (typeof value.seconds === "number") {
      const d = new Date(value.seconds * 1000);
      if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    }
  }

  return "";
}

function dateSortValue(value) {
  if (!value) return 0;
  if (typeof value === "string") {
    const n = Date.parse(value);
    return Number.isNaN(n) ? 0 : n;
  }
  if (typeof value?.toDate === "function") {
    const n = value.toDate().getTime();
    return Number.isNaN(n) ? 0 : n;
  }
  if (typeof value?.seconds === "number") {
    return value.seconds * 1000;
  }
  return 0;
}

function deriveProgressPercent(completedLessons = []) {
  if (!Array.isArray(completedLessons) || !completedLessons.length) return 0;
  return Math.round((completedLessons.length / 8) * 100);
}

function deriveProgressLabel(completedLessons = []) {
  if (!Array.isArray(completedLessons) || !completedLessons.length) return "Not Started";
  if (completedLessons.length >= 8) return "Completed";
  return `Lesson ${completedLessons.length}`;
}

function normalizeStudent(id, raw = {}) {
  const completedLessons = Array.isArray(raw.completedLessons) ? raw.completedLessons : [];
  const tier = normalizeTier(raw.tier || raw.priceTier || "FULL");
  const paymentStatus = normalizePaymentStatus(raw.paymentStatus, !!raw.paid);
  const portalStatus = normalizePortalStatus(raw.status || raw.portalStatus || "active");

  const progressPercent = Number(
    raw.progressPercent ?? deriveProgressPercent(completedLessons)
  );

  let progressLabel = String(
    raw.progressLabel || deriveProgressLabel(completedLessons)
  ).trim();

  if (!progressLabel) progressLabel = "Not Started";

  const startDate = formatDateForInput(raw.startDate || raw.startedAt || "");
  const completionDate = formatDateForInput(raw.completionDate || raw.completedAt || "");

  return {
    id,
    name: String(raw.name || "").trim(),
    email: String(raw.email || "").trim(),
    accessCode: String(raw.accessCode || raw.code || "").trim(),
    tier,
    course:
      tier === "DISC"
        ? "Louisiana Concealed Carry — DISC"
        : tier === "FREE"
          ? "Louisiana Concealed Carry — FREE"
          : "Louisiana Concealed Carry — FULL",
    price: Number(raw.price ?? raw.amountDue ?? tierPrice(tier)),
    paymentMethod: String(raw.paymentMethod || (tier === "FREE" ? "Waived" : "Direct")).trim(),
    paymentStatus,
    portalStatus,
    progressLabel,
    progressPercent,
    startDate,
    completionDate,
    certificateIssued: !!raw.certificateIssued,
    notes: String(raw.notes || "").trim(),
    courseVersion: String(raw.courseVersion || "2026-03").trim(),
    paid: paymentStatus === "Paid",
    createdAt: raw.createdAt || null,
    updatedAt: raw.updatedAt || null,
    completedLessons
  };
}

function paymentClass(status) {
  const s = String(status).toLowerCase();
  if (s === "paid") return "paid";
  if (s === "waived") return "waived";
  if (s === "unpaid") return "unpaid";
  return "pending";
}

function portalClass(status) {
  const s = normalizePortalStatus(status);
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

async function loadStudents() {
  try {
    const snap = await getDocs(studentsRef);
    state.students = snap.docs.map((d) => normalizeStudent(d.id, d.data()));
    applyFilters();
    renderMetrics();
  } catch (err) {
    console.error("Failed to load students:", err);
    alert(`Failed to load students: ${err.message}`);
  }
}

function renderMetrics() {
  const total = state.students.length;
  const paidStudents = state.students.filter((s) => s.paymentStatus === "Paid").length;
  const pendingPayments = state.students.filter((s) => s.paymentStatus !== "Paid" && s.paymentStatus !== "Waived").length;
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
      const prettyStatus = displayPortalStatus(student.portalStatus);

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
              <div class="progress-fill" style="width:${Math.max(0, Math.min(100, Number(student.progressPercent) || 0))}%"></div>
            </div>
          </td>
          <td>${Number(student.progressPercent) || 0}%</td>
          <td>
            <div class="action-group">
              <button class="btn btn-blue btn-sm" type="button" data-action="edit" data-id="${student.id}">
                View/Edit
              </button>
              <button class="btn btn-green btn-sm" type="button" data-action="toggle-lock" data-id="${student.id}">
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
  const tier = normalizeTier(els.tierFilter?.value || "");
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

  if (payment) {
    items = items.filter((s) => s.paymentStatus === payment);
  }

  if (portal) {
    items = items.filter((s) => normalizePortalStatus(s.portalStatus) === normalizePortalStatus(portal));
  }

  if (tier) {
    items = items.filter((s) => normalizeTier(s.tier) === tier);
  }

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
      items.sort((a, b) => {
        const aVal = dateSortValue(a.updatedAt || a.createdAt);
        const bVal = dateSortValue(b.updatedAt || b.createdAt);
        return bVal - aVal;
      });
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

function setSelectValue(selectEl, preferredValue, fallbacks = []) {
  if (!selectEl) return;
  const options = Array.from(selectEl.options || []).map((o) => String(o.value));

  const tryValues = [preferredValue, ...fallbacks]
    .filter((v) => v !== undefined && v !== null)
    .map((v) => String(v));

  const match = tryValues.find((value) => options.includes(value));

  if (match !== undefined) {
    selectEl.value = match;
    return;
  }

  if (options.length) {
    selectEl.value = options[0];
  }
}

function openModal(student = null) {
  state.editingId = student?.id || null;

  if (els.modalTitle) {
    els.modalTitle.textContent = student ? "Edit Student" : "Add Student";
  }

  if (els.studentName) els.studentName.value = student?.name || "";
  if (els.studentEmail) els.studentEmail.value = student?.email || "";

  if (els.priceTier) {
    setSelectValue(
      els.priceTier,
      student?.tier || "FULL",
      [
        normalizeTier(student?.tier || "FULL"),
        student?.course || "",
        "FULL",
        "Louisiana Concealed Carry — FULL"
      ]
    );
  }

  if (els.price) {
    els.price.value = student?.price ?? tierPrice(student?.tier || "FULL");
  }

  if (els.paymentMethod) {
    setSelectValue(
      els.paymentMethod,
      student?.paymentMethod || "Direct",
      ["Direct", "Waived", "Card", "Cash"]
    );
  }

  if (els.paymentStatusSelect) {
    setSelectValue(
      els.paymentStatusSelect,
      student?.paymentStatus || "Pending",
      ["Pending", "Paid", "Waived", "Unpaid"]
    );
  }

  if (els.portalStatus) {
    setSelectValue(
      els.portalStatus,
      displayPortalStatus(student?.portalStatus || "active"),
      [student?.portalStatus || "active", "Active"]
    );
  }

  if (els.progressLabel) {
    setSelectValue(
      els.progressLabel,
      student?.progressLabel || "Not Started",
      ["Not Started"]
    );
  }

  if (els.progressPercent) {
    els.progressPercent.value = student?.progressPercent ?? 0;
  }

  if (els.startDate) {
    els.startDate.value = student?.startDate || "";
  }

  if (els.completionDate) {
    els.completionDate.value = student?.completionDate || "";
  }

  if (els.certificateIssued) {
    setSelectValue(
      els.certificateIssued,
      student?.certificateIssued ? "true" : "false",
      ["false"]
    );
  }

  if (els.courseVersion) {
    els.courseVersion.value = student?.courseVersion || "2026-03";
  }

  if (els.accessCode) {
    els.accessCode.value = student?.accessCode || "";
  }

  if (els.notes) {
    els.notes.value = student?.notes || "";
  }

  if (els.studentModalBackdrop) {
    els.studentModalBackdrop.classList.remove("hidden");
    els.studentModalBackdrop.style.display = "";
  }
}

function closeModal() {
  state.editingId = null;

  if (els.studentModalBackdrop) {
    els.studentModalBackdrop.classList.add("hidden");
  }

  if (els.studentForm) {
    els.studentForm.reset();
  }

  if (els.price) els.price.value = tierPrice("FULL");
  if (els.progressPercent) els.progressPercent.value = 0;
  if (els.courseVersion) els.courseVersion.value = "2026-03";
  if (els.startDate) els.startDate.value = "";
  if (els.completionDate) els.completionDate.value = "";
}

function getValue(el, fallback = "") {
  return el ? String(el.value || "").trim() : fallback;
}

function getNumberValue(el, fallback = 0) {
  const n = Number(el?.value ?? fallback);
  return Number.isFinite(n) ? n : fallback;
}

function buildPayloadFromForm() {
  const tier = normalizeTier(getValue(els.priceTier, "FULL"));
  const paymentStatus = normalizePaymentStatus(getValue(els.paymentStatusSelect, "Pending"));
  const portalStatus = normalizePortalStatus(getValue(els.portalStatus, "Active"));

  const payload = {
    name: getValue(els.studentName),
    email: getValue(els.studentEmail).toLowerCase(),
    tier,
    price: getNumberValue(els.price, tierPrice(tier)),
    amountDue: getNumberValue(els.price, tierPrice(tier)),
    paymentMethod: getValue(els.paymentMethod, tier === "FREE" ? "Waived" : "Direct"),
    paymentStatus,
    paid: paymentStatus === "Paid",
    status: portalStatus,
    portalStatus,
    progressLabel: getValue(els.progressLabel, "Not Started"),
    progressPercent: Math.max(0, Math.min(100, getNumberValue(els.progressPercent, 0))),
    startDate: getValue(els.startDate, ""),
    completionDate: getValue(els.completionDate, ""),
    certificateIssued: getValue(els.certificateIssued, "false") === "true",
    courseVersion: getValue(els.courseVersion, "2026-03") || "2026-03",
    accessCode: (getValue(els.accessCode) || generateCode(tier)).toUpperCase(),
    notes: getValue(els.notes),
    updatedAt: serverTimestamp()
  };

  return payload;
}

async function saveStudent(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  try {
    const payload = buildPayloadFromForm();

    if (!payload.name) {
      alert("Student name is required.");
      return;
    }

    if (!payload.email) {
      alert("Student email is required.");
      return;
    }

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
  } catch (err) {
    console.error("Save failed:", err);
    alert(`Save failed: ${err.message}`);
  }
}

async function toggleLock(id) {
  try {
    const student = state.students.find((s) => s.id === id);
    if (!student) return;

    const nextStatus = student.portalStatus === "locked" ? "active" : "locked";

    await updateDoc(doc(db, "portalStudents", id), {
      status: nextStatus,
      portalStatus: nextStatus,
      updatedAt: serverTimestamp()
    });

    await loadStudents();
  } catch (err) {
    console.error("Toggle lock failed:", err);
    alert(`Unable to change portal status: ${err.message}`);
  }
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
      "Start Date",
      "Completion Date",
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
      displayPortalStatus(student.portalStatus),
      student.progressLabel,
      student.progressPercent,
      student.startDate,
      student.completionDate,
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
    btn?.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  });

  [els.refreshBtn, els.reloadBtn].forEach((btn) => {
    btn?.addEventListener("click", async (e) => {
      e.preventDefault();
      await loadStudents();
    });
  });

  els.exportBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    exportCSV();
  });

  els.cancelStudentBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal();
  });

  els.saveStudentBtn?.addEventListener("click", saveStudent);
  els.studentForm?.addEventListener("submit", saveStudent);

  els.studentModalBackdrop?.addEventListener("click", (e) => {
    if (e.target === els.studentModalBackdrop) {
      closeModal();
    }
  });

  els.priceTier?.addEventListener("change", () => {
    const tier = normalizeTier(getValue(els.priceTier, "FULL"));

    if (els.price) {
      els.price.value = tierPrice(tier);
    }

    if (tier === "FREE") {
      if (els.paymentMethod) {
        setSelectValue(els.paymentMethod, "Waived", ["Waived"]);
      }
      if (els.paymentStatusSelect) {
        setSelectValue(els.paymentStatusSelect, "Waived", ["Waived"]);
      }
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

  els.filterBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    applyFilters();
  });

  els.clearFiltersBtn?.addEventListener("click", (e) => {
    e.preventDefault();

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
      return;
    }

    if (action === "toggle-lock") {
      toggleLock(id);
    }
  });

  els.logoutBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "/training/index.html";
  });
}

async function init() {
  if (state.initialized) return;
  state.initialized = true;

  cacheEls();
  bindEvents();
  await loadStudents();
}

window.addEventListener("DOMContentLoaded", init);
