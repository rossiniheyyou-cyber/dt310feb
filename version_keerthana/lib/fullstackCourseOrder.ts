/**
 * Display order for Full Stack Web Development path.
 * React JS Essentials appears after JavaScript Fundamentals.
 */

export const FULLSTACK_DISPLAY_ORDER: (string | { title: string })[] = [
  "html-css",
  "javascript-fundamentals",
  { title: "React JS Essentials: From Zero to Interactive UIs" },
];

export function fullstackSortIndex(course: {
  id: string;
  title: string;
  courseOrder: number;
}): number {
  const idx = FULLSTACK_DISPLAY_ORDER.findIndex((key) => {
    if (typeof key === "string") return course.id === key || String(course.id) === key;
    return course.title.trim() === key.title;
  });
  return idx >= 0 ? idx : 999;
}

export function sortFullstackCourses<T extends { id: string; title: string; courseOrder: number }>(
  courses: T[]
): T[] {
  return [...courses].sort(
    (a, b) => fullstackSortIndex(a) - fullstackSortIndex(b) || a.courseOrder - b.courseOrder
  );
}
