import { db } from "../js/firebase-config.js";
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

function genCode() {
  return "BSA-FULL-" + Math.floor(1000 + Math.random() * 9000);
}

document.getElementById("create").onclick = async () => {
  const id = "student-" + Date.now();
  const code = genCode();

  await setDoc(doc(db, "portalStudents", id), {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    accessCode: code,
    status: "active",
    tier: "FULL",
    paid: true
  });

  alert("Created: " + code);
};
