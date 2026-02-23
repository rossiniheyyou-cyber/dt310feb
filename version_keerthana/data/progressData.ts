// Comprehensive Progress Data for Learner Dashboard

export type ReadinessStatus = "On Track" | "Needs Attention" | "At Risk";
export type ModuleStatus = "completed" | "in_progress" | "locked" | "not_started";
export type ResourceType = "video" | "pdf" | "ppt" | "reading" | "quiz" | "assignment";

export interface ProgressOverviewData {
  overallCompletion: number;
  readinessStatus: ReadinessStatus;
  targetRole: string;
  learningPathProgress: number;
  totalEnrolledCourses: number;
  completedCourses: number;
  totalAssignments: number;
  completedAssignments: number;
  totalQuizzes: number;
  passedQuizzes: number;
  averageQuizScore: number;
  totalLearningHours: number;
  weeklyTarget: number;
  currentWeekHours: number;
  currentStreak: number;
}

export interface PhaseProgress {
  id: string;
  name: string;
  totalCourses: number;
  completedCourses: number;
  status: "completed" | "in_progress" | "locked";
}

export interface LearningPathProgressData {
  pathId: string;
  pathTitle: string;
  description: string;
  totalDuration: string;
  overallProgress: number;
  enrolledDate: string;
  expectedCompletion: string;
  phases: PhaseProgress[];
}

export interface ModuleProgress {
  id: string;
  title: string;
  type: ResourceType;
  duration: string;
  status: ModuleStatus;
  watchProgress?: number; // for videos
  resourcesAccessed?: { type: string; accessed: boolean }[];
  completedAt?: string;
}

export interface CourseProgressDetail {
  id: string;
  title: string;
  instructor: string;
  completionPercentage: number;
  modulesCompleted: number;
  totalModules: number;
  timeSpent: string;
  estimatedTime: string;
  status: "completed" | "in_progress" | "not_started";
  lastAccessed: string;
  modules: ModuleProgress[];
  dueDate?: string;
}

export interface AssignmentProgressItem {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  status: "not_started" | "in_progress" | "submitted" | "reviewed" | "rework_required";
  score?: number;
  maxScore?: number;
  feedback?: string;
  dueDate: string;
  submittedAt?: string;
}

export interface QuizProgressItem {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  status: "pending" | "attempted" | "passed" | "failed";
  score?: number;
  passingScore: number;
  attempts: number;
  maxAttempts: number;
  lastAttemptDate?: string;
}

export interface SkillProgress {
  id: string;
  name: string;
  category: string;
  currentLevel: number;
  targetLevel: number;
  proficiency: "beginner" | "intermediate" | "advanced" | "expert";
  relatedCourses: string[];
  hasGap: boolean;
}

export interface WeeklyActivity {
  day: string;
  date: string;
  hours: number;
  coursesAccessed: number;
  assignmentsCompleted: number;
  quizzesTaken: number;
}

export interface TimeActivityData {
  totalHoursThisWeek: number;
  totalHoursThisMonth: number;
  averageDailyHours: number;
  weeklyTrend: { week: string; hours: number }[];
  dailyActivity: WeeklyActivity[];
  activitySummary: {
    videosWatched: number;
    assignmentsSubmitted: number;
    quizzesCompleted: number;
    resourcesDownloaded: number;
  };
}

export interface CertificateProgress {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  status: "earned" | "in_progress" | "locked";
  earnedDate?: string;
  expiryDate?: string;
  requirements: { label: string; completed: boolean }[];
  progress: number;
}

export interface ComplianceItem {
  id: string;
  title: string;
  type: "assigned" | "recommended";
  dueDate: string;
  status: "completed" | "in_progress" | "overdue" | "not_started";
  completedDate?: string;
}

export interface NextStepItem {
  id: string;
  type: "assignment" | "course" | "quiz" | "module" | "skill";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  dueDate?: string;
  link: string;
}

// Mock Data

export const progressOverview: ProgressOverviewData = {
  overallCompletion: 68,
  readinessStatus: "On Track",
  targetRole: "Full Stack Web Development",
  learningPathProgress: 42,
  totalEnrolledCourses: 7,
  completedCourses: 3,
  totalAssignments: 15,
  completedAssignments: 9,
  totalQuizzes: 12,
  passedQuizzes: 8,
  averageQuizScore: 78,
  totalLearningHours: 86,
  weeklyTarget: 10,
  currentWeekHours: 7.5,
  currentStreak: 12,
};

