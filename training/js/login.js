import { db } from "./firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById("loginForm");
const input = document.getElementById("accessCode");
const message = document.getElementById("message");

function normalize(v) {
  return String(v || "").trim().toUpperCase();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const code = normalize(input.value);

  if (!code) {
    message.textContent = "Enter code";
    return;
  }

  const q = query(
    collection(db, "portalStudents"),
    where("accessCode", "==", code),
    limit(1)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    message.textContent = "Invalid code";
    return;
  }

  const student = snap.docs[0].data();

  if ((student.status || "").toLowerCase() !== "active") {
    message.textContent = "Code not active";
    return;
  }

  sessionStorage.setItem("studentId", snap.docs[0].id);
  sessionStorage.setItem("accessCode", code);

  window.location.href = "dashboard.html";
});
