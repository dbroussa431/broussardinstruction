import { db } from "../js/firebase-config.js";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const BOSS_CODE = "BSA-BOSS-67676";

// Adjust these to your real pricing
const TIER_PRICING = {
  FULL: 100,
  BASIC: 50,
  FREE: 0
};

const loginView = document.getElementById("loginView");
const adminView = document.getElementById("adminView");
const bossCodeInput = document.getElementById("bossCode");
const bossLoginBtn = document.getElementById("bossLoginBtn");
const loginMessage = document.getElementById("loginMessage");

const refreshBtn = document.getElementById("refreshBtn");
const logoutBtn = document.getElementById("logoutBtn");

const studentName = document.getElementById("studentName");
const studentEmail = document.getElementById("studentEmail");
const studentTier = document.getElementById("studentTier");
const studentStatus = document.getElementById("studentStatus");
const studentPaid = document.getElementById("studentPaid");
const studentNotes = document.getElementById("studentNotes");
const createStudentBtn = document.getElementById("createStudentBtn");
const createMessage = document.getElementById("createMessage");

const searchInput = document.getElementById("searchInput");
const studentsTableBody = document.getElementById("studentsTableBody");
const tableMessage = document.getElementById("tableMessage");

const statTotalStudents = document.getElementById("statTotalStudents");
const statPaidStudents = document.getElementById("statPaidStudents");
const statUnpaidStudents = document.getElementById("statUnpaidStudents");
const statRevenue = document.getElementById("statRevenue");
const statFullAccounts = document.getElementById("statFullAccounts");
const statFreeAccounts = document.getElementById("statFreeAccounts");

const quickNewestStudent = document.getElementById("quickNewestStudent");
const quickLatestCode = document.getElementById("quickLatestCode");
const quickPaidRate = document.getElementById("quickPaidRate");
const quickRevenuePerStudent = document.getElementById("quickRevenuePerStudent");

let allStudents = [];