export const learningPathProgress: LearningPathProgressData = {
  pathId: "fullstack",
  pathTitle: "Full Stack Web Development",
  description: "Comprehensive path from programming basics to full-stack development",
  totalDuration: "6–8 months",
  overallProgress: 42,
  enrolledDate: "2024-10-15",
  expectedCompletion: "2025-05-15",
  phases: [
    { id: "phase1", name: "Phase 1: Foundations", totalCourses: 2, completedCourses: 2, status: "completed" },
    { id: "phase2", name: "Phase 2: Frontend Development", totalCourses: 3, completedCourses: 1, status: "in_progress" },
    { id: "phase3", name: "Phase 3: Backend Development", totalCourses: 4, completedCourses: 0, status: "locked" },
    { id: "phase4", name: "Phase 4: Full Stack Integration", totalCourses: 2, completedCourses: 0, status: "locked" },
    { id: "phase5", name: "Phase 5: Development Practices", totalCourses: 3, completedCourses: 0, status: "locked" },
    { id: "phase6", name: "Phase 6: Capstone Project", totalCourses: 1, completedCourses: 0, status: "locked" },
  ],
};

export const courseProgressDetails: CourseProgressDetail[] = [
  {
    id: "prog-basics",
    title: "Programming Basics",
    instructor: "Sarah Chen",
    completionPercentage: 100,
    modulesCompleted: 5,
    totalModules: 5,
    timeSpent: "8h 30m",
    estimatedTime: "10h",
    status: "completed",
    lastAccessed: "2024-11-20",
    modules: [
      { id: "m1", title: "Introduction to Programming", type: "video", duration: "15 min", status: "completed", watchProgress: 100, completedAt: "2024-11-01" },
      { id: "m2", title: "Variables and Data Types", type: "video", duration: "20 min", status: "completed", watchProgress: 100, completedAt: "2024-11-05" },
      { id: "m3", title: "Control Flow", type: "video", duration: "25 min", status: "completed", watchProgress: 100, completedAt: "2024-11-10" },
      { id: "m4", title: "Functions and Scope", type: "video", duration: "30 min", status: "completed", watchProgress: 100, completedAt: "2024-11-15" },
      { id: "m5", title: "Module Quiz", type: "quiz", duration: "10 min", status: "completed", completedAt: "2024-11-20" },
    ],
  },
  {
    id: "web-fundamentals",
    title: "Web Fundamentals (HTTP, Browsers, Servers)",
    instructor: "Mike Johnson",
    completionPercentage: 100,
    modulesCompleted: 4,
    totalModules: 4,
    timeSpent: "6h 15m",
    estimatedTime: "8h",
    status: "completed",
    lastAccessed: "2024-12-05",
    modules: [
      { id: "m1", title: "How the Web Works", type: "video", duration: "20 min", status: "completed", watchProgress: 100 },
      { id: "m2", title: "HTTP Protocol Deep Dive", type: "video", duration: "25 min", status: "completed", watchProgress: 100 },
      { id: "m3", title: "Browser Architecture", type: "reading", duration: "15 min", status: "completed" },
      { id: "m4", title: "Server Concepts Quiz", type: "quiz", duration: "10 min", status: "completed" },
    ],
  },
  {
    id: "html-css",
    title: "HTML & CSS Fundamentals",
    instructor: "Emma Davis",
    completionPercentage: 72,
    modulesCompleted: 8,
    totalModules: 11,
    timeSpent: "12h 45m",
    estimatedTime: "18h",
    status: "in_progress",
    lastAccessed: "2025-01-30",
    dueDate: "2025-02-15",
    modules: [
      { id: "m1", title: "HTML Document Structure", type: "video", duration: "20 min", status: "completed", watchProgress: 100 },
      { id: "m2", title: "HTML Elements & Semantics", type: "video", duration: "25 min", status: "completed", watchProgress: 100 },
      { id: "m3", title: "Forms and Input Types", type: "video", duration: "30 min", status: "completed", watchProgress: 100 },
      { id: "m4", title: "CSS Selectors & Properties", type: "video", duration: "35 min", status: "completed", watchProgress: 100 },
      { id: "m5", title: "Box Model & Layout", type: "video", duration: "40 min", status: "completed", watchProgress: 100 },
      { id: "m6", title: "Flexbox Deep Dive", type: "video", duration: "45 min", status: "completed", watchProgress: 100 },
      { id: "m7", title: "CSS Grid Layout", type: "video", duration: "40 min", status: "completed", watchProgress: 100 },
      { id: "m8", title: "Responsive Design Basics", type: "video", duration: "35 min", status: "completed", watchProgress: 100 },
      { id: "m9", title: "CSS Animations", type: "video", duration: "30 min", status: "in_progress", watchProgress: 45 },
      { id: "m10", title: "Final Project", type: "assignment", duration: "2h", status: "not_started" },
      { id: "m11", title: "Module Assessment", type: "quiz", duration: "20 min", status: "locked" },
    ],
  },
  {
    id: "javascript",
    title: "JavaScript (ES6+)",
    instructor: "Alex Kim",
    completionPercentage: 35,
    modulesCompleted: 4,
    totalModules: 12,
    timeSpent: "8h 20m",
    estimatedTime: "24h",
    status: "in_progress",
    lastAccessed: "2025-01-28",
    dueDate: "2025-03-01",
    modules: [
      { id: "m1", title: "ES6 Introduction", type: "video", duration: "25 min", status: "completed", watchProgress: 100 },
      { id: "m2", title: "Variables: let, const, var", type: "video", duration: "20 min", status: "completed", watchProgress: 100 },
      { id: "m3", title: "Arrow Functions", type: "video", duration: "25 min", status: "completed", watchProgress: 100 },
      { id: "m4", title: "Template Literals", type: "video", duration: "15 min", status: "completed", watchProgress: 100 },
      { id: "m5", title: "Destructuring", type: "video", duration: "30 min", status: "in_progress", watchProgress: 60 },
      { id: "m6", title: "Spread & Rest Operators", type: "video", duration: "25 min", status: "not_started" },
      { id: "m7", title: "Promises & Async/Await", type: "video", duration: "45 min", status: "locked" },
      { id: "m8", title: "DOM Manipulation", type: "video", duration: "40 min", status: "locked" },
      { id: "m9", title: "Event Handling", type: "video", duration: "35 min", status: "locked" },
      { id: "m10", title: "Modules & Imports", type: "video", duration: "25 min", status: "locked" },
      { id: "m11", title: "Practice Assignment", type: "assignment", duration: "2h", status: "locked" },
      { id: "m12", title: "JavaScript Assessment", type: "quiz", duration: "30 min", status: "locked" },
    ],
  },
  {
    id: "react-basics",
    title: "Frontend Framework (React Basics)",
    instructor: "Priya Sharma",
    completionPercentage: 0,
    modulesCompleted: 0,
    totalModules: 10,
    timeSpent: "0h",
    estimatedTime: "20h",
    status: "not_started",
    lastAccessed: "-",
    modules: [],
  },
  {
    id: "rest-api",
    title: "REST API Development",
    instructor: "Sarah Chen",
    completionPercentage: 45,
    modulesCompleted: 5,
    totalModules: 11,
    timeSpent: "9h 15m",
    estimatedTime: "16h",
    status: "in_progress",
    lastAccessed: "2025-01-30",
    dueDate: "2025-02-28",
    modules: [
      { id: "m1", title: "REST Principles", type: "video", duration: "30 min", status: "completed", watchProgress: 100 },
      { id: "m2", title: "HTTP Methods", type: "video", duration: "25 min", status: "completed", watchProgress: 100 },
      { id: "m3", title: "Status Codes", type: "reading", duration: "15 min", status: "completed", resourcesAccessed: [{ type: "pdf", accessed: true }] },
      { id: "m4", title: "API Design Best Practices", type: "video", duration: "35 min", status: "completed", watchProgress: 100 },
      { id: "m5", title: "Building CRUD APIs", type: "video", duration: "45 min", status: "completed", watchProgress: 100 },
      { id: "m6", title: "Authentication & JWT", type: "video", duration: "40 min", status: "in_progress", watchProgress: 30 },
      { id: "m7", title: "Error Handling", type: "video", duration: "25 min", status: "not_started" },
      { id: "m8", title: "API Documentation", type: "reading", duration: "20 min", status: "locked" },
      { id: "m9", title: "API Testing with Postman", type: "video", duration: "30 min", status: "locked" },
      { id: "m10", title: "REST API Project", type: "assignment", duration: "3h", status: "locked" },
      { id: "m11", title: "API Concepts Quiz", type: "quiz", duration: "15 min", status: "locked" },
    ],
  },
  {
    id: "security-compliance",
    title: "Security & Compliance Training",
    instructor: "HR Team",
    completionPercentage: 100,
    modulesCompleted: 3,
    totalModules: 3,
    timeSpent: "1h 30m",
    estimatedTime: "2h",
    status: "completed",
    lastAccessed: "2024-10-20",
    modules: [
      { id: "m1", title: "Data Security Basics", type: "video", duration: "30 min", status: "completed", watchProgress: 100 },
      { id: "m2", title: "Compliance Guidelines", type: "reading", duration: "20 min", status: "completed" },
      { id: "m3", title: "Security Quiz", type: "quiz", duration: "10 min", status: "completed" },
    ],
  },
];

