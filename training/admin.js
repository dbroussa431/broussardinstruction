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
  if (value?.toDate) return value.toDate();
  const d = new Date(value);
  return isNaN(d) ? null : d;
}

function formatNiceDate(value) {
  const date = safeDate(value);
  if (!date) return "—";
  const diff = Date.now() - date.getTime();
  const minute = 60000, hour = 3600000, day = 86400000;
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

// ---------- LESSON / PROGRESS ----------

function getTotalLessons() {
  return window.BSA_LESSON_COUNT || 10;
}

function getProgressObject(student) {
  return student.progress || {};
}

function getCompletedLessons(student) {
  return (student.completedLessons || []).map(Number);
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

  const lessons = Object.keys(getProgressObject(student)).map(Number).sort((a,b)=>a-b);
  if (!lessons.length) return 1;

  const completedSet = new Set(getCompletedLessons(student));
  const next = lessons.find(n => !completedSet.has(n));

  return next || lessons[lessons.length - 1];
}

function getCurrentLessonLabel(student) {
  const status = getCourseStatus(student);
  if (status === "COMPLETE") return "Course Complete";
  if (status === "NOT STARTED") return "Not Started";
  const n = getCurrentLessonNumber(student);
  return n ? `Lesson ${n}` : "—";
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
  const raw = normalizeText(student.paymentStatus);
  if (raw === "paid") return "paid";
  if (raw === "waived") return "waived";
  if (raw === "pending") return "pending";
  if (student.paid === true) return "paid";
  return "pending";
}

function isPaid(student) {
  return getPaymentStatus(student) === "paid";
}

function totalAttempts(student) {
  if (student.attempts) return student.attempts;

  return Object.values(getProgressObject(student))
    .reduce((sum,p)=> sum + Number(p?.attempts || 0),0);
}

function totalQuizTimeSeconds(student) {
  if (student.totalQuizTimeSeconds) return student.totalQuizTimeSeconds;

  return Object.values(getProgressObject(student))
    .reduce((sum,p)=> sum + Number(p?.quizTimeSeconds || 0),0);
}

function formatSeconds(sec){
  const m = Math.floor(sec/60);
  const s = sec%60;
  return `${m}m ${s}s`;
}

// ---------- RENDER ----------

function renderStats(rows){
  els.statTotalStudents.textContent = rows.length;
  els.statPaidStudents.textContent = rows.filter(isPaid).length;
  els.statPendingPayments.textContent = rows.filter(s=>!isPaid(s)).length;

  const revenue = rows.filter(isPaid)
    .reduce((sum,s)=> sum + Number(s.price||0),0);

  els.statRevenue.textContent = `$${revenue}`;
}

function renderRows(rows){
  els.tableBody.innerHTML = rows.map(s=>`
    <tr>
      <td>${s.name||""}</td>
      <td>${s.email||""}</td>
      <td>${getCurrentLessonLabel(s)}</td>
      <td>${totalAttempts(s)}</td>
      <td>${formatSeconds(totalQuizTimeSeconds(s))}</td>
      <td>${progressLabel(s)}</td>
      <td>${getCourseStatus(s)}</td>
    </tr>
  `).join("");
}

// ---------- DATA ----------

async function loadStudents(){
  const snap = await getDocs(collection(db,"portalStudents"));
  allStudents = snap.docs.map(d=>({id:d.id,...d.data()}));
  renderStats(allStudents);
  renderRows(allStudents);
}

// ---------- START ----------
loadStudents();
