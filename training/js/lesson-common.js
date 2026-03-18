import { db } from './firebase-config.js';
import {
  doc, getDoc, setDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function completeLesson(lessonNumber) {
  const studentId = localStorage.getItem("studentId");

  const ref = doc(db, "progress", studentId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      completedLessons: [lessonNumber]
    });
  } else {
    const data = snap.data();
    const updated = [...new Set([...(data.completedLessons || []), lessonNumber])];

    await updateDoc(ref, {
      completedLessons: updated
    });
  }

  alert("Lesson Completed");
  window.location.href = "../dashboard.html";
}