export const assignmentProgress: AssignmentProgressItem[] = [
  { id: "1", title: "Build REST API for User Management", courseId: "rest-api", courseName: "REST API Development", status: "in_progress", dueDate: "2025-01-31" },
  { id: "2", title: "Binary Tree Traversal Implementation", courseId: "prog-basics", courseName: "Programming Basics", status: "reviewed", score: 88, maxScore: 100, feedback: "Excellent work! Clean implementation.", dueDate: "2025-01-28", submittedAt: "2025-01-27" },
  { id: "3", title: "Responsive Portfolio Website", courseId: "html-css", courseName: "HTML & CSS Fundamentals", status: "submitted", dueDate: "2025-01-25", submittedAt: "2025-01-24" },
  { id: "4", title: "JavaScript DOM Project", courseId: "javascript", courseName: "JavaScript (ES6+)", status: "not_started", dueDate: "2025-02-10" },
  { id: "5", title: "API Error Handling Task", courseId: "rest-api", courseName: "REST API Development", status: "not_started", dueDate: "2025-02-05" },
  { id: "6", title: "CSS Grid Layout Exercise", courseId: "html-css", courseName: "HTML & CSS Fundamentals", status: "reviewed", score: 92, maxScore: 100, feedback: "Great use of grid areas!", dueDate: "2025-01-20", submittedAt: "2025-01-19" },
  { id: "7", title: "Flexbox Challenge", courseId: "html-css", courseName: "HTML & CSS Fundamentals", status: "reviewed", score: 85, maxScore: 100, feedback: "Good work. Consider using gap property more.", dueDate: "2025-01-15", submittedAt: "2025-01-14" },
  { id: "8", title: "HTTP Protocol Analysis", courseId: "web-fundamentals", courseName: "Web Fundamentals", status: "reviewed", score: 90, maxScore: 100, feedback: "Thorough analysis!", dueDate: "2025-01-10", submittedAt: "2025-01-09" },
  { id: "9", title: "JWT Authentication Implementation", courseId: "rest-api", courseName: "REST API Development", status: "rework_required", score: 65, maxScore: 100, feedback: "Token expiration needs to be handled properly.", dueDate: "2025-01-22", submittedAt: "2025-01-21" },
];

