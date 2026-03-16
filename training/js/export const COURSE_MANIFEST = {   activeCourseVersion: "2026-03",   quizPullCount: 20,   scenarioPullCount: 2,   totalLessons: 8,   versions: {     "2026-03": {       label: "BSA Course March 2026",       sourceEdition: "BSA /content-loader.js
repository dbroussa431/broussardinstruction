import { COURSE_MANIFEST } from "./course-manifest.js";

const lessonModuleMap = {
  "2026-03": {
    1: () => import("./content/2026-03/lesson-1.js"),
    2: () => import("./content/2026-03/lesson-2.js"),
    3: () => import("./content/2026-03/lesson-3.js"),
    4: () => import("./content/2026-03/lesson-4.js"),
    5: () => import("./content/2026-03/lesson-5.js"),
    6: () => import("./content/2026-03/lesson-6.js"),
    7: () => import("./content/2026-03/lesson-7.js"),
    8: () => import("./content/2026-03/lesson-8.js")
  }
};

export function getAssignedCourseVersion(student) {
  return String(
    student?.courseVersion ||
    COURSE_MANIFEST.activeCourseVersion
  ).trim();
}

export async function loadLessonContent(courseVersion, lessonNumber) {
  const versionMap = lessonModuleMap[courseVersion];
  if (!versionMap) {
    throw new Error(`Unknown course version: ${courseVersion}`);
  }

  const loader = versionMap[Number(lessonNumber)];
  if (!loader) {
    throw new Error(`Lesson ${lessonNumber} not found for version ${courseVersion}`);
  }

  const mod = await loader();
  return mod.LESSON;
}

export async function loadAllLessonsForStudent(student) {
  const courseVersion = getAssignedCourseVersion(student);
  const lessonNumbers = COURSE_MANIFEST.versions[courseVersion]?.lessons || [];
  const lessons = await Promise.all(
    lessonNumbers.map((lessonNumber) => loadLessonContent(courseVersion, lessonNumber))
  );
  return lessons;
}

export function pickRandomItems(items, count) {
  const arr = Array.isArray(items) ? [...items] : [];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(count, arr.length));
}
