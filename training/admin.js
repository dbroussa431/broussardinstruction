import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let allStudents = [];
let filteredStudents = [];
let editingId = null;

// ---------- DOM ----------
const els = {
  tableBody: document.getElementById("studentTableBody"),
  statTotalStudents: document.getElementById("statTotalStudents"),
  statPendingPayments: document.getElementById("statPendingPayments"),
  statPaidStudents: document.getElementById("statPaidStudents"),
  statRevenue: document.getElementById("statRevenue"),
  statPassedFinal: document.getElementById("statPassedFinal"),
  statCritical: document.getElementById("statCritical"),

  addStudentBtn: document.getElementById("addStudentBtn"),
  refreshBtn: document.getElementById("refreshBtn"),
  exportBtn: document.getElementById("exportBtn"),
  logoutBtn: document.getElementById("logoutBtn"),

  searchInput: document.getElementById("searchInput"),
  paymentFilter: document.getElementById("paymentFilter"),
  portalFilter: document.getElementById("portalFilter"),
  sortBy: document.getElementById("sortBy"),
  applyFiltersBtn: document.getElementById("applyFiltersBtn"),
  clearFiltersBtn: document.getElementById("clearFiltersBtn"),

  studentModal: document.getElementById("studentModal"),
  studentFormWrap: document.getElementById("studentFormWrap"),
  modalTitle: document.getElementById("modalTitle"),
  closeModalBtn: document.getElementById("closeModalBtn"),
  cancelModalBtn: document.getElementById("cancelModalBtn"),
  modalMessage: document.getElementById("modalMessage"),

  studentName: document.getElementById("studentName"),
  studentEmail: document.getElementById("studentEmail"),
  studentCourse: document.getElementById("studentCourse"),
  studentPrice: document.getElementById("studentPrice"),
  studentPaymentMethod: document.getElementById("studentPaymentMethod"),
  studentPaymentStatus: document.getElementById("studentPaymentStatus"),
  studentPortalStatus: document.getElementById("studentPortalStatus"),
  studentTier: document.getElementById("studentTier"),
  generatedCode: document.getElementById("generatedCode"),
  regenCodeBtn: document.getElementById("regenCodeBtn"),
  saveStudentBtn: document.getElementById("saveStudentBtn")
};