export const quizProgress: QuizProgressItem[] = [
  { id: "q1", title: "Programming Fundamentals Quiz", courseId: "prog-basics", courseName: "Programming Basics", status: "passed", score: 85, passingScore: 70, attempts: 1, maxAttempts: 2, lastAttemptDate: "2024-11-20" },
  { id: "q2", title: "Web Fundamentals Assessment", courseId: "web-fundamentals", courseName: "Web Fundamentals", status: "passed", score: 92, passingScore: 70, attempts: 1, maxAttempts: 2, lastAttemptDate: "2024-12-05" },
  { id: "q3", title: "HTML Basics Quiz", courseId: "html-css", courseName: "HTML & CSS Fundamentals", status: "passed", score: 88, passingScore: 70, attempts: 1, maxAttempts: 2, lastAttemptDate: "2025-01-05" },
  { id: "q4", title: "CSS Selectors Quiz", courseId: "html-css", courseName: "HTML & CSS Fundamentals", status: "passed", score: 78, passingScore: 70, attempts: 2, maxAttempts: 2, lastAttemptDate: "2025-01-12" },
  { id: "q5", title: "Flexbox & Grid Quiz", courseId: "html-css", courseName: "HTML & CSS Fundamentals", status: "failed", score: 62, passingScore: 70, attempts: 1, maxAttempts: 2, lastAttemptDate: "2025-01-18" },
  { id: "q6", title: "JavaScript ES6 Quiz", courseId: "javascript", courseName: "JavaScript (ES6+)", status: "passed", score: 80, passingScore: 70, attempts: 1, maxAttempts: 2, lastAttemptDate: "2025-01-22" },
  { id: "q7", title: "REST API Concepts", courseId: "rest-api", courseName: "REST API Development", status: "passed", score: 75, passingScore: 70, attempts: 1, maxAttempts: 2, lastAttemptDate: "2025-01-25" },
  { id: "q8", title: "HTTP Methods Quiz", courseId: "rest-api", courseName: "REST API Development", status: "pending", passingScore: 70, attempts: 0, maxAttempts: 2 },
  { id: "q9", title: "Async JavaScript Quiz", courseId: "javascript", courseName: "JavaScript (ES6+)", status: "pending", passingScore: 70, attempts: 0, maxAttempts: 2 },
  { id: "q10", title: "Security Awareness Quiz", courseId: "security-compliance", courseName: "Security & Compliance Training", status: "passed", score: 95, passingScore: 80, attempts: 1, maxAttempts: 2, lastAttemptDate: "2024-10-20" },
];

