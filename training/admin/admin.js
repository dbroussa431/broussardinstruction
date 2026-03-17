import { auth, db } from "../js/firebase-config.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const BOSS_CODE = "BSA-BOSS-67676";
const TOTAL_LESSONS = 8;

const loginScreen = document.getElementById("loginScreen");
const adminApp = document.getElementById("adminApp");

const adminEmail = document.getElementById("adminEmail");
const adminPassword = document.getElementById("adminPassword");
const bossCode = document.getElementById("bossCode");
const signInBtn = document.getElementById("signInBtn");
const loginMessage = document.getElementById("loginMessage");

const refreshBtn = document.getElementById("refreshBtn");
const logoutBtn = document.getElementById("logoutBtn");

const studentName = document.getElementById("studentName");
const studentEmail = document.getElementById("studentEmail");
const studentTier = document.getElementById("studentTier");
const studentStatus = document.getElementById("studentStatus");
const studentPaid = document.getElementById("studentPaid");
const studentProgressLabel = document.getElementById("studentProgressLabel");
const studentNotes = document.getElementById("studentNotes");
const createStudentBtn = document.getElementById("createStudentBtn");
const clearFormBtn = document.getElementById("clearFormBtn");
const createMessage = document.getElementById("createMessage");

const searchInput = document.getElementById("searchInput");
const studentsTableBody = document.getElementById("studentsTableBody");
const tableMessage = document.getElementById("tableMessage");

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

function normalizeTier(value) {
  const v = String(value || "FULL").trim().toUpperCase();
  return ["FULL", "FREE", "BASIC"].includes(v) ? v : "FULL";
}

function normalizeStatus(value) {
  const v = String(value || "active").trim().toLowerCase();
  return ["active", "locked", "expired"].includes(v) ? v : "active";
}