// ---------- Helpers ----------
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function safeDate(value) {
  if (!value) return null;

  if (typeof value?.toDate === "function") {
    try {
      return value.toDate();
    } catch {
      return null;
    }
  }

  if (value instanceof Date) return value;

  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (typeof value?.seconds === "number") {
    const d = new Date(value.seconds * 1000);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return null;
}

function formatNiceDate(value) {
  const date = safeDate(value);
  if (!date) return "—";

  const diff = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "Just now";
  if (diff < hour) return `${Math.floor(diff / minute)} min ago`;
  if (diff < day) return `${Math.floor(diff / hour)} hr ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)} day(s) ago`;

  return date.toLocaleString();
}

function formatFullDate(value) {
  const date = safeDate(value);
  return date ? date.toLocaleString() : "—";
}

function currency(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

function generateAccessCode(tier = "FULL", name = "") {
  const prefix = `BSA-${tier}`;
  const cleanName = (name || "STUDENT")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4) || "STUD";

  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${cleanName}-${random}`;
}

function showModalMessage(message, isOk = true) {
  if (!els.modalMessage) return;
  els.modalMessage.textContent = message;
  els.modalMessage.classList.remove("hidden", "ok", "bad");
  els.modalMessage.classList.add(isOk ? "ok" : "bad");
}

function clearModalMessage() {
  if (!els.modalMessage) return;
  els.modalMessage.textContent = "";
  els.modalMessage.classList.add("hidden");
  els.modalMessage.classList.remove("ok", "bad");
}

function getTotalLessons() {
  const candidates = [
    window.LESSONS,
    window.lessonContent,
    window.lessonData,
    window.lessons,
    window.courseLessons,
    window.trainingLessons
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length) return candidate.length;
  }

  if (window.BSA_LESSON_COUNT && Number(window.BSA_LESSON_COUNT) > 0) {
    return Number(window.BSA_LESSON_COUNT);
  }

  return 10;
}

function getProgressObject(student) {
  return student.progress && typeof student.progress === "object" ? student.progress : {};
}

function getCompletedLessons(student) {
  const values = Array.isArray(student.completedLessons) ? student.completedLessons : [];
  return values
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
}

function getCompletedCount(student) {
  return getCompletedLessons(student).length;
}

function getCourseStatus(student) {
  const completed = getCompletedCount(student);
  const total = getTotalLessons();

  if (completed >= total) return "COMPLETE";
  if (completed === 0 && !Object.keys(getProgressObject(student)).length) return "NOT STARTED";
  return "IN PROGRESS";
}

function isCourseComplete(student) {
  return getCourseStatus(student) === "COMPLETE";
}

function getLessonNumbers(student) {
  const fromProgress = Object.keys(getProgressObject(student))
    .map((k) => Number(k))
    .filter((n) => Number.isFinite(n));

  const fromCompleted = getCompletedLessons(student);

  return [...new Set([...fromProgress, ...fromCompleted])].sort((a, b) => a - b);
}

function getCurrentLessonNumber(student) {
  const total = getTotalLessons();
  const completedCount = getCompletedCount(student);

  if (completedCount >= total) {
    return null;
  }

  if (Number.isFinite(Number(student.currentLessonNumber))) {
    const n = Number(student.currentLessonNumber);
    return Math.min(Math.max(n, 1), total);
  }

  if (typeof student.currentLesson === "string") {
    const match = student.currentLesson.match(/(\d+)/);
    if (match) {
      const n = Number(match[1]);
      return Math.min(Math.max(n, 1), total);
    }
  }

  const lessonNumbers = getLessonNumbers(student);
  if (!lessonNumbers.length) return 1;

  const completed = new Set(getCompletedLessons(student));
  const firstIncomplete = lessonNumbers.find((n) => !completed.has(n));

  return firstIncomplete || lessonNumbers[lessonNumbers.length - 1];
}

function getCurrentLessonLabel(student) {
  const status = getCourseStatus(student);

  if (status === "COMPLETE") return "Course Complete";
  if (status === "NOT STARTED") return "Not Started";

  const n = getCurrentLessonNumber(student);
  return n ? `Lesson ${n}` : "—";
}

function getCurrentStage(student) {
  const finalEval = normalizeText(student.finalEvaluationStatus || student.finalEvaluation);
  if (finalEval.includes("pass")) return "Passed";
  if (finalEval.includes("critical")) return "Critical";
  if (finalEval.includes("fail")) return "Failed";

  const status = getCourseStatus(student);
  if (status === "COMPLETE") return "Completed";
  if (status === "NOT STARTED") return "Not Started";

  if (student.currentStage) return String(student.currentStage);
  if (student.stage) return String(student.stage);

  const lessonNum = getCurrentLessonNumber(student);
  if (!lessonNum) return "—";

  const p = getProgressObject(student)[lessonNum] || {};

  if (p.completedAt) return "Completed";
  if (p.attempts > 0) return "Quiz Started";
  if (p.scenarioCompleted) return "Scenario Completed";
  if (p.contentViewed) return "Lesson Opened";

  return "In Progress";
}

function totalAttempts(student) {
  if (Number.isFinite(Number(student.attempts))) return Number(student.attempts);

  return Object.values(getProgressObject(student)).reduce((sum, p) => {
    return sum + Number(p?.attempts || 0);
  }, 0);
}

function totalQuizTimeSeconds(student) {
  if (Number.isFinite(Number(student.totalQuizTimeSeconds))) {
    return Number(student.totalQuizTimeSeconds);
  }

  if (Number.isFinite(Number(student.totalTimeSeconds))) {
    return Number(student.totalTimeSeconds);
  }

  if (Number.isFinite(Number(student.totalOnlineMinutes))) {
    return Number(student.totalOnlineMinutes) * 60;
  }

  return Object.values(getProgressObject(student)).reduce((sum, p) => {
    return sum
      + Number(p?.totalQuizTimeSeconds || 0)
      + Number(p?.quizTimeSeconds || 0)
      + Number(p?.timeSpentSeconds || 0)
      + (Number(p?.lessonTimeMinutes || 0) * 60);
  }, 0);
}

function formatSeconds(seconds = 0) {
  const s = Math.max(0, Number(seconds || 0));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  return `${minutes}m ${secs}s`;
}

function progressLabel(student) {
  const completed = getCompletedCount(student);
  const total = getTotalLessons();

  if (completed === 0) return "—";
  return `${Math.min(completed, total)}/${total}`;
}

function getFinalEvaluationLabel(student) {
  const value = normalizeText(student.finalEvaluationStatus || student.finalEvaluation);

  if (!value) return "None";
  if (value.includes("pass")) return "Passed";
  if (value.includes("fail")) return "Failed";
  if (value.includes("critical")) return "Critical";

  return student.finalEvaluationStatus || student.finalEvaluation || "None";
}

function lastActivity(student) {
  const progressDates = Object.values(getProgressObject(student))
    .map((p) => safeDate(p?.lastActivityAt || p?.completedAt))
    .filter(Boolean)
    .sort((a, b) => a - b);

  return (
    progressDates.pop()
    || safeDate(student.lastLoginAt)
    || safeDate(student.updatedAt)
    || safeDate(student.createdAt)
    || null
  );
}

function getPortalStatus(student) {
  return student.portalStatus || student.status || "active";
}

function normalizePaymentStatus(value, paid = false) {
  const raw = normalizeText(value);
  if (raw === "paid") return "paid";
  if (raw === "waived") return "waived";
  if (raw === "pending") return "pending";
  if (raw === "unpaid") return "pending";
  if (!raw) return paid ? "paid" : "pending";
  return raw;
}

function getPaymentStatus(student) {
  const raw = normalizeText(student.paymentStatus);

  if (raw === "paid") return "paid";
  if (raw === "waived") return "waived";
  if (raw === "pending") return "pending";

  if (student.paid === true) return "paid";

  return "pending";
}

function isPaid(student) {
  return getPaymentStatus(student) === "paid" || student.paid === true;
}

function getLastEmailType(student) {
  const last = lastActivity(student);

  if (!last) return "7-day"; // baseline

  const diffDays = Math.floor(
    (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays >= 30) return "30-day";
  if (diffDays >= 14) return "14-day";
  if (diffDays >= 7) return "7-day";

  return "None";
} {
  if (student.lastEmailType) return student.lastEmailType;
  if (student.inactiveEmailSent30) return "30-day";
  if (student.inactiveEmailSent14) return "14-day";
  if (student.inactiveEmailSent7) return "7-day";
  return "None";
}

function emailStatusHtml(student) {
  const type = getLastEmailType(student);
  const sentAt = student.lastEmailSentAt;

  let cls = "none";
  if (type === "7-day") cls = "pending";
  if (type === "14-day") cls = "warning";
  if (type === "30-day") cls = "danger";

  return `
    <div class="email-status-wrap">
      <span class="status-pill ${cls}">${escapeHtml(type)}</span>
      <small>${escapeHtml(formatFullDate(sentAt))}</small>
    </div>
  `;
}

function badgeClassForValue(value) {
  const v = normalizeText(value);
  if (!v || v === "none") return "none";
  if (["active", "passed", "paid"].includes(v)) return v;
  if (["locked", "critical", "failed", "danger"].includes(v)) return v;
  if (["pending", "warning"].includes(v)) return v;
  if (v === "waived") return "waived";
  if (v === "complete") return "active";
  if (v === "in progress") return "pending";
  if (v === "not started") return "none";
  return "none";
}

function badgeHtml(value) {
  const label = value || "None";
  return `<span class="status-pill ${badgeClassForValue(label)}">${escapeHtml(label)}</span>`;
}

function studentForEdit(id) {
  return allStudents.find((s) => s.id === id) || null;
}

// ---------- Render ----------
function renderStats(rows) {
  const totalStudents = rows.length;
  const pendingPayments = rows.filter((s) => getPaymentStatus(s) === "pending").length;
  const paidStudents = rows.filter((s) => isPaid(s)).length;
  const revenue = rows
    .filter((s) => isPaid(s))
    .reduce((sum, s) => sum + Number(s.price || 0), 0);

  const passedFinal = rows.filter((s) => normalizeText(getFinalEvaluationLabel(s)).includes("pass")).length;
  const critical = rows.filter((s) => normalizeText(getFinalEvaluationLabel(s)).includes("critical")).length;

  if (els.statTotalStudents) els.statTotalStudents.textContent = totalStudents;
  if (els.statPendingPayments) els.statPendingPayments.textContent = pendingPayments;
  if (els.statPaidStudents) els.statPaidStudents.textContent = paidStudents;
  if (els.statRevenue) els.statRevenue.textContent = currency(revenue);
  if (els.statPassedFinal) els.statPassedFinal.textContent = passedFinal;
  if (els.statCritical) els.statCritical.textContent = critical;
}

function renderRows(rows) {
  if (!els.tableBody) return;

  if (!rows.length) {
    els.tableBody.innerHTML = `<tr><td colspan="18">No student records found.</td></tr>`;
    return;
  }

  els.tableBody.innerHTML = rows.map((s) => {
    const portalStatus = getPortalStatus(s);
    const paymentStatus = getPaymentStatus(s);
    const finalEval = getFinalEvaluationLabel(s);
    const courseStatus = getCourseStatus(s);
    const isLocked = normalizeText(portalStatus) === "locked";

    return `
      <tr>
        <td class="cell-wrap">${escapeHtml(s.name || "—")}</td>
        <td class="cell-wrap">${escapeHtml(s.email || "—")}</td>
        <td class="cell-wrap">${escapeHtml(s.course || "Louisiana Concealed Carry")}</td>
        <td>${escapeHtml(String(Number(s.price || 0)))}</td>
        <td>${escapeHtml(s.paymentMethod || "—")}</td>
        <td>${badgeHtml(paymentStatus)}</td>
        <td>${badgeHtml(portalStatus)}</td>
        <td class="cell-wrap">${escapeHtml(s.accessCode || "—")}</td>
        <td>${escapeHtml(getCurrentLessonLabel(s))}</td>
        <td>${escapeHtml(getCurrentStage(s))}</td>
        <td>${totalAttempts(s)}</td>
        <td>${formatSeconds(totalQuizTimeSeconds(s))}</td>
        <td>${escapeHtml(progressLabel(s))}</td>
        <td>${badgeHtml(courseStatus)}</td>
        <td>${badgeHtml(finalEval)}</td>
        <td>
          <div class="cell-small">${escapeHtml(formatNiceDate(lastActivity(s)))}</div>
          <div class="cell-small">${escapeHtml(formatFullDate(lastActivity(s)))}</div>
        </td>
        <td>${emailStatusHtml(s)}</td>
        <td>
          <div class="mini-actions">
            <button class="btn btn-outline" data-action="edit" data-id="${s.id}" type="button">Edit</button>
            <button class="btn btn-outline" data-action="regen" data-id="${s.id}" type="button">Regen</button>
            <button class="btn ${isLocked ? "btn-light" : "btn-outline"}" data-action="toggle-lock" data-id="${s.id}" type="button">${isLocked ? "Unlock" : "Lock"}</button>
            <button class="btn btn-outline" data-action="delete" data-id="${s.id}" type="button">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function applyFiltersAndSort() {
  const search = normalizeText(els.searchInput?.value || "");
  const paymentFilter = els.paymentFilter?.value || "all";
  const portalFilter = els.portalFilter?.value || "all";
  const sortBy = els.sortBy?.value || "newest";

  filteredStudents = [...allStudents].filter((s) => {
    const haystack = [
      s.name,
      s.email,
      s.accessCode,
      s.course
    ].map(normalizeText).join(" ");

    const paymentMatch = paymentFilter === "all" || getPaymentStatus(s) === paymentFilter;
    const portalMatch = portalFilter === "all" || normalizeText(getPortalStatus(s)) === portalFilter;
    const searchMatch = !search || haystack.includes(search);

    return paymentMatch && portalMatch && searchMatch;
  });

  filteredStudents.sort((a, b) => {
    if (sortBy === "name") {
      return String(a.name || "").localeCompare(String(b.name || ""));
    }

    if (sortBy === "progress") {
      return getCompletedCount(b) - getCompletedCount(a);
    }

    const aDate = safeDate(a.createdAt || a.updatedAt)?.getTime() || 0;
    const bDate = safeDate(b.createdAt || b.updatedAt)?.getTime() || 0;
    return bDate - aDate;
  });

  renderStats(filteredStudents);
  renderRows(filteredStudents);
}

// ---------- Data ----------
async function loadStudents() {
  if (els.tableBody) {
    els.tableBody.innerHTML = `<tr><td colspan="18">Loading student records...</td></tr>`;
  }

  try {
    const snap = await getDocs(collection(db, "portalStudents"));
    allStudents = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    applyFiltersAndSort();
  } catch (error) {
    console.error("LOAD ERROR:", error);
    if (els.tableBody) {
      els.tableBody.innerHTML = `<tr><td colspan="18">Error loading student records.</td></tr>`;
    }
  }
}

// ---------- Modal ----------
function openAddModal() {
  editingId = null;
  if (els.modalTitle) els.modalTitle.textContent = "Add Student";
  if (els.studentFormWrap) els.studentFormWrap.reset();
  if (els.studentCourse) els.studentCourse.value = "Louisiana Concealed Carry";
  if (els.studentPrice) els.studentPrice.value = 150;
  if (els.studentPaymentMethod) els.studentPaymentMethod.value = "PayPal";
  if (els.studentPaymentStatus) els.studentPaymentStatus.value = "pending";
  if (els.studentPortalStatus) els.studentPortalStatus.value = "active";
  if (els.studentTier) els.studentTier.value = "FULL";
  if (els.generatedCode) {
    els.generatedCode.value = generateAccessCode(
      els.studentTier?.value || "FULL",
      els.studentName?.value || ""
    );
  }
  clearModalMessage();
  els.studentModal?.showModal();
}

function openEditModal(student) {
  editingId = student.id;
  if (els.modalTitle) els.modalTitle.textContent = "Edit Student";
  if (els.studentName) els.studentName.value = student.name || "";
  if (els.studentEmail) els.studentEmail.value = student.email || "";
  if (els.studentCourse) els.studentCourse.value = student.course || "Louisiana Concealed Carry";
  if (els.studentPrice) els.studentPrice.value = Number(s.price || 0);
  if (els.studentPaymentMethod) els.studentPaymentMethod.value = student.paymentMethod || "PayPal";
  if (els.studentPaymentStatus) els.studentPaymentStatus.value = getPaymentStatus(student);
  if (els.studentPortalStatus) els.studentPortalStatus.value = getPortalStatus(student);

  const tierMatch = String(student.accessCode || "").match(/^BSA-([A-Z]+)-/);
  if (els.studentTier) els.studentTier.value = tierMatch?.[1] || "FULL";
  if (els.generatedCode) {
    els.generatedCode.value = student.accessCode || generateAccessCode(
      els.studentTier?.value || "FULL",
      student.name || ""
    );
  }

  clearModalMessage();
  els.studentModal?.showModal();
}

function closeModal() {
  els.studentModal?.close();
  clearModalMessage();
}

// ---------- Actions ----------
async function saveStudent(event) {
  event.preventDefault();
  clearModalMessage();

  const paymentStatus = normalizePaymentStatus(els.studentPaymentStatus?.value || "pending");

  const payload = {
    name: (els.studentName?.value || "").trim(),
    email: (els.studentEmail?.value || "").trim(),
    course: (els.studentCourse?.value || "").trim() || "Louisiana Concealed Carry",
    price: Number(els.studentPrice?.value || 0),
    paymentMethod: els.studentPaymentMethod?.value || "PayPal",
    paymentStatus,
    paid: paymentStatus === "paid",
    portalStatus: els.studentPortalStatus?.value || "active",
    status: els.studentPortalStatus?.value || "active",
    accessCode: (els.generatedCode?.value || "").trim() || generateAccessCode(
      els.studentTier?.value || "FULL",
      els.studentName?.value || ""
    ),
    updatedAt: serverTimestamp()
  };

  try {
    if (editingId) {
      await updateDoc(doc(db, "portalStudents", editingId), payload);
      showModalMessage("Student updated.");
    } else {
      await addDoc(collection(db, "portalStudents"), {
        ...payload,
        createdAt: serverTimestamp(),
        completedLessons: [],
        progress: {},
        totalQuizTimeSeconds: 0,
        paid: payload.paymentStatus === "paid",
        lastLoginAt: null,
        lastEmailType: null,
        lastEmailSentAt: null,
        inactiveEmailSent7: false,
        inactiveEmailSent14: false,
        inactiveEmailSent30: false
      });
      showModalMessage("Student added.");
    }

    await loadStudents();
    setTimeout(closeModal, 450);
  } catch (error) {
    console.error("SAVE ERROR:", error);
    showModalMessage(`Save failed: ${error.message}`, false);
  }
}

async function deleteStudent(id) {
  if (!window.confirm("Delete this student? This cannot be undone.")) return;

  try {
    await deleteDoc(doc(db, "portalStudents", id));
    await loadStudents();
  } catch (error) {
    console.error("DELETE ERROR:", error);
    alert(`Delete failed: ${error.message}`);
  }
}

async function toggleLockStudent(id) {
  const student = studentForEdit(id);
  if (!student) return;

  const locked = normalizeText(getPortalStatus(student)) === "locked";
  const nextStatus = locked ? "active" : "locked";

  try {
    await updateDoc(doc(db, "portalStudents", id), {
      portalStatus: nextStatus,
      status: nextStatus,
      updatedAt: serverTimestamp()
    });
    await loadStudents();
  } catch (error) {
    console.error("LOCK ERROR:", error);
    alert(`Lock update failed: ${error.message}`);
  }
}

async function regenStudentCode(id) {
  const student = studentForEdit(id);
  if (!student) return;

  const tierMatch = String(student.accessCode || "").match(/^BSA-([A-Z]+)-/);
  const tier = tierMatch?.[1] || "FULL";
  const newCode = generateAccessCode(tier, student.name || "");

  try {
    await updateDoc(doc(db, "portalStudents", id), {
      accessCode: newCode,
      updatedAt: serverTimestamp()
    });
    await loadStudents();
  } catch (error) {
    console.error("REGEN ERROR:", error);
    alert(`Code regeneration failed: ${error.message}`);
  }
}

function exportCsv() {
  const rows = filteredStudents.length ? filteredStudents : allStudents;
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
    "Course Status",
    "Final Evaluation",
    "Last Activity",
    "Email Status",
    "Email Sent At"
  ];

  const csvRows = [
    header.join(","),
    ...rows.map((s) => [
      csvSafe(s.name),
      csvSafe(s.email),
      csvSafe(s.course || "Louisiana Concealed Carry"),
      csvSafe(Number(s.price || 0)),
      csvSafe(s.paymentMethod || ""),
      csvSafe(getPaymentStatus(s)),
      csvSafe(getPortalStatus(s)),
      csvSafe(s.accessCode || ""),
      csvSafe(getCurrentLessonLabel(s)),
      csvSafe(getCurrentStage(s)),
      csvSafe(totalAttempts(s)),
      csvSafe(formatSeconds(totalQuizTimeSeconds(s))),
      csvSafe(progressLabel(s)),
      csvSafe(getCourseStatus(s)),
      csvSafe(getFinalEvaluationLabel(s)),
      csvSafe(formatFullDate(lastActivity(s))),
      csvSafe(getLastEmailType(s)),
      csvSafe(formatFullDate(s.lastEmailSentAt))
    ].join(","))
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bsa-students.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function csvSafe(value) {
  const str = String(value ?? "");
  return `"${str.replaceAll('"', '""')}"`;
}

// ---------- Events ----------
function bindEvents() {
  els.addStudentBtn?.addEventListener("click", openAddModal);
  els.refreshBtn?.addEventListener("click", loadStudents);
  els.exportBtn?.addEventListener("click", exportCsv);
  els.closeModalBtn?.addEventListener("click", closeModal);
  els.cancelModalBtn?.addEventListener("click", closeModal);
  els.studentFormWrap?.addEventListener("submit", saveStudent);

  els.regenCodeBtn?.addEventListener("click", () => {
    if (els.generatedCode) {
      els.generatedCode.value = generateAccessCode(
        els.studentTier?.value || "FULL",
        els.studentName?.value || ""
      );
    }
  });

  els.studentName?.addEventListener("input", () => {
    if (!editingId && els.generatedCode) {
      els.generatedCode.value = generateAccessCode(
        els.studentTier?.value || "FULL",
        els.studentName?.value || ""
      );
    }
  });

  els.studentTier?.addEventListener("change", () => {
    if (!editingId && els.generatedCode) {
      els.generatedCode.value = generateAccessCode(
        els.studentTier?.value || "FULL",
        els.studentName?.value || ""
      );
    }
  });

  els.applyFiltersBtn?.addEventListener("click", applyFiltersAndSort);
  els.clearFiltersBtn?.addEventListener("click", () => {
    if (els.searchInput) els.searchInput.value = "";
    if (els.paymentFilter) els.paymentFilter.value = "all";
    if (els.portalFilter) els.portalFilter.value = "all";
    if (els.sortBy) els.sortBy.value = "newest";
    applyFiltersAndSort();
  });

  els.searchInput?.addEventListener("input", applyFiltersAndSort);
  els.paymentFilter?.addEventListener("change", applyFiltersAndSort);
  els.portalFilter?.addEventListener("change", applyFiltersAndSort);
  els.sortBy?.addEventListener("change", applyFiltersAndSort);

  els.logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("bsa_admin_auth");
    window.location.href = "admin-login.html";
  });

  els.tableBody?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const { action, id } = button.dataset;

    if (action === "edit") {
      const student = studentForEdit(id);
      if (student) openEditModal(student);
      return;
    }

    if (action === "regen") {
      await regenStudentCode(id);
      return;
    }

    if (action === "toggle-lock") {
      await toggleLockStudent(id);
      return;
    }

    if (action === "delete") {
      await deleteStudent(id);
    }
  });
}

// ---------- Start ----------
bindEvents();
loadStudents();
