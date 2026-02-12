export type AssignmentStatus = "Assigned" | "Due" | "Submitted" | "Reviewed" | "Overdue";

export type AssignmentType =
  | "Coding"
  | "Quiz"
  | "Design"
  | "Case Study"
  | "Project"
  | "API Task"
  | "GitHub"
  | "Wireframe"
  | "Figma"
  | "UX Case Study"
  | "SQL"
  | "Analysis Report"
  | "Dashboard"
  | "Deployment"
  | "CI/CD"
  | "Test Cases"
  | "Bug Report"
  | "Automation Script"
  | "Campaign Plan"
  | "SEO Audit";

export type Role =
  | "Full Stack"
  | "UI/UX"
  | "Data"
  | "Cloud"
  | "QA"
  | "Marketing";

export type Assignment = {
  id: string;
  title: string;
  course: string;
  courseId: string;
  pathSlug: string;
  module: string;
  moduleId: string;
  role: Role;
  type: AssignmentType;
  dueDate: string;
  dueDateISO: string;
  status: AssignmentStatus;
  isDueToday?: boolean;
  isOverdue?: boolean;
  description?: string;
  instructions?: string[];
  deliverables?: string[];
  rubrics?: { criterion: string; points: number }[];
  referenceMaterials?: { label: string; url?: string }[];
  submissionGuidelines?: string;
  latePenalty?: string;
  attemptLimit?: number;
  timeLimitMinutes?: number;
  /** AI-generated feedback from instructor review (set when instructor saves feedback). */
  aiFeedback?: string;
};