function parsePaid(value) {
  return String(value) === "true";
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

function generateAccessCode(tier = "FULL") {
  const cleanTier = normalizeTier(tier);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BSA-${cleanTier}-${rand}`;
}

function makeEmptyProgress() {
  return {
    lesson1: false,
    lesson2: false,
    lesson3: false,
    lesson4: false,
    lesson5: false,
    lesson6: false,
    lesson7: false,
    lesson8: false
  };
}

function normalizeLessonArray(rawValue) {
  return String(rawValue || "")
    .split(",")
    .map(v => v.trim().toLowerCase())
    .filter(Boolean)
    .filter(v => /^lesson[1-8]$/.test(v));
}

function formatDate(value) {
  try {
    if (!value) return "—";
    if (typeof value?.toDate === "function") return value.toDate().toLocaleString();
    return new Date(value).toLocaleString();
  } catch {
    return "—";
  }
}

function buildSearchBlob(student) {
  return [
    student.name,
    student.email,
    student.accessCode,
    student.status,
    student.tier,
    student.studentId,
    student.progressLabel
  ].join(" ").toLowerCase();
}

function clearCreateForm() {
  studentName.value = "";
  studentEmail.value = "";
  studentTier.value = "FULL";
  studentStatus.value = "active";
  studentPaid.value = "true";
  studentProgressLabel.value = "Not Started";
  studentNotes.value = "";
  showMessage(createMessage, "");
}

function statusPill(status) {
  const s = normalizeStatus(status);
  return `<span class="pill ${s}">${escapeHtml(s)}</span>`;
}

function getCompletedLessons(student) {
  if (Array.isArray(student.completedLessons)) {
    return student.completedLessons.map(v => String(v).trim().toLowerCase());
  }
  return [];
}

async function handleSignIn() {
  showMessage(loginMessage, "");

  const email = adminEmail.value.trim();
  const password = adminPassword.value;
  const code = bossCode.value.trim();

  if (!email || !password || !code) {
    showMessage(loginMessage, "Enter admin email, password, and boss code.", "error");
    return;
  }

  if (code !== BOSS_CODE) {
    showMessage(loginMessage, "Boss code is incorrect.", "error");
    return;
  }

  signInBtn.disabled = true;
  signInBtn.textContent = "Signing In...";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    sessionStorage.setItem("bsaBossPassed", "true");
  } catch (error) {
    console.error(error);
    showMessage(loginMessage, error.message || "Sign-in failed.", "error");
  } finally {
    signInBtn.disabled = false;
    signInBtn.textContent = "Sign In";
  }
}

async function handleLogout() {
  sessionStorage.removeItem("bsaBossPassed");
  await signOut(auth);
}

onAuthStateChanged(auth, async (user) => {
  const bossPassed = sessionStorage.getItem("bsaBossPassed") === "true";

  if (user && bossPassed) {
    loginScreen.classList.add("hidden");
    adminApp.classList.remove("hidden");
    await loadStudents();
  } else {
    loginScreen.classList.remove("hidden");
    adminApp.classList.add("hidden");
  }
});

async function createStudent() {
  showMessage(createMessage, "");

  const name = studentName.value.trim();
  const email = studentEmail.value.trim();
  const tier = normalizeTier(studentTier.value);
  const status = normalizeStatus(studentStatus.value);
  const paid = parsePaid(studentPaid.value);
  const progressLabel = studentProgressLabel.value.trim() || "Not Started";
  const notes = studentNotes.value.trim();

  if (!name) {
    showMessage(createMessage, "Student name is required.", "error");
    return;
  }

  createStudentBtn.disabled = true;
  createStudentBtn.textContent = "Creating...";

  try {
    const studentId = makeStudentId(name);
    const accessCode = generateAccessCode(tier);
    const progress = makeEmptyProgress();
    const completedLessons = [];

    const batch = writeBatch(db);

    batch.set(doc(db, "portalStudents", studentId), {
      studentId,
      name,
      email,
      accessCode,
      tier,
      status,
      paid,
      notes,
      progress,
      completedLessons,
      progressLabel,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    batch.set(doc(db, "portalAccess", studentId), {
      studentId,
      accessCode,
      tier,
      status,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    batch.set(doc(db, "portalStudentView", studentId), {
      studentId,
      name,
      accessCode,
      tier,
      status,
      progressLabel,
      completedLessons,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await batch.commit();

    showMessage(createMessage, `Student created. Access code: ${accessCode}`, "success");
    clearCreateForm();
    await loadStudents();
  } catch (error) {
    console.error(error);
    showMessage(createMessage, error.message || "Failed to create student.", "error");
  } finally {
    createStudentBtn.disabled = false;
    createStudentBtn.textContent = "Create Student";
  }
}

async function loadStudents() {
  showMessage(tableMessage, "");
  studentsTableBody.innerHTML = `<tr><td colspan="9">Loading students...</td></tr>`;

  try {
    const q = query(collection(db, "portalStudents"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    allStudents = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    renderStudents();
  } catch (error) {
    console.error(error);
    studentsTableBody.innerHTML = `<tr><td colspan="9">Failed to load students.</td></tr>`;
    showMessage(tableMessage, error.message || "Unable to load students.", "error");
  }
}

function renderStudents() {
  const term = searchInput.value.trim().toLowerCase();
  const filtered = !term
    ? allStudents
    : allStudents.filter(student => buildSearchBlob(student).includes(term));

  if (!filtered.length) {
    studentsTableBody.innerHTML = `<tr><td colspan="9">No students found.</td></tr>`;
    return;
  }

  studentsTableBody.innerHTML = filtered.map(student => {
    const completedLessons = getCompletedLessons(student);

    return `
      <tr>
        <td>
          <div><strong>${escapeHtml(student.name || "—")}</strong></div>
          <div>${escapeHtml(student.email || "—")}</div>
          <div style="margin-top:6px;color:#cbd5e1;">Created: ${escapeHtml(formatDate(student.createdAt))}</div>
        </td>

        <td>
          <div class="code">${escapeHtml(student.accessCode || "—")}</div>
          <div class="mini-grid-2">
            <input type="text" data-field="manualCode" data-id="${escapeHtml(student.id)}" placeholder="Manual code override" />
            <input type="text" data-field="progressLabel" data-id="${escapeHtml(student.id)}" value="${escapeHtml(student.progressLabel || "")}" />
          </div>
        </td>

        <td>
          ${statusPill(student.status)}
          <div class="mini-grid">
            <select data-field="status" data-id="${escapeHtml(student.id)}">
              <option value="active" ${normalizeStatus(student.status) === "active" ? "selected" : ""}>active</option>
              <option value="locked" ${normalizeStatus(student.status) === "locked" ? "selected" : ""}>locked</option>
              <option value="expired" ${normalizeStatus(student.status) === "expired" ? "selected" : ""}>expired</option>
            </select>

            <select data-field="tier" data-id="${escapeHtml(student.id)}">
              <option value="FULL" ${normalizeTier(student.tier) === "FULL" ? "selected" : ""}>FULL</option>
              <option value="FREE" ${normalizeTier(student.tier) === "FREE" ? "selected" : ""}>FREE</option>
              <option value="BASIC" ${normalizeTier(student.tier) === "BASIC" ? "selected" : ""}>BASIC</option>
            </select>

            <select data-field="paid" data-id="${escapeHtml(student.id)}">
              <option value="true" ${student.paid === true ? "selected" : ""}>true</option>
              <option value="false" ${student.paid === false ? "selected" : ""}>false</option>
            </select>
          </div>
        </td>

        <td>${escapeHtml(normalizeTier(student.tier))}</td>
        <td>${escapeHtml(String(!!student.paid))}</td>
        <td>${escapeHtml(student.progressLabel || "Not Started")}</td>
        <td>
          <input
            type="text"
            data-field="completedLessons"
            data-id="${escapeHtml(student.id)}"
            value="${escapeHtml(completedLessons.join(", "))}"
            placeholder="lesson1, lesson2"
          />
        </td>
        <td>${escapeHtml(student.studentId || student.id)}</td>
        <td>
          <div class="row-actions">
            <button class="btn-success" data-action="save" data-id="${escapeHtml(student.id)}">Save</button>
            <button class="btn-dark" data-action="regen" data-id="${escapeHtml(student.id)}">New Code</button>
            <button class="btn-danger" data-action="delete" data-id="${escapeHtml(student.id)}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

async function saveStudent(studentId) {
  const statusEl = document.querySelector(`select[data-field="status"][data-id="${CSS.escape(studentId)}"]`);
  const tierEl = document.querySelector(`select[data-field="tier"][data-id="${CSS.escape(studentId)}"]`);
  const paidEl = document.querySelector(`select[data-field="paid"][data-id="${CSS.escape(studentId)}"]`);
  const progressLabelEl = document.querySelector(`input[data-field="progressLabel"][data-id="${CSS.escape(studentId)}"]`);
  const completedLessonsEl = document.querySelector(`input[data-field="completedLessons"][data-id="${CSS.escape(studentId)}"]`);
  const manualCodeEl = document.querySelector(`input[data-field="manualCode"][data-id="${CSS.escape(studentId)}"]`);

  if (!statusEl || !tierEl || !paidEl || !progressLabelEl || !completedLessonsEl || !manualCodeEl) {
    showMessage(tableMessage, "Could not find row fields.", "error");
    return;
  }

  const status = normalizeStatus(statusEl.value);
  const tier = normalizeTier(tierEl.value);
  const paid = parsePaid(paidEl.value);
  const progressLabel = progressLabelEl.value.trim() || "Not Started";
  const completedLessons = normalizeLessonArray(completedLessonsEl.value);
  const manualCode = manualCodeEl.value.trim().toUpperCase();

  const progress = makeEmptyProgress();
  completedLessons.forEach(id => {
    progress[id] = true;
  });

  const privatePayload = {
    status,
    tier,
    paid,
    progressLabel,
    completedLessons,
    progress,
    updatedAt: serverTimestamp()
  };

  const accessPayload = {
    status,
    tier,
    updatedAt: serverTimestamp()
  };

  const studentViewPayload = {
    status,
    tier,
    progressLabel,
    completedLessons,
    updatedAt: serverTimestamp()
  };

  if (manualCode) {
    privatePayload.accessCode = manualCode;
    accessPayload.accessCode = manualCode;
    studentViewPayload.accessCode = manualCode;
  }

  try {
    const batch = writeBatch(db);

    batch.update(doc(db, "portalStudents", studentId), privatePayload);
    batch.update(doc(db, "portalAccess", studentId), accessPayload);
    batch.update(doc(db, "portalStudentView", studentId), studentViewPayload);

    await batch.commit();

    showMessage(tableMessage, "Student updated.", "success");
    await loadStudents();
  } catch (error) {
    console.error(error);
    showMessage(tableMessage, error.message || "Failed to save student.", "error");
  }
}

async function regenerateCode(studentId) {
  const student = allStudents.find(s => s.id === studentId);
  if (!student) return;

  const newCode = generateAccessCode(student.tier || "FULL");

  try {
    const batch = writeBatch(db);
    batch.update(doc(db, "portalStudents", studentId), {
      accessCode: newCode,
      updatedAt: serverTimestamp()
    });
    batch.update(doc(db, "portalAccess", studentId), {
      accessCode: newCode,
      updatedAt: serverTimestamp()
    });
    batch.update(doc(db, "portalStudentView", studentId), {
      accessCode: newCode,
      updatedAt: serverTimestamp()
    });

    await batch.commit();

    showMessage(tableMessage, `New access code generated: ${newCode}`, "success");
    await loadStudents();
  } catch (error) {
    console.error(error);
    showMessage(tableMessage, error.message || "Failed to generate code.", "error");
  }
}

async function deleteStudent(studentId) {
  const student = allStudents.find(s => s.id === studentId);
  const label = student?.name || studentId;

  const ok = window.confirm(`Delete student "${label}"?\n\nThis will remove portalStudents, portalAccess, and portalStudentView.`);
  if (!ok) return;

  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, "portalStudents", studentId));
    batch.delete(doc(db, "portalAccess", studentId));
    batch.delete(doc(db, "portalStudentView", studentId));
    await batch.commit();

    showMessage(tableMessage, "Student deleted.", "success");
    await loadStudents();
  } catch (error) {
    console.error(error);
    showMessage(tableMessage, error.message || "Failed to delete student.", "error");
  }
}

signInBtn.addEventListener("click", handleSignIn);
adminPassword.addEventListener("keydown", (e) => { if (e.key === "Enter") handleSignIn(); });
bossCode.addEventListener("keydown", (e) => { if (e.key === "Enter") handleSignIn(); });

logoutBtn.addEventListener("click", handleLogout);
refreshBtn.addEventListener("click", loadStudents);
createStudentBtn.addEventListener("click", createStudent);
clearFormBtn.addEventListener("click", clearCreateForm);
searchInput.addEventListener("input", renderStudents);

studentsTableBody.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  const studentId = btn.dataset.id;
  if (!studentId) return;

  if (action === "save") await saveStudent(studentId);
  if (action === "regen") await regenerateCode(studentId);
  if (action === "delete") await deleteStudent(studentId);
});
