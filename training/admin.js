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
const normalizeText = (v) => String(v ?? "").trim().toLowerCase();

function safeDate(value) {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  const d = new Date(value);
  return isNaN(d) ? null : d;
}

function getTotalLessons() {
  return window.BSA_LESSON_COUNT || 10;
}

function getCompletedLessons(student) {
  return Array.isArray(student.completedLessons) ? student.completedLessons : [];
}

function getCompletedCount(student) {
  return getCompletedLessons(student).length;
}

// 🔥 FIXED
function getCourseStatus(student) {
  const completed = getCompletedCount(student);
  const total = getTotalLessons();
  if (completed >= total) return "COMPLETE";
  if (completed === 0) return "NOT STARTED";
  return "IN PROGRESS";
}

// 🔥 FIXED
function getCurrentLessonNumber(student) {
  const total = getTotalLessons();
  const completed = getCompletedCount(student);

  if (completed >= total) return null;

  const progress = student.progress || {};
  const keys = Object.keys(progress).map(Number).sort((a,b)=>a-b);

  if (!keys.length) return 1;

  const completedSet = new Set(getCompletedLessons(student));
  const next = keys.find(n => !completedSet.has(n));

  return next || keys[keys.length - 1];
}

function getCurrentLessonLabel(student) {
  const status = getCourseStatus(student);
  if (status === "COMPLETE") return "Course Complete";
  if (status === "NOT STARTED") return "Not Started";
  const n = getCurrentLessonNumber(student);
  return n ? `Lesson ${n}` : "—";
}

// 🔥 FIXED
function totalAttempts(student) {
  if (student.attempts) return student.attempts;

  let total = 0;
  Object.values(student.progress || {}).forEach(p => {
    total += Number(p?.attempts || 0);
  });

  return total;
}

// 🔥 FIXED
function totalQuizTimeSeconds(student) {
  if (student.totalQuizTimeSeconds) return student.totalQuizTimeSeconds;
  if (student.totalTimeSeconds) return student.totalTimeSeconds;
  if (student.totalOnlineMinutes) return student.totalOnlineMinutes * 60;

  let total = 0;
  Object.values(student.progress || {}).forEach(p => {
    total += Number(p?.totalQuizTimeSeconds || 0);
    total += Number(p?.quizTimeSeconds || 0);
    total += Number(p?.timeSpentSeconds || 0);
  });

  return total;
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

// 🔥 FIXED
function progressLabel(student) {
  const completed = getCompletedCount(student);
  const total = getTotalLessons();
  if (completed === 0) return "—";
  return `${completed}/${total}`;
}

// 🔥 FIXED
function getPaymentStatus(student) {
  if (student.paymentStatus) return student.paymentStatus;
  if (student.paid === true) return "paid";
  return "pending";
}

function isPaid(student) {
  return getPaymentStatus(student) === "paid";
}

// ---------- Render ----------
function renderStats(rows) {
  els.statTotalStudents.textContent = rows.length;
  els.statPaidStudents.textContent = rows.filter(isPaid).length;
  els.statPendingPayments.textContent = rows.filter(s => !isPaid(s)).length;

  const revenue = rows
    .filter(isPaid)
    .reduce((sum, s) => sum + Number(s.price || 0), 0);

  els.statRevenue.textContent = `$${revenue}`;
}

function renderRows(rows) {
  if (!rows.length) {
    els.tableBody.innerHTML = `<tr><td colspan="10">No data</td></tr>`;
    return;
  }

  els.tableBody.innerHTML = rows.map(s => `
    <tr>
      <td>${s.name || ""}</td>
      <td>${s.email || ""}</td>
      <td>${s.course || ""}</td>
      <td>${s.price || 0}</td>
      <td>${s.paymentMethod || ""}</td>
      <td>${getPaymentStatus(s)}</td>
      <td>${s.portalStatus || "active"}</td>
      <td>${s.accessCode || ""}</td>
      <td>${getCurrentLessonLabel(s)}</td>
      <td>${totalAttempts(s)}</td>
      <td>${formatTime(totalQuizTimeSeconds(s))}</td>
      <td>${progressLabel(s)}</td>
      <td>${getCourseStatus(s)}</td>
    </tr>
  `).join("");
}

function applyFiltersAndSort() {
  filteredStudents = [...allStudents];
  renderStats(filteredStudents);
  renderRows(filteredStudents);
}

// ---------- Data ----------
async function loadStudents() {
  const snap = await getDocs(collection(db, "portalStudents"));
  allStudents = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  applyFiltersAndSort();
}

// ---------- Start ----------
loadStudents();
