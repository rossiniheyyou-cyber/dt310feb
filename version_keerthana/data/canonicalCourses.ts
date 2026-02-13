/**
 * Canonical Course Data - Single source of truth for Instructor and Learner.
 * Instructor creates/edits here. Learner consumes Published courses only.
 * No duplicate data — same modules and content appear in both views.
 */

export const ROLES = [
  "Full Stack Developer",
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

// Mock canonical courses — Instructor creates these, Learner consumes when Published
const _canonicalCourses: CanonicalCourse[] = [
  {
    id: "prog-basics",
    title: "Programming Basics",
    description: "Introduction to programming concepts, variables, control flow, and problem-solving.",
    thumbnail: "/image.png",
    estimatedDuration: "2 weeks",
    status: "published",
    roles: ["Full Stack Developer"],
    phase: "Foundation",
    courseOrder: 1,
    prerequisiteCourseIds: [],
    instructor: { name: "Sarah Chen", role: "Senior Developer" },
    skills: ["Variables", "Loops", "Functions"],
    pathSlug: "fullstack",
    lastUpdated: "2025-01-28",
    enrolledCount: 42,
    completionRate: 78,
    createdAt: "2024-10-01",
    modules: [
      {
        id: "m1",
        title: "Introduction to Programming",
        order: 0,
        chapters: [
          { id: "c1", type: "video", title: "Welcome Video", url: "https://example.com/v1", duration: "15 min", published: true, order: 0 },
          { id: "c2", type: "pdf", title: "Syllabus PDF", url: "/docs/syllabus.pdf", published: true, order: 1 },
        ],
        completionRules: [{ type: "watch_videos" }],
      },
      {
        id: "m2",
        title: "Variables and Data Types",
        order: 1,
        chapters: [
          { id: "c3", type: "video", title: "Variables Overview", url: "https://example.com/v2", duration: "20 min", published: true, order: 0 },
        ],
        completionRules: [{ type: "watch_videos" }],
      },
      {
        id: "m3",
        title: "Module Quiz",
        order: 2,
        chapters: [],
        completionRules: [{ type: "pass_quiz", config: { passScore: 70 } }],
        attachedQuizId: "q1",
        passScore: 70,
      },
    ],
  },
  {
    id: "rest-api",
    title: "REST API Development",
    description: "Design and build RESTful APIs.",
    thumbnail: "/image.png",
    estimatedDuration: "3 weeks",
    status: "published",
    roles: ["Full Stack Developer"],
    phase: "Advanced",
    courseOrder: 5,
    prerequisiteCourseIds: ["prog-basics"],
    instructor: { name: "Sarah Chen", role: "Senior Developer" },
    skills: ["REST", "API Design"],
    pathSlug: "fullstack",
    lastUpdated: "2025-01-30",
    enrolledCount: 28,
    completionRate: 45,
    createdAt: "2024-11-15",
    modules: [
      {
        id: "m1",
        title: "REST Principles",
        order: 0,
        chapters: [
          { id: "c1", type: "video", title: "REST Overview", url: "https://example.com/rest", duration: "30 min", published: true, order: 0 },
          { id: "c2", type: "link", title: "API Design Guide", url: "https://restfulapi.net", published: true, order: 1 },
        ],
        completionRules: [{ type: "watch_videos" }],
      },
    ],
  },
  {
    id: "html-css",
    title: "HTML & CSS Fundamentals",
    description: "Build structured, styled web pages.",
    thumbnail: "/image.png",
    estimatedDuration: "3 weeks",
    status: "published",
    roles: ["Full Stack Developer"],
    phase: "Intermediate",
    courseOrder: 3,
    prerequisiteCourseIds: ["web-fundamentals"],
    instructor: { name: "Emma Davis", role: "UI Engineer" },
    skills: ["HTML5", "CSS3", "Responsive Design"],
    pathSlug: "fullstack",
    lastUpdated: "2025-01-25",
    enrolledCount: 35,
    completionRate: 72,
    createdAt: "2024-12-01",
    modules: [
      {
        id: "m1",
        title: "HTML Document Structure",
        order: 0,
        chapters: [
          { id: "c1", type: "video", title: "HTML Basics", url: "https://example.com/html", duration: "20 min", published: true, order: 0 },
          { id: "c2", type: "ppt", title: "Slides", url: "/slides/html.pptx", published: true, order: 1 },
        ],
        completionRules: [{ type: "watch_videos" }],
      },
    ],
  },
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
  return _canonicalCourses.filter(
    (c) => c.pathSlug === pathSlug && c.status === "published"
  );
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
