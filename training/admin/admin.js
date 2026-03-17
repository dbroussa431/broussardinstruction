import { app, auth, db } from "../js/firebase-config.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   DOM
========================= */
const loginView = document.getElementById("loginView");
const adminApp = document.getElementById("adminApp");

const adminEmail = document.getElementById("adminEmail");
const adminPassword = document.getElementById("adminPassword");
const adminLoginBtn = document.getElementById("adminLoginBtn");
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
const clearFormBtn = document.getElementById("clearFormBtn");
const createMessage = document.getElementById("createMessage");

const searchInput = document.getElementById("searchInput");
const studentsTableBody = document.getElementById("studentsTableBody");
const tableMessage = document.getElementById("tableMessage");

/* =========================
   State
========================= */
let allStudents = [];

/* =========================
   Helpers
========================= */
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

function slugifyName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
}

function makeStudentId(name) {
  const base = slugifyName(name) || "student";
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${base}-${Date.now()}-${rand}`;
}

function normalizeTier(tier) {
  return String(tier || "FULL").trim().toUpperCase();
}

function normalizeStatus(status) {
  const value = String(status || "active").trim().toLowerCase();
  if (["active", "locked", "expired"].includes(value)) return value;
  return "active";
}

function generateAccessCode(tier = "FULL") {
  const cleanTier = normalizeTier(tier);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BSA-${cleanTier}-${rand}`;
}

function formatDate(value) {
  try {
    if (!value) return "—";

    if (typeof value?.toDate === "function") {
      return value.toDate().toLocaleString();
    }

    if (value instanceof Date) {
      return value.toLocaleString();
    }

    return new Date(value).toLocaleString();
  } catch {
    return "—";
  }
}

function clearCreateForm() {
  studentName.value = "";
  studentEmail.value = "";
  studentTier.value = "FULL";
  studentStatus.value = "active";
  studentPaid.value = "true";
  studentNotes.value = "";
  showMessage(createMessage, "");
}

function getPaidValue() {
  return studentPaid.value === "true";
}

function statusPillClass(status) {
  const s = normalizeStatus(status);
  return s;
}

function buildSearchBlob(student) {
  return [
    student.name,
    student.email,
    student.accessCode,
    student.tier,
    student.status,
    student.studentId
  ].join(" ").toLowerCase();
}

/* =========================
   Auth
========================= */
async function handleAdminLogin() {
  showMessage(loginMessage, "");

  const email = adminEmail.value.trim();
  const password = adminPassword.value;

  if (!email || !password) {
    showMessage(loginMessage, "Enter email and password.", "error");
    return;
  }

  adminLoginBtn.disabled = true;
  adminLoginBtn.textContent = "Signing In...";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showMessage(loginMessage, "Signed in.", "success");
  } catch (error) {
    console.error("Admin login failed:", error);
    showMessage(loginMessage, error.message || "Login failed.", "error");
  } finally {
    adminLoginBtn.disabled = false;
    adminLoginBtn.textContent = "Sign In";
  }
}

async function handleLogout() {
  await signOut(auth);
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    loginView.style.display = "none";
    adminApp.style.display = "block";
    await loadStudents();
  } else {
    loginView.style.display = "block";
    adminApp.style.display = "none";
    studentsTableBody.innerHTML = `<tr><td colspan="8">Please sign in.</td></tr>`;
  }
});