export const skillProgress: SkillProgress[] = [
  { id: "s1", name: "JavaScript", category: "Frontend", currentLevel: 72, targetLevel: 85, proficiency: "intermediate", relatedCourses: ["javascript", "react-basics"], hasGap: true },
  { id: "s2", name: "HTML/CSS", category: "Frontend", currentLevel: 80, targetLevel: 80, proficiency: "advanced", relatedCourses: ["html-css"], hasGap: false },
  { id: "s3", name: "React", category: "Frontend", currentLevel: 25, targetLevel: 80, proficiency: "beginner", relatedCourses: ["react-basics"], hasGap: true },
  { id: "s4", name: "Node.js", category: "Backend", currentLevel: 45, targetLevel: 75, proficiency: "intermediate", relatedCourses: ["backend-basics", "rest-api"], hasGap: true },
  { id: "s5", name: "REST APIs", category: "Backend", currentLevel: 60, targetLevel: 80, proficiency: "intermediate", relatedCourses: ["rest-api"], hasGap: true },
  { id: "s6", name: "SQL", category: "Backend", currentLevel: 40, targetLevel: 70, proficiency: "beginner", relatedCourses: ["database"], hasGap: true },
  { id: "s7", name: "Git", category: "Tools", currentLevel: 75, targetLevel: 75, proficiency: "advanced", relatedCourses: ["git"], hasGap: false },
  { id: "s8", name: "Problem Solving", category: "Core", currentLevel: 78, targetLevel: 80, proficiency: "advanced", relatedCourses: ["prog-basics"], hasGap: false },
  { id: "s9", name: "Security Basics", category: "Compliance", currentLevel: 90, targetLevel: 80, proficiency: "advanced", relatedCourses: ["security-compliance"], hasGap: false },
];

export const timeActivityData: TimeActivityData = {
  totalHoursThisWeek: 7.5,
  totalHoursThisMonth: 32,
  averageDailyHours: 1.2,
  weeklyTrend: [
    { week: "Week 1", hours: 8 },
    { week: "Week 2", hours: 9.5 },
    { week: "Week 3", hours: 7 },
    { week: "Week 4", hours: 7.5 },
  ],
  dailyActivity: [
    { day: "Mon", date: "2025-01-27", hours: 1.5, coursesAccessed: 2, assignmentsCompleted: 0, quizzesTaken: 0 },
    { day: "Tue", date: "2025-01-28", hours: 2, coursesAccessed: 2, assignmentsCompleted: 1, quizzesTaken: 0 },
    { day: "Wed", date: "2025-01-29", hours: 1, coursesAccessed: 1, assignmentsCompleted: 0, quizzesTaken: 1 },
    { day: "Thu", date: "2025-01-30", hours: 1.5, coursesAccessed: 2, assignmentsCompleted: 0, quizzesTaken: 0 },
    { day: "Fri", date: "2025-01-31", hours: 1.5, coursesAccessed: 1, assignmentsCompleted: 0, quizzesTaken: 0 },
    { day: "Sat", date: "2025-02-01", hours: 0, coursesAccessed: 0, assignmentsCompleted: 0, quizzesTaken: 0 },
    { day: "Sun", date: "2025-02-02", hours: 0, coursesAccessed: 0, assignmentsCompleted: 0, quizzesTaken: 0 },
  ],
  activitySummary: {
    videosWatched: 12,
    assignmentsSubmitted: 3,
    quizzesCompleted: 2,
    resourcesDownloaded: 5,
  },
};

