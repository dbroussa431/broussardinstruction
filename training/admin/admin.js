import { db } from '../js/firebase-config.js';
import {
  collection, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const snap = await getDocs(collection(db, "students"));

let total = 0;
let revenue = 0;

snap.forEach(doc => {
  total++;

  const s = doc.data();

  if (s.tier === "FULL") revenue += 150;
  if (s.tier === "DISC") revenue += 100;
});

document.getElementById("stats").innerHTML = `
Total Students: ${total}<br>
Revenue: $${revenue}
`;