export const assignments: Assignment[] = [
  {
    id: "1",
    title: "Build REST API for User Management",
    course: "REST API Development",
    courseId: "rest-api",
    pathSlug: "fullstack",
    module: "API Design & CRUD",
    moduleId: "m1",
    role: "Full Stack",
    type: "Coding",
    dueDate: "31 Jan 2025",
    dueDateISO: "2025-01-31",
    status: "Assigned",
    isDueToday: true,
    description: "Create REST APIs to manage users with CRUD operations.",
    instructions: [
      "Implement GET, POST, PUT, PATCH, DELETE endpoints",
      "Add request validation",
      "Include proper error handling",
    ],
    deliverables: ["GitHub repository", "API documentation"],
    rubrics: [
      { criterion: "API Design", points: 25 },
      { criterion: "Code Quality", points: 25 },
      { criterion: "Documentation", points: 25 },
      { criterion: "Error Handling", points: 25 },
    ],
    referenceMaterials: [
      { label: "REST API Best Practices" },
      { label: "OpenAPI Specification" },
    ],
    submissionGuidelines: "Submit GitHub repo URL. Include README with setup instructions.",
    latePenalty: "-10% per day",
  },
  {
    id: "2",
    title: "Binary Tree Traversal Implementation",
    course: "Programming Basics",
    courseId: "prog-basics",
    pathSlug: "fullstack",
    module: "Data Structures",
    moduleId: "m2",
    role: "Full Stack",
    type: "Coding",
    dueDate: "28 Jan 2025",
    dueDateISO: "2025-01-28",
    status: "Reviewed",
    description: "Implement in-order, pre-order, and post-order traversal.",
    deliverables: ["GitHub repository with working code"],
  },
  {
    id: "3",
    title: "User Dashboard Wireframes",
    course: "Wireframing & Prototyping",
    courseId: "wireframing",
    pathSlug: "uiux",
    module: "Low-Fidelity Design",
    moduleId: "m1",
    role: "UI/UX",
    type: "Wireframe",
    dueDate: "2 Feb 2025",
    dueDateISO: "2025-02-02",
    status: "Assigned",
    deliverables: ["Figma or PDF wireframes", "User flow diagram"],
  },
  {
    id: "4",
    title: "E-commerce UX Case Study",
    course: "UX Research & User Personas",
    courseId: "ux-research",
    pathSlug: "uiux",
    module: "Case Study Analysis",
    moduleId: "m2",
    role: "UI/UX",
    type: "UX Case Study",
    dueDate: "25 Jan 2025",
    dueDateISO: "2025-01-25",
    status: "Overdue",
    isOverdue: true,
    deliverables: ["Case study document (PDF)", "Screenshots and annotations"],
  },
  {
    id: "5",
    title: "SQL Queries for Sales Analytics",
    course: "SQL & Database Concepts",
    courseId: "sql",
    pathSlug: "data-analyst",
    module: "Advanced Queries",
    moduleId: "m3",
    role: "Data",
    type: "SQL",
    dueDate: "1 Feb 2025",
    dueDateISO: "2025-02-01",
    status: "Due",
    deliverables: ["SQL script file", "Query results export"],
  },
  {
    id: "6",
    title: "Customer Churn Analysis Report",
    course: "Business & Product Analytics",
    courseId: "business-analytics",
    pathSlug: "data-analyst",
    module: "Predictive Analytics",
    moduleId: "m2",
    role: "Data",
    type: "Analysis Report",
    dueDate: "5 Feb 2025",
    dueDateISO: "2025-02-05",
    status: "Assigned",
    deliverables: ["Analysis report (PDF)", "Dashboard link or screenshots"],
  },
  {
    id: "7",
    title: "Dockerize Node.js Application",
    course: "Docker & Containerization",
    courseId: "docker",
    pathSlug: "cloud-devops",
    module: "Container Basics",
    moduleId: "m1",
    role: "Cloud",
    type: "Deployment",
    dueDate: "3 Feb 2025",
    dueDateISO: "2025-02-03",
    status: "Assigned",
    deliverables: ["Dockerfile", "docker-compose.yml", "GitHub repo"],
  },
  {
    id: "8",
    title: "GitHub Actions CI/CD Pipeline",
    course: "CI/CD Pipelines",
    courseId: "cicd",
    pathSlug: "cloud-devops",
    module: "Automation",
    moduleId: "m2",
    role: "Cloud",
    type: "CI/CD",
    dueDate: "30 Jan 2025",
    dueDateISO: "2025-01-30",
    status: "Submitted",
    deliverables: ["Working pipeline config", "Build logs"],
  },
  {
    id: "9",
    title: "Test Cases for Login Flow",
    course: "Test Case Design & Test Plans",
    courseId: "test-design",
    pathSlug: "qa",
    module: "Functional Testing",
    moduleId: "m1",
    role: "QA",
    type: "Test Cases",
    dueDate: "4 Feb 2025",
    dueDateISO: "2025-02-04",
    status: "Assigned",
    deliverables: ["Test case document", "Traceability matrix"],
  },
  {
    id: "10",
    title: "Bug Report: Checkout Flow",
    course: "Bug Tracking & Reporting",
    courseId: "bug-tracking",
    pathSlug: "qa",
    module: "Bug Lifecycle",
    moduleId: "m1",
    role: "QA",
    type: "Bug Report",
    dueDate: "29 Jan 2025",
    dueDateISO: "2025-01-29",
    status: "Reviewed",
    deliverables: ["Bug report (JIRA/PDF)", "Steps to reproduce"],
  },
  {
    id: "11",
    title: "SEO Audit for Company Website",
    course: "SEO & SEM",
    courseId: "seo-sem",
    pathSlug: "digital-marketing",
    module: "Technical SEO",
    moduleId: "m2",
    role: "Marketing",
    type: "SEO Audit",
    dueDate: "6 Feb 2025",
    dueDateISO: "2025-02-06",
    status: "Assigned",
    deliverables: ["Audit report (PDF)", "Recommendations checklist"],
  },
  {
    id: "12",
    title: "Q1 Campaign Plan",
    course: "Campaign Planning & Execution",
    courseId: "campaigns",
    pathSlug: "digital-marketing",
    module: "Campaign Strategy",
    moduleId: "m1",
    role: "Marketing",
    type: "Campaign Plan",
    dueDate: "27 Jan 2025",
    dueDateISO: "2025-01-27",
    status: "Overdue",
    isOverdue: true,
    deliverables: ["Campaign brief", "Budget allocation", "Timeline"],
  },
  {
    id: "13",
    title: "Module Quiz: REST API Concepts",
    course: "REST API Development",
    courseId: "rest-api",
    pathSlug: "fullstack",
    module: "API Fundamentals",
    moduleId: "m0",
    role: "Full Stack",
    type: "Quiz",
    dueDate: "31 Jan 2025",
    dueDateISO: "2025-01-31",
    status: "Assigned",
    attemptLimit: 2,
    timeLimitMinutes: 15,
  },
  {
    id: "14",
    title: "Design System Component - Button",
    course: "UI Design using Figma",
    courseId: "figma",
    pathSlug: "uiux",
    module: "Components",
    moduleId: "m2",
    role: "UI/UX",
    type: "Design",
    dueDate: "1 Feb 2025",
    dueDateISO: "2025-02-01",
    status: "Due",
    deliverables: ["Figma link", "Variants documentation"],
  },
];

export const ROLES: Role[] = [
  "Full Stack",
  "UI/UX",
  "Data",
  "Cloud",
  "QA",
  "Marketing",
];

export const ASSIGNMENT_TYPES: AssignmentType[] = [
  "Coding",
  "Quiz",
  "Design",
  "Case Study",
  "Project",
  "API Task",
  "GitHub",
  "Wireframe",
  "Figma",
  "UX Case Study",
  "SQL",
  "Analysis Report",
  "Dashboard",
  "Deployment",
  "CI/CD",
  "Test Cases",
  "Bug Report",
  "Automation Script",
  "Campaign Plan",
  "SEO Audit",
];