/* =========================
   Firestore CRUD
========================= */
async function createStudent() {
  showMessage(createMessage, "");
  const name = studentName.value.trim();
  const email = studentEmail.value.trim();
  const tier = normalizeTier(studentTier.value);
  const status = normalizeStatus(studentStatus.value);
  const paid = getPaidValue();
  const notes = studentNotes.value.trim();

  if (!name) {
    showMessage(createMessage, "Student name is required.", "error");
    return;
  }

  const studentId = makeStudentId(name);
  const accessCode = generateAccessCode(tier);

  createStudentBtn.disabled = true;
  createStudentBtn.textContent = "Creating...";

  try {
    const batch = writeBatch(db);

    const portalStudentRef = doc(db, "portalStudents", studentId);
    const portalAccessRef = doc(db, "portalAccess", studentId);

    batch.set(portalStudentRef, {
      studentId,
      name,
      email,
      paid,
      status,
      tier,
      accessCode,
      notes,
      completedLessons: [],
      progress: {},
      progressLabel: "Not Started",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    batch.set(portalAccessRef, {
      studentId,
      accessCode,
      status,
      tier,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await batch.commit();

    showMessage(
      createMessage,
      `Student created successfully. Access code: ${accessCode}`,
      "success"
    );

    clearCreateForm();
    await loadStudents();
  } catch (error) {
    console.error("Create student failed:", error);
    showMessage(createMessage, error.message || "Failed to create student.", "error");
  } finally {
    createStudentBtn.disabled = false;
    createStudentBtn.textContent = "Create Student";
  }
}

async function loadStudents() {
  showMessage(tableMessage, "");
  studentsTableBody.innerHTML = `<tr><td colspan="8">Loading students...</td></tr>`;

  try {
    const q = query(collection(db, "portalStudents"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    allStudents = snap.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));

    renderStudents();
  } catch (error) {
    console.error("Load students failed:", error);
    studentsTableBody.innerHTML = `<tr><td colspan="8">Failed to load students.</td></tr>`;
    showMessage(tableMessage, error.message || "Unable to load students.", "error");
  }
}

function renderStudents() {
  const term = searchInput.value.trim().toLowerCase();

  const filtered = !term
    ? allStudents
    : allStudents.filter((student) => buildSearchBlob(student).includes(term));

  if (!filtered.length) {
    studentsTableBody.innerHTML = `<tr><td colspan="8">No students found.</td></tr>`;
    return;
  }

  studentsTableBody.innerHTML = filtered.map((student) => {
    const status = normalizeStatus(student.status);
    const tier = normalizeTier(student.tier);
    const paid = student.paid ? "true" : "false";

    return `
      <tr>
        <td>
          <div><strong>${escapeHtml(student.name || "—")}</strong></div>
          <div>${escapeHtml(student.email || "—")}</div>
        </td>
        <td>
          <div class="code">${escapeHtml(student.accessCode || "—")}</div>
        </td>
        <td>
          <span class="pill ${statusPillClass(status)}">${escapeHtml(status)}</span>
        </td>
        <td>${escapeHtml(tier)}</td>
        <td>${escapeHtml(paid)}</td>
        <td>${escapeHtml(student.studentId || student.id)}</td>
        <td>${escapeHtml(formatDate(student.createdAt))}</td>
        <td>
          <div class="row-actions">
            <button class="btn-success" data-action="save" data-id="${escapeHtml(student.id)}">Save</button>
            <button class="btn-dark" data-action="regen" data-id="${escapeHtml(student.id)}">New Code</button>
            <button class="btn-danger" data-action="delete" data-id="${escapeHtml(student.id)}">Delete</button>
          </div>

          <div class="mini-edit">
            <select data-field="status" data-id="${escapeHtml(student.id)}">
              <option value="active" ${status === "active" ? "selected" : ""}>active</option>
              <option value="locked" ${status === "locked" ? "selected" : ""}>locked</option>
              <option value="expired" ${status === "expired" ? "selected" : ""}>expired</option>
            </select>

            <select data-field="tier" data-id="${escapeHtml(student.id)}">
              <option value="FULL" ${tier === "FULL" ? "selected" : ""}>FULL</option>
              <option value="FREE" ${tier === "FREE" ? "selected" : ""}>FREE</option>
              <option value="BASIC" ${tier === "BASIC" ? "selected" : ""}>BASIC</option>
            </select>

            <select data-field="paid" data-id="${escapeHtml(student.id)}">
              <option value="true" ${paid === "true" ? "selected" : ""}>true</option>
              <option value="false" ${paid === "false" ? "selected" : ""}>false</option>
            </select>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

async function saveStudent(studentId) {
  const statusSelect = document.querySelector(`select[data-field="status"][data-id="${CSS.escape(studentId)}"]`);
  const tierSelect = document.querySelector(`select[data-field="tier"][data-id="${CSS.escape(studentId)}"]`);
  const paidSelect = document.querySelector(`select[data-field="paid"][data-id="${CSS.escape(studentId)}"]`);

  if (!statusSelect || !tierSelect || !paidSelect) return;

  const status = normalizeStatus(statusSelect.value);
  const tier = normalizeTier(tierSelect.value);
  const paid = paidSelect.value === "true";

  try {
    const batch = writeBatch(db);

    const privateRef = doc(db, "portalStudents", studentId);
    const publicRef = doc(db, "portalAccess", studentId);

    batch.update(privateRef, {
      status,
      tier,
      paid,
      updatedAt: serverTimestamp()
    });

    batch.update(publicRef, {
      status,
      tier,
      updatedAt: serverTimestamp()
    });

    await batch.commit();
    showMessage(tableMessage, "Student updated.", "success");
    await loadStudents();
  } catch (error) {
    console.error("Save student failed:", error);
    showMessage(tableMessage, error.message || "Failed to save student.", "error");
  }
}

async function regenerateStudentCode(studentId) {
  const student = allStudents.find((s) => s.id === studentId);
  if (!student) return;

  const newCode = generateAccessCode(student.tier || "FULL");

  try {
    const batch = writeBatch(db);

    const privateRef = doc(db, "portalStudents", studentId);
    const publicRef = doc(db, "portalAccess", studentId);

    batch.update(privateRef, {
      accessCode: newCode,
      updatedAt: serverTimestamp()
    });

    batch.update(publicRef, {
      accessCode: newCode,
      updatedAt: serverTimestamp()
    });

    await batch.commit();
    showMessage(tableMessage, `New code generated: ${newCode}`, "success");
    await loadStudents();
  } catch (error) {
    console.error("Regenerate code failed:", error);
    showMessage(tableMessage, error.message || "Failed to generate new code.", "error");
  }
}

async function deleteStudent(studentId) {
  const student = allStudents.find((s) => s.id === studentId);
  const label = student?.name || studentId;

  const ok = window.confirm(`Delete student "${label}"?\n\nThis removes both private and access records.`);
  if (!ok) return;

  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, "portalStudents", studentId));
    batch.delete(doc(db, "portalAccess", studentId));
    await batch.commit();

    showMessage(tableMessage, "Student deleted.", "success");
    await loadStudents();
  } catch (error) {
    console.error("Delete student failed:", error);
    showMessage(tableMessage, error.message || "Failed to delete student.", "error");
  }
}

/* =========================
   Events
========================= */
adminLoginBtn.addEventListener("click", handleAdminLogin);

adminPassword.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleAdminLogin();
});

logoutBtn.addEventListener("click", handleLogout);
refreshBtn.addEventListener("click", loadStudents);

createStudentBtn.addEventListener("click", createStudent);
clearFormBtn.addEventListener("click", clearCreateForm);

searchInput.addEventListener("input", renderStudents);

studentsTableBody.addEventListener("click", async (e) => {
  const button = e.target.closest("button[data-action]");
  if (!button) return;

  const action = button.dataset.action;
  const studentId = button.dataset.id;

  if (!studentId) return;

  if (action === "save") {
    await saveStudent(studentId);
  } else if (action === "regen") {
    await regenerateStudentCode(studentId);
  } else if (action === "delete") {
    await deleteStudent(studentId);
  }
});
