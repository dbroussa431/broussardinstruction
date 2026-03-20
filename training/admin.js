import { db } from "./firebase-config.js?v=2";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(value) {
  if (!value) return "—";
  if (typeof value === "string") return value;
  if (value?.toDate && typeof value.toDate === "function") {
    try {
      return value.toDate().toLocaleString();
    } catch {
      return "Recently updated";
    }
  }
  return "—";
}

async function loadAdmin() {
  const totalStudentsEl = document.getElementById("totalStudents");
  const totalRevenueEl = document.getElementById("totalRevenue");
  const activeStudentsEl = document.getElementById("activeStudents");
  const completedOnlineEl = document.getElementById("completedOnline");
  const adminRowsEl = document.getElementById("adminRows");
  const adminErrorEl = document.getElementById("adminError");
  const refreshButton = document.getElementById("refreshAdmin");

  try {
    refreshButton.disabled = true;
    adminErrorEl.classList.add("hidden");
    adminRowsEl.innerHTML = `<tr><td colspan="7">Loading student records...</td></tr>`;

    const snap = await getDocs(collection(db, "portalStudents"));
    const students = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

    let totalRevenue = 0;
    let activeCount = 0;
    let completedCount = 0;

    const rows = students.map((s) => {
      const tier = String(s.tier || "").toUpperCase();
      const status = String(s.status || "").toLowerCase();
      const completedLessons = Array.isArray(s.completedLessons) ? s.completedLessons.length : 0;

      if (tier === "FULL") totalRevenue += 150;
      if (tier === "DISC") totalRevenue += 100;
      if (status === "active") activeCount++;
      if (completedLessons >= 8) completedCount++;

      return `
        <tr>
          <td>${escapeHtml(s.name || "—")}</td>
          <td class="cell-wrap">${escapeHtml(s.email || "—")}</td>
          <td class="cell-wrap">${escapeHtml(s.accessCode || "—")}</td>
          <td>${escapeHtml(tier || "—")}</td>
          <td>${escapeHtml(status || "—")}</td>
          <td>${completedLessons} / 8</td>
          <td class="cell-wrap">${escapeHtml(formatDate(s.lastLoginAt))}</td>
        </tr>
      `;
    }).join("");

    totalStudentsEl.textContent = String(students.length);
    totalRevenueEl.textContent = `$${totalRevenue}`;
    activeStudentsEl.textContent = String(activeCount);
    completedOnlineEl.textContent = String(completedCount);

    adminRowsEl.innerHTML = rows || `<tr><td colspan="7">No student records found.</td></tr>`;
  } catch (err) {
    console.error("ADMIN ERROR:", err);
    adminErrorEl.textContent = "Error loading admin dashboard.";
    adminErrorEl.classList.remove("hidden");
    adminRowsEl.innerHTML = `<tr><td colspan="7">Unable to load records.</td></tr>`;
  } finally {
    refreshButton.disabled = false;
  }
}

document.getElementById("refreshAdmin")?.addEventListener("click", loadAdmin);
loadAdmin();
