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
  studentModalBackdrop: ["studentModalBackdrop"],
  studentForm: ["studentForm"],
  modalTitle: ["modalTitle"],

  studentReadinessPanel: ["studentReadinessPanel"],
  studentReadinessStatus: ["studentReadinessStatus"],
  readinessLessonCount: ["readinessLessonCount"],
  readinessOnlineTime: ["readinessOnlineTime"],
  readinessStartDate: ["readinessStartDate"],
  readinessCompletionDate: ["readinessCompletionDate"],
  readinessCertificateStatus: ["readinessCertificateStatus"],
  readinessLiveStatus: ["readinessLiveStatus"],
  studentReadinessNote: ["studentReadinessNote"],

  studentName: ["studentName"],
  studentEmail: ["studentEmail"],
  priceTier: ["priceTier"],
  price: ["price"],
  paymentMethod: ["paymentMethod"],
  paymentStatusSelect: ["paymentStatusSelect"],
  portalStatus: ["portalStatus"],
  progressLabel: ["progressLabel"],
  progressPercent: ["progressPercent"],
  startDate: ["startDate"],
  completionDate: ["completionDate"],
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

function normalizeTier(value = "") {
  const v = String(value).trim().toUpperCase();
  if (v.includes("FREE")) return "FREE";
  if (v.includes("DISC")) return "DISC";
  if (v.includes("FULL")) return "FULL";
  return v || "FULL";
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
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
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

function formatDateForDisplay(value) {
  const input = formatDateForInput(value);
  return input || "—";
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

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function minutesToHoursMinutes(totalMinutes = 0) {
  const mins = Number(totalMinutes || 0);
  if (!mins || mins < 60) return `${mins || 0} min`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hours}h ${rem}m` : `${hours}h`;
}

function getEligibility(student) {
  const completedLessons = Array.isArray(student.completedLessons) ? student.completedLessons.length : 0;
  const fullyComplete = completedLessons >= 8;
  const certificateIssued = !!student.certificateIssued;

  if (certificateIssued) {
    return {
      text: "Certificate Issued",
      className: "eligible-complete"
    };
  }

  if (fullyComplete) {
    return {
      text: "Ready for Live Completion",
      className: "eligible-ready"
    };
  }

  if (completedLessons > 0) {
    return {
      text: "In Progress",
      className: "eligible-progress"
    };
  }

  return {
    text: "Not Eligible",
    className: "eligible-not-ready"
  };
}

function getReadinessNote(student) {
  const completedLessons = Array.isArray(student.completedLessons) ? student.completedLessons.length : 0;

  if (student.certificateIssued) {
    return "Certificate has already been marked issued for this student.";
  }

  if (completedLessons >= 8) {
    return "This student has completed the online prerequisite and is ready for live review / range completion.";
  }

  if (completedLessons > 0) {
    return "This student has started the online prerequisite but is not yet ready for live completion.";
  }

  return "This student has not yet completed the full online prerequisite.";
}

function normalizeStudent(id, raw = {}) {
  const completedLessons = Array.isArray(raw.completedLessons) ? raw.completedLessons : [];
  const tier = normalizeTier(raw.tier || raw.priceTier || "FULL");
  const paymentStatus = normalizePaymentStatus(raw.paymentStatus, !!raw.paid);
  const portalStatus = normalizePortalStatus(raw.status || raw.portalStatus || "active");

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
    progressLabel: String(raw.adminProgressLabel || raw.progressLabel || "Not Started").trim(),
    progressPercent: Number(raw.progressPercent || 0),
    startDate: formatDateForInput(raw.startDate || raw.startedAt || ""),
    completionDate: formatDateForInput(raw.completionDate || raw.completedAt || ""),
    certificateIssued: !!raw.certificateIssued,
    notes: String(raw.notes || "").trim(),
    courseVersion: String(raw.courseVersion || "2026-03").trim(),
    paid: paymentStatus === "Paid",
    createdAt: raw.createdAt || null,
    updatedAt: raw.updatedAt || null,
    completedLessons,
    totalOnlineMinutes: Number(raw.totalOnlineMinutes || 0)
  };
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

  els.studentTableBody.innerHTML = state.filtered.map((student) => {
    const eligibility = getEligibility(student);

    return `
      <tr>
        <td>
          <div><strong>${escapeHtml(student.name)}</strong></div>
          <div style="font-size:12px; opacity:.75;">${escapeHtml(student.accessCode || "No Code")}</div>
        </td>
        <td>${escapeHtml(student.email)}</td>
        <td>
          <div>${escapeHtml(student.course)}</div>
          <div style="font-size:12px; opacity:.75;">Tier: ${escapeHtml(student.tier)}</div>
        </td>
        <td>
          <div>$${Number(student.price).toLocaleString()}</div>
          <div style="margin-top:6px;">
            <span class="payment-pill ${paymentClass(student.paymentStatus)}">${escapeHtml(student.paymentStatus)}</span>
          </div>
        </td>
        <td>
          <span class="status-pill ${portalClass(student.portalStatus)}">${escapeHtml(displayPortalStatus(student.portalStatus))}</span>
        </td>
        <td>
          <div>${escapeHtml(student.progressLabel || "Not Started")}</div>
          <div class="progress-bar" style="margin-top:6px;">
            <div class="progress-fill" style="width:${Math.max(0, Math.min(100, Number(student.progressPercent) || 0))}%"></div>
          </div>
          <div style="font-size:12px; margin-top:6px;">${Number(student.progressPercent) || 0}% • ${student.completedLessons.length}/8</div>
        </td>
        <td>
          <div><strong>Start:</strong> ${escapeHtml(formatDateForDisplay(student.startDate))}</div>
          <div><strong>End:</strong> ${escapeHtml(formatDateForDisplay(student.completionDate))}</div>
        </td>
        <td>
          <div>${escapeHtml(minutesToHoursMinutes(student.totalOnlineMinutes))}</div>
          <div style="font-size:12px; opacity:.75;">${student.totalOnlineMinutes || 0} min total</div>
        </td>
        <td>
          <span class="status-pill ${eligibility.className}">${escapeHtml(eligibility.text)}</span>
        </td>
        <td>
          <div class="action-group">
            <button class="btn btn-blue btn-sm" type="button" data-action="edit" data-id="${student.id}">View/Edit</button>
            <button class="btn btn-green btn-sm" type="button" data-action="toggle-lock" data-id="${student.id}">
              ${student.portalStatus === "locked" ? "Unlock" : "Lock"}
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
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
    items = items.filter((s) =>
      s.name.toLowerCase().includes(search) ||
      s.email.toLowerCase().includes(search) ||
      s.accessCode.toLowerCase().includes(search)
    );
  }

  if (payment) items = items.filter((s) => s.paymentStatus === payment);
  if (portal) items = items.filter((s) => normalizePortalStatus(s.portalStatus) === normalizePortalStatus(portal));
  if (tier) items = items.filter((s) => normalizeTier(s.tier) === tier);

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
    case "minutesHigh":
      items.sort((a, b) => b.totalOnlineMinutes - a.totalOnlineMinutes);
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
  if (source === els.searchInput && els.searchInput2) els.searchInput2.value = els.searchInput.value;
  if (source === els.searchInput2 && els.searchInput) els.searchInput.value = els.searchInput2.value;
}

