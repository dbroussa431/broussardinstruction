import { auth, db } from "../firebase-config.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const loginSection = document.getElementById("loginSection");
const appSection = document.getElementById("appSection");
const loginForm = document.getElementById("loginForm");
const loginMsg = document.getElementById("loginMsg");

const studentForm = document.getElementById("studentForm");
const saveMsg = document.getElementById("saveMsg");
const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");
const refreshCodesBtn = document.getElementById("refreshCodesBtn");

const studentsTableBody = document.getElementById("studentsTableBody");
const portalStudentsTableBody = document.getElementById("portalStudentsTableBody");

const searchInput = document.getElementById("searchInput");
const codeSearchInput = document.getElementById("codeSearchInput");

const totalStudents = document.getElementById("totalStudents");
const totalPortalStudents = document.getElementById("totalPortalStudents");
const currentInstructorStat = document.getElementById("currentInstructorStat");

const printBlankCertificateBtn = document.getElementById("printBlankCertificateBtn");

const codeForm = document.getElementById("codeForm");
const codeMsg = document.getElementById("codeMsg");
const generatedCodeBox = document.getElementById("generatedCodeBox");

let allStudents = [];
let allPortalStudents = [];

function showMessage(el, msg, isError = false) {
  el.textContent = msg;
  el.style.color = isError ? "#b00020" : "#0f9d58";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function random4() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function generateAccessCode(tier) {
  return `BSA-${String(tier || "FULL").toUpperCase()}-${random4()}`;
}

function openCertificate(student) {
  const fullName = `${student.firstName || ""} ${student.lastName || ""}`.trim();
  const course = student.course || "Louisiana Concealed Carry";
  const completionDate = student.completionDate || "";
  const instructor = student.instructor || "David Broussard";

  const certWindow = window.open("", "_blank", "width=1100,height=850");

  if (!certWindow) {
    alert("Popup blocked. Please allow popups for certificate generation.");
    return;
  }

  certWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Certificate of Completion</title>
      <style>
        body {
          margin: 0;
          font-family: Georgia, serif;
          background: #f5f1e8;
          color: #111;
        }
        .page {
          width: 11in;
          min-height: 8.5in;
          margin: 0 auto;
          background: #fffdf8;
          padding: 0.55in;
          box-sizing: border-box;
        }
        .certificate {
          height: 100%;
          border: 10px solid #c18b2f;
          padding: 34px 44px;
          box-sizing: border-box;
          background:
            linear-gradient(rgba(255,255,255,0.97), rgba(255,255,255,0.97)),
            radial-gradient(circle at top right, rgba(193,139,47,0.12), transparent 28%);
        }
        .academy {
          text-align: center;
          font-size: 16px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #7a5b1a;
          margin-top: 8px;
        }
        .title {
          text-align: center;
          font-size: 42px;
          margin: 18px 0 10px;
          font-weight: bold;
        }
        .subtitle {
          text-align: center;
          font-size: 18px;
          margin: 10px 0 28px;
          color: #444;
        }
        .presented {
          text-align: center;
          font-size: 18px;
          margin-top: 18px;
        }
        .name {
          text-align: center;
          font-size: 40px;
          margin: 18px 0;
          color: #111;
          font-weight: bold;
          border-bottom: 2px solid #c18b2f;
          padding-bottom: 8px;
        }
        .course-line {
          text-align: center;
          font-size: 22px;
          margin: 22px 0 14px;
        }
        .desc {
          text-align: center;
          font-size: 18px;
          line-height: 1.6;
          max-width: 760px;
          margin: 0 auto 34px;
        }
        .footer {
          display: flex;
          justify-content: space-between;
          gap: 30px;
          margin-top: 60px;
        }
        .sig {
          flex: 1;
          text-align: center;
        }
        .line {
          border-top: 2px solid #111;
          margin-bottom: 8px;
          height: 1px;
        }
        .sig-label {
          font-size: 16px;
        }
        .printbar {
          text-align: center;
          padding: 14px;
        }
        .printbar button {
          background: #111;
          color: #fff;
          border: none;
          padding: 10px 18px;
          font-size: 15px;
          border-radius: 8px;
          cursor: pointer;
          margin: 0 6px;
        }
        @media print {
          .printbar { display: none; }
          body { background: #fff; }
          .page {
            margin: 0;
            width: auto;
            min-height: auto;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="printbar">
        <button onclick="window.print()">Print / Save PDF</button>
        <button onclick="window.close()">Close</button>
      </div>

      <div class="page">
        <div class="certificate">
          <div class="academy">Broussard Shooting Academy</div>
          <div class="title">Certificate of Completion</div>
          <div class="subtitle">Official Training Record</div>

          <div class="presented">This certifies that</div>
          <div class="name">${escapeHtml(fullName)}</div>

          <div class="course-line">has successfully completed</div>

          <div class="desc">
            <strong>${escapeHtml(course)}</strong><br>
            under the instruction and authority of Broussard Shooting Academy.
          </div>

          <div class="footer">
            <div class="sig">
              <div class="line"></div>
              <div class="sig-label">
                ${escapeHtml(instructor)}<br>
                Instructor
              </div>
            </div>
            <div class="sig">
              <div class="line"></div>
              <div class="sig-label">
                ${escapeHtml(completionDate)}<br>
                Completion Date
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);

  certWindow.document.close();
}

function renderStudents(students) {
  totalStudents.textContent = String(students.length);

  if (!students.length) {
    studentsTableBody.innerHTML = `<tr><td colspan="7">No student records yet.</td></tr>`;
    return;
  }

  studentsTableBody.innerHTML = "";

  for (const student of students) {
    const row = document.createElement("tr");

    const certButton = document.createElement("button");
    certButton.type = "button";
    certButton.className = "btn-gold";
    certButton.textContent = "Generate Certificate";
    certButton.addEventListener("click", () => openCertificate(student));

    const certTd = document.createElement("td");
    certTd.className = "row-actions";
    certTd.appendChild(certButton);

    row.innerHTML = `
      <td>${escapeHtml(student.firstName)}</td>
      <td>${escapeHtml(student.lastName)}</td>
      <td>${escapeHtml(student.course)}</td>
      <td>${escapeHtml(student.completionDate)}</td>
      <td>${escapeHtml(student.instructor)}</td>
      <td>${escapeHtml(student.email)}</td>
    `;

    row.appendChild(certTd);
    studentsTableBody.appendChild(row);
  }
}

function applyStudentSearch() {
  const term = (searchInput.value || "").trim().toLowerCase();

  if (!term) {
    renderStudents(allStudents);
    return;
  }

  const filtered = allStudents.filter((student) => {
    const haystack = [
      student.firstName,
      student.lastName,
      student.course,
      student.completionDate,
      student.instructor,
      student.email
    ].join(" ").toLowerCase();

    return haystack.includes(term);
  });

  renderStudents(filtered);
}

function renderPortalStudents(students) {
  totalPortalStudents.textContent = String(students.length);

  if (!students.length) {
    portalStudentsTableBody.innerHTML = `<tr><td colspan="6">No portal codes loaded yet.</td></tr>`;
    return;
  }

  portalStudentsTableBody.innerHTML = "";

  for (const student of students) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(student.name)}</td>
      <td>${escapeHtml(student.email)}</td>
      <td>${escapeHtml(student.accessCode)}</td>
      <td>${escapeHtml(student.tier)}</td>
      <td>${student.paid ? "Yes" : "No"}</td>
      <td>${escapeHtml(student.status)}</td>
    `;
    portalStudentsTableBody.appendChild(row);
  }
}

function applyCodeSearch() {
  const term = (codeSearchInput.value || "").trim().toLowerCase();

  if (!term) {
    renderPortalStudents(allPortalStudents);
    return;
  }

  const filtered = allPortalStudents.filter((student) => {
    const haystack = [
      student.name,
      student.email,
      student.accessCode,
      student.tier,
      student.status,
      student.paid ? "yes" : "no"
    ].join(" ").toLowerCase();

    return haystack.includes(term);
  });

  renderPortalStudents(filtered);
}

async function loadStudents() {
  studentsTableBody.innerHTML = `<tr><td colspan="7">Loading...</td></tr>`;

  try {
    const q = query(collection(db, "students"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    allStudents = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    applyStudentSearch();
  } catch (err) {
    console.error("Error loading students:", err);
    studentsTableBody.innerHTML = `<tr><td colspan="7">Error loading students.</td></tr>`;
  }
}

async function loadPortalStudents() {
  portalStudentsTableBody.innerHTML = `<tr><td colspan="6">Loading...</td></tr>`;

  try {
    const q = query(collection(db, "portalStudents"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    allPortalStudents = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    applyCodeSearch();
  } catch (err) {
    console.error("Error loading portal students:", err);
    portalStudentsTableBody.innerHTML = `<tr><td colspan="6">Error loading portal codes.</td></tr>`;
  }
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginMsg.textContent = "";

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showMessage(loginMsg, "Login successful.");
  } catch (err) {
    console.error("Login error:", err);
    showMessage(loginMsg, err.message, true);
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Logout error:", err);
    alert("Logout failed.");
  }
});

studentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  saveMsg.textContent = "";

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const course = document.getElementById("course").value.trim();
  const completionDate = document.getElementById("completionDate").value.trim();
  const instructor = document.getElementById("instructor").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!firstName || !lastName || !course || !completionDate || !instructor) {
    showMessage(saveMsg, "Please fill in all required fields.", true);
    return;
  }

  try {
    await addDoc(collection(db, "students"), {
      firstName,
      lastName,
      course,
      completionDate,
      instructor,
      email,
      createdAt: serverTimestamp()
    });

    showMessage(saveMsg, "Student record saved.");
    studentForm.reset();

    document.getElementById("course").value = "Louisiana Concealed Carry";
    document.getElementById("instructor").value = "David Broussard";
    currentInstructorStat.textContent = "David Broussard";

    await loadStudents();
  } catch (err) {
    console.error("Save error:", err);
    showMessage(saveMsg, err.message, true);
  }
});

codeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  codeMsg.textContent = "";
  generatedCodeBox.style.display = "none";
  generatedCodeBox.textContent = "";

  const name = document.getElementById("codeName").value.trim();
  const email = document.getElementById("codeEmail").value.trim().toLowerCase();
  const tier = document.getElementById("codeTier").value;
  const paid = document.getElementById("codePaid").value === "true";

  if (!name || !email) {
    showMessage(codeMsg, "Name and email are required.", true);
    return;
  }

  const accessCode = generateAccessCode(tier);

  try {
    await addDoc(collection(db, "portalStudents"), {
      name,
      email,
      accessCode,
      tier,
      paid,
      status: "active",
      progress: {},
      completedLessons: [],
      createdAt: serverTimestamp()
    });

    showMessage(codeMsg, "Access code created successfully.");
    generatedCodeBox.textContent = `Student Code: ${accessCode}`;
    generatedCodeBox.style.display = "block";
    codeForm.reset();

    await loadPortalStudents();
  } catch (err) {
    console.error("Code generation error:", err);
    showMessage(codeMsg, err.message, true);
  }
});

refreshBtn.addEventListener("click", loadStudents);
refreshCodesBtn.addEventListener("click", loadPortalStudents);

searchInput.addEventListener("input", applyStudentSearch);
codeSearchInput.addEventListener("input", applyCodeSearch);

printBlankCertificateBtn.addEventListener("click", () => {
  openCertificate({
    firstName: "Student",
    lastName: "Name",
    course: document.getElementById("course").value.trim() || "Louisiana Concealed Carry",
    completionDate: document.getElementById("completionDate").value.trim() || "03/13/2026",
    instructor: document.getElementById("instructor").value.trim() || "David Broussard",
    email: ""
  });
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    loginSection.style.display = "none";
    appSection.style.display = "block";
    await loadStudents();
    await loadPortalStudents();
  } else {
    loginSection.style.display = "block";
    appSection.style.display = "none";
    studentsTableBody.innerHTML = "";
    portalStudentsTableBody.innerHTML = "";
    allStudents = [];
    allPortalStudents = [];
  }
});