export const certificateProgress: CertificateProgress[] = [
  {
    id: "cert1",
    title: "Programming Foundations Certificate",
    courseId: "prog-basics",
    courseName: "Programming Basics",
    status: "earned",
    earnedDate: "2024-11-20",
    expiryDate: "2026-11-20",
    progress: 100,
    requirements: [
      { label: "Complete all modules", completed: true },
      { label: "Pass final quiz (70%+)", completed: true },
      { label: "Submit final assignment", completed: true },
    ],
  },
  {
    id: "cert2",
    title: "Web Fundamentals Certificate",
    courseId: "web-fundamentals",
    courseName: "Web Fundamentals",
    status: "earned",
    earnedDate: "2024-12-05",
    expiryDate: "2026-12-05",
    progress: 100,
    requirements: [
      { label: "Complete all modules", completed: true },
      { label: "Pass assessment (70%+)", completed: true },
    ],
  },
  {
    id: "cert3",
    title: "Security & Compliance Certificate",
    courseId: "security-compliance",
    courseName: "Security & Compliance Training",
    status: "earned",
    earnedDate: "2024-10-20",
    expiryDate: "2025-10-20",
    progress: 100,
    requirements: [
      { label: "Complete all modules", completed: true },
      { label: "Pass security quiz (80%+)", completed: true },
    ],
  },
  {
    id: "cert4",
    title: "HTML & CSS Mastery Certificate",
    courseId: "html-css",
    courseName: "HTML & CSS Fundamentals",
    status: "in_progress",
    progress: 72,
    requirements: [
      { label: "Complete all modules", completed: false },
      { label: "Pass final quiz (70%+)", completed: false },
      { label: "Submit portfolio project", completed: false },
    ],
  },
  {
    id: "cert5",
    title: "JavaScript Developer Certificate",
    courseId: "javascript",
    courseName: "JavaScript (ES6+)",
    status: "in_progress",
    progress: 35,
    requirements: [
      { label: "Complete all modules", completed: false },
      { label: "Pass all quizzes (70%+)", completed: false },
      { label: "Submit capstone project", completed: false },
    ],
  },
  {
    id: "cert6",
    title: "REST API Developer Certificate",
    courseId: "rest-api",
    courseName: "REST API Development",
    status: "in_progress",
    progress: 45,
    requirements: [
      { label: "Complete all modules", completed: false },
      { label: "Pass API concepts quiz (70%+)", completed: true },
      { label: "Submit API project", completed: false },
    ],
  },
];

export const complianceItems: ComplianceItem[] = [
  { id: "c1", title: "Security & Compliance Training", type: "assigned", dueDate: "2024-10-31", status: "completed", completedDate: "2024-10-20" },
  { id: "c2", title: "Programming Basics", type: "assigned", dueDate: "2024-12-15", status: "completed", completedDate: "2024-11-20" },
  { id: "c3", title: "Web Fundamentals", type: "assigned", dueDate: "2024-12-31", status: "completed", completedDate: "2024-12-05" },
  { id: "c4", title: "HTML & CSS Fundamentals", type: "assigned", dueDate: "2025-02-15", status: "in_progress" },
  { id: "c5", title: "JavaScript (ES6+)", type: "assigned", dueDate: "2025-03-01", status: "in_progress" },
  { id: "c6", title: "REST API Development", type: "assigned", dueDate: "2025-02-28", status: "in_progress" },
  { id: "c7", title: "Data Privacy Refresher", type: "assigned", dueDate: "2025-01-25", status: "overdue" },
];

export const nextSteps: NextStepItem[] = [
  { id: "ns1", type: "assignment", title: "Build REST API for User Management", description: "Due today - Submit your API implementation", priority: "high", dueDate: "2025-01-31", link: "/dashboard/learner/assignments/1" },
  { id: "ns2", type: "quiz", title: "Flexbox & Grid Quiz - Retry", description: "Retake quiz to pass (need 70%+)", priority: "high", link: "/dashboard/learner/quiz/q5" },
  { id: "ns3", type: "module", title: "Continue: CSS Animations", description: "45% completed - finish this module", priority: "medium", link: "/dashboard/learner/courses/fullstack/html-css" },
  { id: "ns4", type: "assignment", title: "JWT Authentication Implementation", description: "Rework required - fix token expiration handling", priority: "high", link: "/dashboard/learner/assignments/9" },
  { id: "ns5", type: "course", title: "Complete HTML & CSS Fundamentals", description: "72% done - 3 modules remaining", priority: "medium", dueDate: "2025-02-15", link: "/dashboard/learner/courses/fullstack/html-css" },
  { id: "ns6", type: "skill", title: "Improve React Skills", description: "Skill gap identified - start React Basics course", priority: "low", link: "/dashboard/learner/courses/fullstack/react-basics" },
];
