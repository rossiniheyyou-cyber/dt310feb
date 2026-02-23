/**
 * Canonical Course Data - Single source of truth for Instructor and Learner.
 * Instructor creates/edits here. Learner consumes Published courses only.
 * No duplicate data — same modules and content appear in both views.
 */

export const ROLES = [
  "Full Stack Web Development",
  "UI / UX Designer",
  "Data Analyst / Engineer",
  "Cloud & DevOps Engineer",
  "QA Engineer",
  "Digital Marketing",
] as const;

export const PHASES = [
  "Foundation",
  "Intermediate",
  "Advanced",
  "Capstone",
] as const;

export const COURSE_STATUS = ["draft", "pending_approval", "published", "archived", "rejected"] as const;
export type CourseStatus = (typeof COURSE_STATUS)[number];

export const CONTENT_TYPES = ["video", "pdf", "ppt", "link"] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const MODULE_COMPLETION_RULES = [
  "watch_videos",
  "pass_quiz",
  "submit_assignment",
] as const;

export type ContentItem = {
  id: string;
  type: ContentType;
  title: string;
  url: string;
  duration?: string;
  published: boolean;
  order: number;
};

export type ModuleCompletionRule = {
  type: "watch_videos" | "pass_quiz" | "submit_assignment";
  config?: { assessmentId?: string; passScore?: number };
};

export type CanonicalModule = {
  id: string;
  title: string;
  order: number;
  chapters: ContentItem[];
  completionRules: ModuleCompletionRule[];
  attachedQuizId?: string;
  attachedAssignmentId?: string;
  passScore?: number;
};

export type CanonicalCourse = {
  id: string;
  backendId?: string; // Backend database ID (numeric as string)
  title: string;
  description: string;
  videoUrl?: string; // Instructor-provided video link; learner plays via ReactPlayer
  thumbnail?: string;
  estimatedDuration: string;
  status: CourseStatus;
  roles: string[];
  phase: string;
  courseOrder: number;
  prerequisiteCourseIds: string[];
  modules: CanonicalModule[];
  instructor: { name: string; role: string };
  skills: string[];
  pathSlug: string;
  lastUpdated: string;
  enrolledCount: number;
  completionRate: number;
  createdAt: string;
};