function syncPaymentFilters(source) {
  if (source === els.paymentFilter && els.paymentFilter2) els.paymentFilter2.value = els.paymentFilter.value;
  if (source === els.paymentFilter2 && els.paymentFilter) els.paymentFilter.value = els.paymentFilter2.value;
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
  if (options.length) selectEl.value = options[0];
}

function updateReadinessPanel(student = null) {
  if (!student) {
    if (els.studentReadinessStatus) {
      els.studentReadinessStatus.textContent = "Not Eligible";
      els.studentReadinessStatus.className = "status-pill eligible-not-ready";
    }
    if (els.readinessLessonCount) els.readinessLessonCount.textContent = "0 / 8";
    if (els.readinessOnlineTime) els.readinessOnlineTime.textContent = "0 min";
    if (els.readinessStartDate) els.readinessStartDate.textContent = "—";
    if (els.readinessCompletionDate) els.readinessCompletionDate.textContent = "—";
    if (els.readinessCertificateStatus) els.readinessCertificateStatus.textContent = "Not Issued";
    if (els.readinessLiveStatus) els.readinessLiveStatus.textContent = "Not Ready";
    if (els.studentReadinessNote) els.studentReadinessNote.textContent = "This student has not yet completed the full online prerequisite.";
    return;
  }

  const eligibility = getEligibility(student);

  if (els.studentReadinessStatus) {
    els.studentReadinessStatus.textContent = eligibility.text;
    els.studentReadinessStatus.className = `status-pill ${eligibility.className}`;
  }

  if (els.readinessLessonCount) els.readinessLessonCount.textContent = `${student.completedLessons.length} / 8`;
  if (els.readinessOnlineTime) els.readinessOnlineTime.textContent = minutesToHoursMinutes(student.totalOnlineMinutes);
  if (els.readinessStartDate) els.readinessStartDate.textContent = formatDateForDisplay(student.startDate);
  if (els.readinessCompletionDate) els.readinessCompletionDate.textContent = formatDateForDisplay(student.completionDate);
  if (els.readinessCertificateStatus) els.readinessCertificateStatus.textContent = student.certificateIssued ? "Issued" : "Not Issued";
  if (els.readinessLiveStatus) {
    els.readinessLiveStatus.textContent =
      student.completedLessons.length >= 8
        ? "Ready for Live Completion"
        : "Not Ready";
  }
  if (els.studentReadinessNote) els.studentReadinessNote.textContent = getReadinessNote(student);
}

