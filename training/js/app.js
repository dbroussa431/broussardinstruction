const LESSON_TITLES = {
  1: "Firearm Safety Basics",
  2: "Defensive Mindset & Awareness",
  3: "Gun Operation & Ammunition",
  4: "Shooting Fundamentals",
  5: "Legal Use of Force",
  6: "Violent Encounters & Aftermath",
  7: "Home Defense Planning",
  8: "Final Review & Range Prep"
};

function renderDashboard() {
  const student = requireActiveStudent();
  if (!student) return;

  document.getElementById("studentName").textContent = student.name;
  document.getElementById("studentEmail").textContent = student.email;
  document.getElementById("studentType").textContent = student.codeType;
  document.getElementById("studentCode").textContent = `Code: ${student.code}`;

  const completed = Object.values(student.lessons).filter(l => l.passed).length;
  const percent = Math.round((completed / 8) * 100);
  document.getElementById("lessonCount").textContent = `${completed} / 8`;
  document.getElementById("progressFill").style.width = `${percent}%`;

  const listEl = document.getElementById("lessonList");
  listEl.innerHTML = "";
  for (let i = 1; i <= 8; i++) {
    const lesson = student.lessons[i];
    const access = isLessonAccessible(student, i);
    const lock = getLessonLockState(student, i);

    let badgeClass = "locked";
    let badgeText = "Locked";
    if (!access) {
      badgeClass = "locked";
      badgeText = "Complete previous lesson";
    } else if (lesson.passed) {
      badgeClass = "complete";
      badgeText = `Passed (${lesson.score}%)`;
    } else if (lock.locked && lock.kind === "timer") {
      badgeClass = "locked";
      badgeText = `Review lock: ${lock.text}`;
    } else if (lock.locked && lock.kind === "hard") {
      badgeClass = "locked";
      badgeText = "See instructor";
    } else if (lesson.contentViewed || lesson.scenarioCompleted) {
      badgeClass = "inprogress";
      badgeText = "In progress";
    } else {
      badgeClass = "inprogress";
      badgeText = "Ready";
    }

    const row = document.createElement("div");
    row.className = "lesson-item";
    row.innerHTML = `
      <div class="lesson-meta">
        <h3>${LESSON_TITLES[i]}</h3>
        <p>Attempts: ${lesson.attempts} ${lock.locked && lock.kind === "timer" ? `• Unlocks in ${lock.text}` : ""}</p>
      </div>
      <div><span class="badge ${badgeClass}">${badgeText}</span></div>
    `;
    if (access && !lock.locked) {
      row.addEventListener("click", () => {
        window.location.href = `lesson.html?lesson=${i}`;
      });
    }
    listEl.appendChild(row);
  }

  document.getElementById("logoutBtn").onclick = () => {
    clearActiveStudent();
    window.location.href = "index.html";
  };
}

function renderAdmin() {
  const table = document.getElementById("studentTableBody");
  if (!table) return;
  const state = getPortalState();
  table.innerHTML = "";

  state.students.forEach(student => {
    const completed = Object.values(student.lessons).filter(l => l.passed).length;
    const current = student.onlineComplete ? "Online Complete" : `Lesson ${student.currentLesson}`;
    let lockText = "No";
    for (let i = 1; i <= 8; i++) {
      const lock = getLessonLockState(student, i);
      if (lock.locked) {
        lockText = lock.kind === "hard" ? `Lesson ${i} - Instructor` : `Lesson ${i} - ${lock.text}`;
        break;
      }
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${student.name}</td>
      <td>${student.email}</td>
      <td>${student.code}</td>
      <td>${student.codeType}</td>
      <td>${student.paymentStatus}</td>
      <td>${current}</td>
      <td>${completed}/8</td>
      <td>${lockText}</td>
      <td>${student.onlineComplete ? "Yes" : "No"}</td>
    `;
    table.appendChild(row);
  });

  document.getElementById("adminCount").textContent = state.students.length;
  document.getElementById("adminPaid").textContent = state.students.filter(s => s.paymentStatus !== "Complimentary").length;
  document.getElementById("adminComplete").textContent = state.students.filter(s => s.onlineComplete).length;
}
