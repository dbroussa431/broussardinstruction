import { db } from './firebase-config.js';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const studentId = localStorage.getItem("studentId");
const lessonNumber = 1; // change per page

let startTime = Date.now();

// Start session
const sessionRef = await addDoc(collection(db, "sessions"), {
  studentId,
  lesson: lessonNumber,
  startTime: serverTimestamp()
});

document.getElementById("completeBtn").onclick = async () => {
  const endTime = Date.now();
  const duration = Math.floor((endTime - startTime) / 1000);

  // Update session
  await updateDoc(sessionRef, {
    endTime: serverTimestamp(),
    durationSeconds: duration
  });

  const progressRef = doc(db, "progress", studentId);
  const progressSnap = await getDoc(progressRef);

  if (!progressSnap.exists()) {
    await setDoc(progressRef, {
      studentId,
      completedLessons: [lessonNumber],
      totalTimeSeconds: duration,
      lastLesson: lessonNumber
    });
  } else {
    const data = progressSnap.data();

    const updatedLessons = [...new Set([
      ...data.completedLessons,
      lessonNumber
    ])];

    await updateDoc(progressRef, {
      completedLessons: updatedLessons,
      totalTimeSeconds: (data.totalTimeSeconds || 0) + duration,
      lastLesson: lessonNumber
    });
  }

  alert("Lesson Complete");
};