function openModal(student = null) {
  state.editingId = student?.id || null;
  updateReadinessPanel(student);

  if (els.modalTitle) els.modalTitle.textContent = student ? "Edit Student" : "Add Student";
  if (els.studentName) els.studentName.value = student?.name || "";
  if (els.studentEmail) els.studentEmail.value = student?.email || "";

  if (els.priceTier) {
    setSelectValue(els.priceTier, student?.tier || "FULL", ["FULL"]);
  }

  if (els.price) els.price.value = student?.price ?? tierPrice(student?.tier || "FULL");

  if (els.paymentMethod) {
    setSelectValue(els.paymentMethod, student?.paymentMethod || "Direct", ["Direct", "Waived", "PayPal", "Cash"]);
  }

  if (els.paymentStatusSelect) {
    setSelectValue(els.paymentStatusSelect, student?.paymentStatus || "Pending", ["Pending", "Paid", "Waived", "Unpaid"]);
  }

  if (els.portalStatus) {
    setSelectValue(els.portalStatus, student?.portalStatus || "active", ["active"]);
  }

  if (els.progressLabel) {
    setSelectValue(els.progressLabel, student?.progressLabel || "Not Started", ["Not Started"]);
  }

  if (els.progressPercent) els.progressPercent.value = student?.progressPercent ?? 0;
  if (els.startDate) els.startDate.value = student?.startDate || "";
  if (els.completionDate) els.completionDate.value = student?.completionDate || "";

  if (els.certificateIssued) {
    setSelectValue(els.certificateIssued, student?.certificateIssued ? "true" : "false", ["false"]);
  }

  if (els.courseVersion) els.courseVersion.value = student?.courseVersion || "2026-03";
  if (els.accessCode) els.accessCode.value = student?.accessCode || "";

  if (els.notes) {
    const timeLine = student?.totalOnlineMinutes ? `Online Minutes: ${student.totalOnlineMinutes}` : "";
    els.notes.value = [student?.notes || "", timeLine].filter(Boolean).join("\n");
  }

  if (els.studentModalBackdrop) {
    els.studentModalBackdrop.classList.remove("hidden");
    els.studentModalBackdrop.style.display = "";
  }
}

function closeModal() {
  state.editingId = null;
  updateReadinessPanel(null);

  if (els.studentModalBackdrop) els.studentModalBackdrop.classList.add("hidden");
  if (els.studentForm) els.studentForm.reset();
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
  const portalStatus = normalizePortalStatus(getValue(els.portalStatus, "active"));

  return {
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
        totalOnlineMinutes: 0,
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
  const rows = [[
    "Name", "Email", "Course", "Tier", "Price", "Payment Method", "Payment Status",
    "Portal Status", "Progress Label", "Progress %", "Start Date", "Completion Date",
    "Total Online Minutes", "Eligibility", "Access Code", "Course Version", "Notes"
  ]];

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
      student.totalOnlineMinutes || 0,
      getEligibility(student).text,
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
    if (e.target === els.studentModalBackdrop) closeModal();
  });

  els.priceTier?.addEventListener("change", () => {
    const tier = normalizeTier(getValue(els.priceTier, "FULL"));
    if (els.price) els.price.value = tierPrice(tier);
    if (tier === "FREE") {
      if (els.paymentMethod) setSelectValue(els.paymentMethod, "Waived", ["Waived"]);
      if (els.paymentStatusSelect) setSelectValue(els.paymentStatusSelect, "Waived", ["Waived"]);
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

    if (action === "toggle-lock") toggleLock(id);
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
  updateReadinessPanel(null);
  await loadStudents();
}

window.addEventListener("DOMContentLoaded", init);