// HTML & CSS course — Full Stack Developer path (only course for fullstack)
const HTML_CSS_COURSE: CanonicalCourse = {
  id: "html-css",
  title: "HTML & CSS",
  description: "Master the foundations of web development. Learn HTML structure, forms, CSS basics, selectors, semantics, Chrome DevTools, and layout techniques to build structured, styled web pages.",
  thumbnail: "/image.png",
  estimatedDuration: "3–4 hours",
  status: "published",
  roles: ["Full Stack Web Development"],
  phase: "Foundation",
  courseOrder: 1,
  prerequisiteCourseIds: [],
  instructor: { name: "Emma Davis", role: "UI Engineer" },
  skills: ["HTML5", "CSS3", "Forms", "Semantics", "DevTools", "Layout"],
  pathSlug: "fullstack",
  lastUpdated: "2025-02-16",
  enrolledCount: 35,
  completionRate: 72,
  createdAt: "2024-12-01",
  modules: [
    {
      id: "m1",
      title: "Introduction",
      order: 0,
      chapters: [
        { id: "c1", type: "video", title: "Introduction", url: "https://youtu.be/hu-q2zYwEYs", duration: "15 min", published: true, order: 0 },
      ],
      completionRules: [{ type: "watch_videos" }],
    },
    {
      id: "m2",
      title: "HTML Tags & Structure",
      order: 1,
      chapters: [
        { id: "c2", type: "video", title: "HTML Tags & Structure", url: "https://youtu.be/mbeT8mpmtHA", duration: "20 min", published: true, order: 0 },
      ],
      completionRules: [{ type: "watch_videos" }],
    },
    {
      id: "m3",
      title: "Forms & Inputs",
      order: 2,
      chapters: [
        { id: "c3", type: "video", title: "Forms & Inputs", url: "https://youtu.be/YwbIeMlxZAU", duration: "18 min", published: true, order: 0 },
      ],
      completionRules: [{ type: "watch_videos" }],
    },
    {
      id: "m4",
      title: "CSS Basics",
      order: 3,
      chapters: [
        { id: "c4", type: "video", title: "CSS Basics", url: "https://youtu.be/D3iEE29ZXRM", duration: "22 min", published: true, order: 0 },
      ],
      completionRules: [{ type: "watch_videos" }],
    },
    {
      id: "m5-quiz",
      title: "HTML & Forms Quiz",
      order: 4,
      chapters: [],
      completionRules: [{ type: "pass_quiz", config: { passScore: 70 } }],
      attachedQuizId: "html-css-mid",
      passScore: 70,
    },
    {
      id: "m6",
      title: "CSS Classes & Selectors",
      order: 5,
      chapters: [
        { id: "c5", type: "video", title: "CSS Classes & Selectors", url: "https://youtu.be/FHZn6706e3Q", duration: "25 min", published: true, order: 0 },
      ],
      completionRules: [{ type: "watch_videos" }],
    },
    {
      id: "m7",
      title: "HTML Semantics",
      order: 6,
      chapters: [
        { id: "c6", type: "video", title: "HTML Semantics", url: "https://youtu.be/kGW8Al_cga4", duration: "20 min", published: true, order: 0 },
      ],
      completionRules: [{ type: "watch_videos" }],
    },
    {
      id: "m8",
      title: "Chrome Dev Tools",
      order: 7,
      chapters: [
        { id: "c7", type: "video", title: "Chrome Dev Tools", url: "https://youtu.be/25R1Jl5P7Mw", duration: "18 min", published: true, order: 0 },
      ],
      completionRules: [{ type: "watch_videos" }],
    },
    {
      id: "m9",
      title: "CSS Layout & Position",
      order: 8,
      chapters: [
        { id: "c8", type: "video", title: "CSS Layout & Position", url: "https://youtu.be/XQaHAAXIVg8", duration: "24 min", published: true, order: 0 },
      ],
      completionRules: [{ type: "watch_videos" }],
    },
    {
      id: "m10-assign",
      title: "Final Assessment: Personal Portfolio Page",
      order: 9,
      chapters: [],
      completionRules: [{ type: "submit_assignment", config: { assessmentId: "html-css-final" } }],
      attachedAssignmentId: "html-css-final",
    },
  ],
};

// JavaScript Fundamentals course — Full Stack Developer path
const JS_FUNDAMENTALS_COURSE: CanonicalCourse = {
  id: "javascript-fundamentals",
  title: "JavaScript Fundamentals",
  description: "Build a solid foundation in JavaScript. Learn variables, functions, arrays, objects, DOM manipulation, and event handling. Master the core concepts that power modern web development.",
  thumbnail: "/image.png",
  estimatedDuration: "2–3 hours",
  status: "published",
  roles: ["Full Stack Web Development"],
  phase: "Foundation",
  courseOrder: 2,
  prerequisiteCourseIds: ["html-css"],
  instructor: { name: "Emma Davis", role: "Full Stack Engineer" },
  skills: ["JavaScript", "Variables", "Functions", "Arrays", "Objects", "DOM", "Events"],
  pathSlug: "fullstack",
  lastUpdated: "2025-02-16",
  enrolledCount: 0,
  completionRate: 0,
  createdAt: "2025-02-16",
  modules: [
    {
      id: "m1",
      title: "JavaScript Part 1",
      order: 0,
      chapters: [
        { id: "c1", type: "video", title: "JavaScript Fundamentals Part 1", url: "https://youtu.be/0ik6X4DJKCc", duration: "30 min", published: true, order: 0 },
      ],
      completionRules: [{ type: "watch_videos" }],
    },
    {
      id: "m2",
      title: "JavaScript Part 2",
      order: 1,
      chapters: [
        { id: "c2", type: "video", title: "JavaScript Fundamentals Part 2", url: "https://youtu.be/mPd2aJXCZ2g", duration: "35 min", published: true, order: 0 },
      ],
      completionRules: [{ type: "watch_videos" }],
    },
    {
      id: "m3",
      title: "JavaScript Part 3",
      order: 2,
      chapters: [
        { id: "c3", type: "video", title: "JavaScript Fundamentals Part 3", url: "https://youtu.be/wK2cBMcDTss", duration: "35 min", published: true, order: 0 },
      ],
      completionRules: [{ type: "watch_videos" }],
    },
    {
      id: "m4-quiz",
      title: "JavaScript Basics Quiz",
      order: 3,
      chapters: [],
      completionRules: [{ type: "pass_quiz", config: { passScore: 70 } }],
      attachedQuizId: "js-fundamentals-mid",
      passScore: 70,
    },
    {
      id: "m5-assign",
      title: "Final Assessment: Interactive JavaScript Project",
      order: 4,
      chapters: [],
      completionRules: [{ type: "submit_assignment", config: { assessmentId: "js-fundamentals-final" } }],
      attachedAssignmentId: "js-fundamentals-final",
    },
  ],
};

