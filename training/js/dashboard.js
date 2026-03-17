import { db } from "./firebase-config.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const id = sessionStorage.getItem("studentId");

if (!id) {
  window.location.href = "index.html";
}

const ref = doc(db, "portalStudents", id);
const snap = await getDoc(ref);

if (!snap.exists()) {
  alert("Student not found");
  window.location.href = "index.html";
}

const data = snap.data();

document.getElementById("name").textContent = data.name;
document.getElementById("status").textContent = data.status;
document.getElementById("tier").textContent = data.tier;

document.getElementById("logout").onclick = () => {
  sessionStorage.clear();
  window.location.href = "index.html";
};
