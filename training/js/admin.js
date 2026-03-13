const API_URL = "api/admin-api.php";

async function apiRequest(action, payload = {}, method = "POST") {
  let url = API_URL + `?action=${encodeURIComponent(action)}`;
  const options = { method, headers: { "Content-Type": "application/json" } };

  if (method === "GET") {
    const params = new URLSearchParams(payload);
    if ([...params.keys()].length) url += `&${params.toString()}`;
  } else {
    options.body = JSON.stringify(payload);
  }

  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data.message || "Request failed.");
  }
  return data;
}

function showResult(el, message, isError = false) {
  if (!el) return;
  el.style.display = "block";
  el.classList.toggle("result-error", isError);
  el.textContent = message;
}

function studentRow(s) {
  const completed = Array.isArray(s.completedLessons) ? s.completedLessons.length : 0;
  return `
    <tr>
      <td>${s.name || ""}</td>
      <td>${s.email || ""}</td>
      <td><strong>${s.code || ""}</strong></td>
      <td>${s.tier || ""}</td>
      <td>$${s.amountDue ?? 0}</td>
      <td><span class="pill ${s.paid ? "paid" : "unpaid"}">${s.paid ? "PAID" : "UNPAID"}</span></td>
      <td>${completed}</td>
      <td>${s.status || "active"}</td>
    </tr>
  `;
}

async function renderStudents() {
  const wrap = document.getElementById("studentTableWrap");
  if (!wrap) return;
  wrap.innerHTML = `<p class="muted">Loading students...</p>`;

  try {
    const data = await apiRequest("list_students", {}, "GET");
    const students = data.students || [];

    if (!students.length) {
      wrap.innerHTML = `<p class="muted">No students created yet.</p>`;
      return;
    }

    wrap.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Code</th>
            <th>Tier</th>
            <th>Amount</th>
            <th>Paid</th>
            <th>Completed</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${students.map(studentRow).join("")}
        </tbody>
      </table>
    `;
  } catch (err) {
    wrap.innerHTML = `<p class="muted">${err.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const createBtn = document.getElementById("createCodeBtn");
  const createResult = document.getElementById("createResult");
  const unlockResult = document.getElementById("unlockResult");

  createBtn?.addEventListener("click", async () => {
    try {
      const name = document.getElementById("studentName").value.trim();
      const email = document.getElementById("studentEmail").value.trim();
      const tier = document.getElementById("studentTier").value;
      const paid = document.getElementById("studentPaid").value === "true";

      if (!name || !email) {
        showResult(createResult, "Student name and email are required.", true);
        return;
      }

      const data = await apiRequest("create_student", { name, email, tier, paid });
      const s = data.student;
      showResult(
        createResult,
        `Code created successfully:\n\n${s.code}\n${s.name} — ${s.email}\nTier: ${s.tier} | Amount: $${s.amountDue} | ${s.paid ? "PAID" : "UNPAID"}`
      );
      await renderStudents();
    } catch (err) {
      showResult(createResult, err.message, true);
    }
  });

  document.getElementById("unlockLessonBtn")?.addEventListener("click", async () => {
    try {
      const email = document.getElementById("unlockEmail").value.trim();
      const lessonId = document.getElementById("unlockLessonId").value.trim();
      await apiRequest("unlock_lesson", { email, lessonId });
      showResult(unlockResult, `Lesson ${lessonId} unlocked for ${email}.`);
      await renderStudents();
    } catch (err) {
      showResult(unlockResult, err.message, true);
    }
  });

  document.getElementById("forceOverrideBtn")?.addEventListener("click", async () => {
    try {
      const email = document.getElementById("unlockEmail").value.trim();
      const lessonId = document.getElementById("unlockLessonId").value.trim();
      await apiRequest("require_override", { email, lessonId, required: true });
      showResult(unlockResult, `Instructor override required for ${lessonId} on ${email}.`);
      await renderStudents();
    } catch (err) {
      showResult(unlockResult, err.message, true);
    }
  });

  document.getElementById("markPaidBtn")?.addEventListener("click", async () => {
    try {
      const email = document.getElementById("unlockEmail").value.trim();
      await apiRequest("mark_paid", { email, paid: true });
      showResult(unlockResult, `${email} marked paid.`);
      await renderStudents();
    } catch (err) {
      showResult(unlockResult, err.message, true);
    }
  });

  document.getElementById("issueNewCodeBtn")?.addEventListener("click", async () => {
    try {
      const email = document.getElementById("unlockEmail").value.trim();
      const data = await apiRequest("issue_new_code", { email });
      showResult(unlockResult, `New code issued for ${email}: ${data.student.code}`);
      await renderStudents();
    } catch (err) {
      showResult(unlockResult, err.message, true);
    }
  });

  document.getElementById("refreshStudentsBtn")?.addEventListener("click", renderStudents);

  renderStudents();
});
