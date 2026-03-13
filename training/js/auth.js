const demoStudents = [
  { code: "BSA-FULL-4821", type: "FULL", paid: true, boundTo: null },
  { code: "BSA-DISC-1184", type: "DISC", paid: true, boundTo: null },
  { code: "BSA-FREE-7742", type: "FREE", paid: true, boundTo: null }
];

function getStudents() {
  const saved = localStorage.getItem("bsa_students");
  if (saved) return JSON.parse(saved);
  localStorage.setItem("bsa_students", JSON.stringify(demoStudents));
  return demoStudents;
}

function saveStudents(students) {
  localStorage.setItem("bsa_students", JSON.stringify(students));
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("studentName").value.trim();
    const email = document.getElementById("studentEmail").value.trim().toLowerCase();
    const code = document.getElementById("accessCode").value.trim().toUpperCase();
    const msg = document.getElementById("loginMessage");

    const students = getStudents();
    const record = students.find(s => s.code === code);

    if (!record) {
      msg.className = "portal-message error";
      msg.textContent = "Invalid access code. Contact instructor.";
      return;
    }

    if (record.boundTo && record.boundTo.email !== email) {
      msg.className = "portal-message error";
      msg.textContent = "This code is already assigned. Contact instructor.";
      return;
    }

    if (!record.boundTo) {
      record.boundTo = { name, email };
      saveStudents(students);
    }

    const activeStudent = {
      name,
      email,
      code,
      type: record.type,
      paid: record.paid
    };

    localStorage.setItem("bsa_active_student", JSON.stringify(activeStudent));

    msg.className = "portal-message success";
    msg.textContent = "Access granted. Loading dashboard...";

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 700);
  });
});