// Course metadata for overview page (outcomes, total hours)
export const COURSE_OVERVIEW_META: Record<string, { outcomes: string[]; totalHours: number }> = {
  "javascript-fundamentals": {
    outcomes: [
      "Understand variables, data types, and operators in JavaScript",
      "Write functions and work with arrays and objects",
      "Manipulate the DOM and handle user events",
      "Build interactive web applications with vanilla JavaScript",
      "Complete an interactive JavaScript project as a capstone",
    ],
    totalHours: 2.5,
  },
  "html-css": {
    outcomes: [
      "Build well-structured HTML documents with semantic elements",
      "Create accessible forms with proper input types and validation",
      "Style pages with CSS using classes, selectors, and layout techniques",
      "Use Chrome DevTools for debugging and inspecting pages",
      "Apply CSS positioning and layout for responsive designs",
      "Complete a personal portfolio page as a capstone project",
    ],
    totalHours: 3.5,
  },
};

// Final assessment problem statements (for assignments)
export const ASSESSMENT_PROBLEMS: Record<string, string> = {
  "html-css-final": `
**Personal Portfolio Page**

Using everything you learned in this course (HTML structure, semantics, forms, CSS basics, classes, selectors, layout, and positioning), build a single-page personal portfolio website.

**Requirements:**
1. Use semantic HTML5 elements (header, nav, main, section, article, footer)
2. Include a contact form with: name, email, and message fields
3. Apply CSS for styling: typography, colors, spacing, and a simple layout
4. Use at least one flexbox or grid layout
5. Make it visually appealing and well-organized
6. Test your page in Chrome DevTools

**Submission:** Upload your HTML and CSS files (or share a link to your deployed page). Your work will be auto-graded by AI based on the requirements above.
  `.trim(),
  "js-fundamentals-final": `
**Interactive JavaScript Project**

Using everything you learned in this course (variables, functions, arrays, objects, DOM manipulation, events), build a small interactive web application.

**Requirements:**
1. Create an HTML page with a clear structure
2. Use JavaScript to add at least 3 interactive features (e.g., button click handlers, form validation, dynamic content updates)
3. Use functions to organize your code
4. Use at least one array or object to store and display data
5. Manipulate the DOM (create, update, or remove elements)
6. Handle at least one user event (click, input, submit, etc.)

**Examples:** To-do list, calculator, simple quiz, counter app, or similar.

**Submission:** Upload your HTML and JavaScript files (or share a link). Your work will be auto-graded by AI based on the requirements above.
  `.trim(),
};

