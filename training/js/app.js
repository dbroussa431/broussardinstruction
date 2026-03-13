const lessons = [
  { id: 1, title: "Lesson 1", desc: "Safety Fundamentals" },
  { id: 2, title: "Lesson 2", desc: "Defensive Mindset & Awareness" },
  { id: 3, title: "Lesson 3", desc: "Firearm Basics" },
  { id: 4, title: "Lesson 4", desc: "Defensive Shooting Fundamentals" },
  { id: 5, title: "Lesson 5", desc: "Legal Use of Force" },
  { id: 6, title: "Lesson 6", desc: "Violent Encounters & Aftermath" },
  { id: 7, title: "Lesson 7", desc: "Scenarios & Decision Making" },
  { id: 8, title: "Lesson 8", desc: "Final Online Prerequisite Review" }
];

function getActiveStudent() {
  return JSON.parse(localStorage.getItem("bsa_active_student") || "null");
}

function getProgressKey(student) {
  return `bsa_progress_${student.code}`;
}

function getProgress(student) {
  const saved = localStorage.getItem(getProgressKey(student));
  if (saved) return JSON.parse(saved);

  const initial = lessons.map(l => ({
    lessonId: l.id,
    complete: false,
    lockedUntil: null,
    attempts: 0
  }));

  localStorage.setItem(getProgressKey(student), JSON.stringify(initial));
  return initial;
}

function saveProgress(student, progress) {
  localStorage.setItem(getProgressKey(student), JSON.stringify(progress));
}

function isLocked(item) {
  return item.lockedUntil && new Date(item.lockedUntil).getTime() > Date.now();
}

document.addEventListener("DOMContentLoaded", () => {
  const student = getActiveStudent();
  if (!student) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("studentName").textContent = student.name;
  document.getElementById("studentEmail").textContent = student.email;
  document.getElementById("studentType").textContent = student.type;
  document.getElementById("studentCode").textContent = `Code: ${student.code}`;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("bsa_active_student");
    window.location.href = "index.html";
  });

  const progress = getProgress(student);
  const completed = progress.filter(x => x.complete).length;
  const percent = Math.round((completed / lessons.length) * 100);

  document.getElementById("lessonCount").textContent = `${completed} / ${lessons.length}`;
  document.getElementById("progressFill").style.width = `${percent}%`;

  const list = document.getElementById("lessonList");
  list.innerHTML = "";

  lessons.forEach(lesson => {
    const p = progress.find(x => x.lessonId === lesson.id);

    let badgeClass = "inprogress";
    let badgeText = "Ready";

    if (p.complete) {
      badgeClass = "complete";
      badgeText = "Completed";
    } else if (isLocked(p)) {
      badgeClass = "locked";
      const mins = Math.ceil((new Date(p.lockedUntil).getTime() - Date.now()) / 60000);
      badgeText = `Locked (${mins} min left)`;
    }

    const item = document.createElement("div");
    item.className = "lesson-item";
    item.innerHTML = `
      <div class="lesson-meta">
        <h3>${lesson.title}</h3>
        <p>${lesson.desc}</p>
      </div>
      <div>
        <span class="badge ${badgeClass}">${badgeText}</span>
      </div>
    `;

    item.addEventListener("click", () => {
      if (isLocked(p)) return;
      window.location.href = `lesson.html?lesson=${lesson.id}`;
    });

    list.appendChild(item);
  });
});