function showMessage(el, text, type = "") {
  el.textContent = text;
  el.className = `message ${type}`.trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeStatus(value) {
  const s = String(value || "").trim().toLowerCase();
  return ["active", "locked", "expired"].includes(s) ? s : "active";
}

function normalizeTier(value) {
  const t = String(value || "").trim().toUpperCase();
  return ["FULL", "FREE", "BASIC"].includes(t) ? t : "FULL";
}

function genCode(tier = "FULL") {
  return `BSA-${normalizeTier(tier)}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function makeStudentId(name) {
  const base = String(name || "student")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24) || "student";

  return `${base}-${Date.now()}`;
}

function statusPill(status) {
  const s = normalizeStatus(status);
  return `<span class="pill ${s}">${escapeHtml(s)}</span>`;
}

function setLoggedIn(value) {
  localStorage.setItem("bsaBossLoggedIn", value ? "true" : "false");
}

function isLoggedIn() {
  return localStorage.getItem("bsaBossLoggedIn") === "true";
}

function showAdmin() {
  loginView.classList.add("hidden");
  adminView.classList.remove("hidden");
}

function showLogin() {
  loginView.classList.remove("hidden");
  adminView.classList.add("hidden");
}

function getCreatedSortValue(student) {
  const raw = student.createdAt;
  if (!raw) return 0;

  if (typeof raw?.toDate === "function") {
    return raw.toDate().getTime();
  }

  const parsed = new Date(raw).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getEstimatedRevenue(student) {
  if (!student.paid) return 0;
  const tier = normalizeTier(student.tier);
  return TIER_PRICING[tier] ?? 0;
}

function updateStats() {
  const totalStudents = allStudents.length;
  const paidStudents = allStudents.filter(s => s.paid === true).length;
  const unpaidStudents = totalStudents - paidStudents;
  const fullAccounts = allStudents.filter(s => normalizeTier(s.tier) === "FULL").length;
  const freeAccounts = allStudents.filter(s => normalizeTier(s.tier) === "FREE").length;

  const estimatedRevenue = allStudents.reduce((sum, student) => {
    return sum + getEstimatedRevenue(student);
  }, 0);

  statTotalStudents.textContent = totalStudents;
  statPaidStudents.textContent = paidStudents;
  statUnpaidStudents.textContent = unpaidStudents;
  statRevenue.textContent = `$${estimatedRevenue.toLocaleString()}`;
  statFullAccounts.textContent = fullAccounts;
  statFreeAccounts.textContent = freeAccounts;

  if (totalStudents > 0) {
    const sorted = [...allStudents].sort((a, b) => getCreatedSortValue(b) - getCreatedSortValue(a));
    const newest = sorted[0];

    quickNewestStudent.textContent = `Newest Student: ${newest?.name || "—"}`;
    quickLatestCode.textContent = `Latest Code: ${newest?.accessCode || "—"}`;

    const paidRate = Math.round((paidStudents / totalStudents) * 100);
    quickPaidRate.textContent = `Paid Rate: ${paidRate}%`;

    const revenuePerStudent = estimatedRevenue / totalStudents;
    quickRevenuePerStudent.textContent = `Revenue / Student: $${revenuePerStudent.toFixed(2)}`;
  } else {
    quickNewestStudent.textContent = "Newest Student: —";
    quickLatestCode.textContent = "Latest Code: —";
    quickPaidRate.textContent = "Paid Rate: 0%";
    quickRevenuePerStudent.textContent = "Revenue / Student: $0";
  }
}

bossLoginBtn.addEventListener("click", () => {
  const entered = String(bossCodeInput.value || "").trim();

  if (entered !== BOSS_CODE) {
    showMessage(loginMessage, "Boss code is incorrect.", "error");
    return;
  }

  setLoggedIn(true);
  showMessage(loginMessage, "Access granted.", "success");
  showAdmin();
  loadStudents();
});

bossCodeInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") bossLoginBtn.click();
});

logoutBtn?.addEventListener("click", () => {
  setLoggedIn(false);
  showLogin();
});

if (isLoggedIn()) {
  showAdmin();
  loadStudents();
} else {
  showLogin();
}

async function createStudent() {
  showMessage(createMessage, "");

  const name = studentName.value.trim();
  const email = studentEmail.value.trim();
  const tier = normalizeTier(studentTier.value);
  const status = normalizeStatus(studentStatus.value);
  const paid = studentPaid.value === "true";
  const notes = studentNotes.value.trim();

  if (!name) {
    showMessage(createMessage, "Student name is required.", "error");
    return;
  }

  createStudentBtn.disabled = true;
  createStudentBtn.textContent = "Creating...";

  try {
    const studentId = makeStudentId(name);
    const accessCode = genCode(tier);
    const nowIso = new Date().toISOString();

    await setDoc(doc(db, "portalStudents", studentId), {
      studentId,
      name,
      email,
      accessCode,
      status,
      tier,
      paid,
      notes,
      progressLabel: "Not Started",
      completedLessons: [],
      progress: {
        lesson1: false,
        lesson2: false,
        lesson3: false,
        lesson4: false,
        lesson5: false,
        lesson6: false,
        lesson7: false,
        lesson8: false
      },
      createdAt: nowIso,
      updatedAt: nowIso
    });

    showMessage(createMessage, `Student created. Code: ${accessCode}`, "success");

    studentName.value = "";
    studentEmail.value = "";
    studentTier.value = "FULL";
    studentStatus.value = "active";
    studentPaid.value = "true";
    studentNotes.value = "";

    await loadStudents();
  } catch (error) {
    console.error("Create student failed:", error);
    showMessage(createMessage, "Failed to create student.", "error");
  } finally {
    createStudentBtn.disabled = false;
    createStudentBtn.textContent = "Create Student";
  }
}

createStudentBtn?.addEventListener("click", createStudent);
refreshBtn?.addEventListener("click", loadStudents);

async function loadStudents() {
  showMessage(tableMessage, "");
  studentsTableBody.innerHTML = `<tr><td colspan="7">Loading students...</td></tr>`;

  try {
    const q = query(collection(db, "portalStudents"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    allStudents = snap.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    updateStats();
    renderStudents();
  } catch (error) {
    console.error("Load students failed:", error);
    studentsTableBody.innerHTML = `<tr><td colspan="7">Failed to load students.</td></tr>`;
    showMessage(tableMessage, "Failed to load students.", "error");
  }
}

function renderStudents() {
  const term = String(searchInput.value || "").trim().toLowerCase();

  const filtered = !term
    ? allStudents
    : allStudents.filter(student => {
        return [
          student.name,
          student.email,
          student.accessCode,
          student.status,
          student.tier,
          student.studentId
        ].join(" ").toLowerCase().includes(term);
      });

  if (!filtered.length) {
    studentsTableBody.innerHTML = `<tr><td colspan="7">No students found.</td></tr>`;
    return;
  }

  studentsTableBody.innerHTML = filtered.map(student => {
    return `
      <tr>
        <td>
          <div><strong>${escapeHtml(student.name || "—")}</strong></div>
          <div>${escapeHtml(student.email || "—")}</div>
        </td>
        <td><span class="code">${escapeHtml(student.accessCode || "—")}</span></td>
        <td>${statusPill(student.status)}</td>
        <td>${escapeHtml(student.tier || "—")}</td>
        <td>${escapeHtml(String(!!student.paid))}</td>
        <td>${escapeHtml(student.studentId || student.id)}</td>
        <td>
          <div class="row-actions">
            <button class="btn-dark" data-action="copy" data-code="${escapeHtml(student.accessCode || "")}">Copy Code</button>
            <button class="btn-danger" data-action="delete" data-id="${escapeHtml(student.id)}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

searchInput?.addEventListener("input", renderStudents);

studentsTableBody?.addEventListener("click", async (event) => {
  const btn = event.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;

  if (action === "copy") {
    const code = btn.dataset.code || "";
    try {
      await navigator.clipboard.writeText(code);
      showMessage(tableMessage, `Copied code: ${code}`, "success");
    } catch {
      showMessage(tableMessage, `Code: ${code}`, "success");
    }
  }

  if (action === "delete") {
    const id = btn.dataset.id;
    if (!id) return;

    const ok = window.confirm("Delete this student?");
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "portalStudents", id));
      showMessage(tableMessage, "Student deleted.", "success");
      await loadStudents();
    } catch (error) {
      console.error("Delete failed:", error);
      showMessage(tableMessage, "Failed to delete student.", "error");
    }
  }
});
