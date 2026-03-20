import { db } from "./firebase-config.js?v=1";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

async function loadAdmin() {
  const stats = document.getElementById("stats");

  try {
    const snap = await getDocs(collection(db, "portalStudents"));

    let total = 0;
    let revenue = 0;

    snap.forEach((docSnap) => {
      total++;
      const s = docSnap.data() || {};

      if (s.tier === "FULL") revenue += 150;
      if (s.tier === "DISC") revenue += 100;
    });

    stats.innerHTML = `
      Total Students: ${total}<br>
      Revenue: $${revenue}
    `;
  } catch (err) {
    console.error("ADMIN ERROR:", err);
    stats.textContent = "Error loading admin data.";
  }
}

loadAdmin();