// Mock canonical courses — Instructor creates these, Learner consumes when Published
const _canonicalCourses: CanonicalCourse[] = [
  HTML_CSS_COURSE,
  JS_FUNDAMENTALS_COURSE,
  {
    id: "new-course-draft",
    title: "Docker & Containerization",
    description: "Container concepts and Docker.",
    thumbnail: "/image.png",
    estimatedDuration: "2 weeks",
    status: "draft",
    roles: ["Cloud & DevOps Engineer"],
    phase: "Intermediate",
    courseOrder: 6,
    prerequisiteCourseIds: [],
    instructor: { name: "Instructor", role: "Tech Lead" },
    skills: ["Docker", "Containers"],
    pathSlug: "cloud-devops",
    lastUpdated: "2025-01-31",
    enrolledCount: 0,
    completionRate: 0,
    createdAt: "2025-01-30",
    modules: [],
  },
];

// Convert canonical module to learner-facing Module format (used by CourseDetailClient)
export type LearnerModule = {
  id: string;
  title: string;
  type: "video" | "reading" | "assignment" | "quiz";
  duration?: string;
  locked?: boolean;
  completed?: boolean;
  videoUrl?: string;
  resources?: { type: string; label: string }[];
};

export function toLearnerModules(modules: CanonicalModule[]): LearnerModule[] {
  const items: LearnerModule[] = [];
  modules
    .sort((a, b) => a.order - b.order)
    .forEach((mod) => {
      let modHasContent = false;
      mod.chapters
        .filter((c) => c.published)
        .sort((a, b) => a.order - b.order)
        .forEach((ch) => {
          modHasContent = true;
          if (ch.type === "video") {
            items.push({
              id: `${mod.id}-ch-${ch.id}`,
              title: ch.title,
              type: "video",
              duration: ch.duration,
              videoUrl: ch.url,
            });
          } else {
            items.push({
              id: `${mod.id}-ch-${ch.id}`,
              title: ch.title,
              type: "reading",
              duration: ch.duration,
              resources: [{ type: ch.type, label: ch.title }],
            });
          }
        });
      if (mod.attachedQuizId || mod.completionRules.some((r) => r.type === "pass_quiz")) {
        modHasContent = true;
        items.push({
          id: `${mod.id}-quiz`,
          title: `${mod.title} - Quiz`,
          type: "quiz",
          duration: "10 min",
        });
      }
      if (mod.attachedAssignmentId || mod.completionRules.some((r) => r.type === "submit_assignment")) {
        modHasContent = true;
        items.push({
          id: `${mod.id}-assign`,
          title: `${mod.title} - Assignment`,
          type: "assignment",
          duration: "45 min",
        });
      }
      if (!modHasContent) {
        items.push({ id: mod.id, title: mod.title, type: "reading" });
      }
    });
  return items;
}

export function getCoursesForInstructor(): CanonicalCourse[] {
  return [..._canonicalCourses].sort(
    (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
  );
}

/** Initial data for store hydration (single source of truth). */
export function getInitialCanonicalCourses(): CanonicalCourse[] {
  return JSON.parse(JSON.stringify(_canonicalCourses));
}

export function getPublishedCoursesForPath(pathSlug: string): CanonicalCourse[] {
  const filtered = _canonicalCourses.filter(
    (c) => c.pathSlug === pathSlug && c.status === "published"
  );
  // Full Stack Developer path: show HTML & CSS and JavaScript Fundamentals
  if (pathSlug === "fullstack") {
    return filtered.filter((c) => c.id === "html-css" || c.id === "javascript-fundamentals");
  }
  return filtered;
}

export function getCourseById(id: string): CanonicalCourse | undefined {
  return _canonicalCourses.find((c) => c.id === id);
}

export function getAvailableAssessments(): { id: string; title: string; type: string }[] {
  return [
    { id: "q1", title: "Programming Quiz", type: "quiz" },
    { id: "q2", title: "REST API Quiz", type: "quiz" },
    { id: "a1", title: "Build REST API", type: "assignment" },
  ];
}
