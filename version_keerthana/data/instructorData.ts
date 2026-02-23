// Instructor module mock data

export const ROLES = [
  "Full Stack Developer",
  "UI / UX Designer",
  "Data Analyst / Engineer",
  "Cloud & DevOps Engineer",
  "QA / Software Tester",
  "Digital Marketing / Tech Marketing",
] as const;

export const PHASES = [
  "Foundations",
  "Frontend Development",
  "Backend Development",
  "Full Stack Integration",
  "Development Practices",
  "Capstone Project",
] as const;

export const ASSESSMENT_TYPES = [
  "Assignment",
  "Quiz",
] as const;

export const ASSIGNMENT_SUBTYPES = [
  "Coding",
  "Design",
  "Case Study",
  "Project",
  "API Task",
  "Wireframe",
  "UX Case Study",
  "SQL",
  "Analysis Report",
] as const;

export const QUIZ_SUBTYPES = [
  "MCQ",
  "Scenario-based",
] as const;

export const SUBMISSION_TYPES = [
  "File upload",
  "Text/Link",
  "GitHub URL",
] as const;

// Dashboard KPIs
export const instructorKPIs = {
  activeCourses: 12,
  enrolledLearners: 156,
  pendingReviews: 23,
  learnersAtRisk: 8,
};

// Overdue reviews
export const overdueReviews = [
  {
    id: "1",
    learnerName: "Sarah Johnson",
    course: "REST API Development",
    assessment: "Build REST API for User Management",
    dueDate: "2025-01-28",
    daysOverdue: 3,
    type: "assignment",
  },
  {
    id: "2",
    learnerName: "Mike Chen",
    course: "Programming Basics",
    assessment: "Binary Tree Implementation",
    dueDate: "2025-01-25",
    daysOverdue: 6,
    type: "assignment",
  },
];

// Active courses (instructor view)
export const instructorCourses = [
  {
    id: "prog-basics",
    title: "Programming Basics",
    description: "Introduction to programming concepts",
    role: "Full Stack Developer",
    phase: "Foundations",
    enrolledCount: 42,
    completionRate: 78,
    modulesCount: 5,
  },
  {
    id: "rest-api",
    title: "REST API Development",
    description: "Design and build RESTful APIs",
    role: "Full Stack Developer",
    phase: "Backend Development",
    enrolledCount: 28,
    completionRate: 45,
    modulesCount: 11,
  },
  {
    id: "html-css",
    title: "HTML & CSS Fundamentals",
    description: "Build structured, styled web pages",
    role: "Full Stack Developer",
    phase: "Frontend Development",
    enrolledCount: 35,
    completionRate: 72,
    modulesCount: 11,
  },
];

// Learners for instructor
export const instructorLearners = [
  {
    id: "l1",
    name: "Sarah Johnson",
    email: "sarah.j@company.com",
    role: "Full Stack Developer",
    enrolledCourses: 5,
    completedCourses: 2,
    readinessScore: 45,
    status: "at_risk",
    lastActive: "2025-01-30",
  },
  {
    id: "l2",
    name: "Mike Chen",
    email: "mike.c@company.com",
    role: "Full Stack Developer",
    enrolledCourses: 5,
    completedCourses: 3,
    readinessScore: 72,
    status: "on_track",
    lastActive: "2025-01-31",
  },
  {
    id: "l3",
    name: "Emma Davis",
    email: "emma.d@company.com",
    role: "UI / UX Designer",
    enrolledCourses: 4,
    completedCourses: 4,
    readinessScore: 95,
    status: "excelling",
    lastActive: "2025-01-31",
  },
];

// Pending assessments for review — real-time only from API (getInstructorSubmissions)
export const pendingAssessments: Array<{
  id: string;
  assignmentId?: string;
  learnerName: string;
  course: string;
  title: string;
  type: string;
  submittedAt: string;
  status: string;
}> = [];

// Report summary data
export const reportSummaries = {
  courseCompletion: [
    { course: "Programming Basics", completed: 78, enrolled: 42 },
    { course: "REST API Development", completed: 45, enrolled: 28 },
    { course: "HTML & CSS", completed: 72, enrolled: 35 },
  ],
  assessmentPerformance: [
    { assessment: "REST API Project", avgScore: 76, submissions: 24 },
    { assessment: "Programming Quiz", avgScore: 82, submissions: 40 },
  ],
  skillReadiness: [
    { skill: "JavaScript", avgLevel: 65, learners: 35 },
    { skill: "React", avgLevel: 45, learners: 28 },
  ],
};
