export type Phase = {
  name: string;
  courses: Course[];
};

export type Course = {
  id: string;
  title: string;
  description: string;
  duration: string;
  modules: Module[];
  instructor: { name: string; role: string; avatar?: string };
  skills: string[];
};

export type Module = {
  id: string;
  title: string;
  type: "video" | "reading" | "assignment" | "quiz";
  duration?: string;
  locked?: boolean;
  completed?: boolean;
  videoUrl?: string;
  resources?: { type: string; label: string }[];
};

export type LearningPath = {
  id: string;
  title: string;
  description: string;
  skills: string[];
  duration: string;
  progress: number;
  slug: string;
  phases: Phase[];
};

export const learningPaths: LearningPath[] = [
  {
    id: "fullstack",
    slug: "fullstack",
    title: "Full Stack Developer",
    description: "Comprehensive path from programming basics to full-stack development with frontend, backend, and DevOps practices.",
    skills: ["JavaScript", "React", "Node.js", "SQL", "Git", "Agile"],
    duration: "6–8 months",
    progress: 25,
    phases: [
      {
        name: "Phase 1: Foundations",
        courses: [
          {
            id: "prog-basics",
            title: "Programming Basics",
            description: "Introduction to programming concepts, variables, control flow, and problem-solving.",
            duration: "2 weeks",
            instructor: { name: "Sarah Chen", role: "Senior Developer" },
            skills: ["Variables", "Loops", "Functions"],
            modules: [
              { id: "m1", title: "Introduction to Programming", type: "video", duration: "15 min", completed: true },
              { id: "m2", title: "Variables and Data Types", type: "video", duration: "20 min", completed: true },
              { id: "m3", title: "Control Flow", type: "video", duration: "25 min", completed: false },
              { id: "m4", title: "Functions and Scope", type: "video", duration: "30 min", completed: false, locked: true },
              { id: "m5", title: "Module Quiz", type: "quiz", duration: "10 min", completed: false, locked: true },
            ],
          },
          {
            id: "web-fundamentals",
            title: "Web Fundamentals (HTTP, Browsers, Servers)",
            description: "Understanding how the web works: HTTP, browsers, and server architecture.",
            duration: "1 week",
            instructor: { name: "Mike Johnson", role: "Tech Lead" },
            skills: ["HTTP", "Web Architecture"],
            modules: [
              { id: "m1", title: "How the Web Works", type: "video", duration: "20 min", completed: false, locked: true },
              { id: "m2", title: "HTTP Protocol", type: "video", duration: "25 min", completed: false, locked: true },
            ],
          },
        ],
      },
      {
        name: "Phase 2: Frontend Development",
        courses: [
          { id: "html-css", title: "HTML & CSS Fundamentals", description: "Build structured, styled web pages.", duration: "3 weeks", instructor: { name: "Emma Davis", role: "UI Engineer" }, skills: ["HTML5", "CSS3", "Responsive Design"], modules: [] },
          { id: "javascript", title: "JavaScript (ES6+)", description: "Modern JavaScript for interactive web applications.", duration: "4 weeks", instructor: { name: "Alex Kim", role: "Frontend Lead" }, skills: ["ES6", "Async/Await", "DOM"], modules: [] },
          { id: "react-basics", title: "Frontend Framework (React Basics)", description: "Component-based UI development with React.", duration: "4 weeks", instructor: { name: "Priya Sharma", role: "Senior Frontend" }, skills: ["React", "Hooks", "State"], modules: [] },
        ],
      },
      {
        name: "Phase 3: Backend Development",
        courses: [
          { id: "backend-basics", title: "Backend Development Basics (Node.js / Java)", description: "Server-side development fundamentals.", duration: "4 weeks", instructor: { name: "David Lee", role: "Backend Lead" }, skills: ["Node.js", "Express"], modules: [] },
          { id: "rest-api", title: "REST API Development", description: "Design and build RESTful APIs.", duration: "3 weeks", instructor: { name: "Sarah Chen", role: "Senior Developer" }, skills: ["REST", "API Design"], modules: [] },
          { id: "database", title: "Database Management (SQL & NoSQL)", description: "Data modeling, SQL, and NoSQL databases.", duration: "4 weeks", instructor: { name: "James Wilson", role: "Data Engineer" }, skills: ["SQL", "MongoDB"], modules: [] },
          { id: "auth", title: "Authentication & Authorization", description: "Secure authentication and access control.", duration: "2 weeks", instructor: { name: "Mike Johnson", role: "Tech Lead" }, skills: ["JWT", "OAuth"], modules: [] },
        ],
      },
      {
        name: "Phase 4: Full Stack Integration",
        courses: [
          { id: "integration", title: "Frontend–Backend Integration", description: "Connect frontend and backend systems.", duration: "2 weeks", instructor: { name: "Alex Kim", role: "Frontend Lead" }, skills: ["API Integration"], modules: [] },
          { id: "optimization", title: "Error Handling & Performance Optimization", description: "Debugging, error handling, and performance tuning.", duration: "2 weeks", instructor: { name: "David Lee", role: "Backend Lead" }, skills: ["Performance", "Debugging"], modules: [] },
        ],
      },
      {
        name: "Phase 5: Development Practices",
        courses: [
          { id: "git", title: "Git & Version Control", description: "Version control with Git and collaboration workflows.", duration: "1 week", instructor: { name: "Sarah Chen", role: "Senior Developer" }, skills: ["Git", "Branches"], modules: [] },
          { id: "sdlc", title: "Software Development Lifecycle (SDLC)", description: "Understanding SDLC and development processes.", duration: "1 week", instructor: { name: "Mike Johnson", role: "Tech Lead" }, skills: ["SDLC"], modules: [] },
          { id: "agile", title: "Agile & Scrum Basics", description: "Agile methodologies and Scrum practices.", duration: "1 week", instructor: { name: "Emma Davis", role: "Scrum Master" }, skills: ["Agile", "Scrum"], modules: [] },
        ],
      },
      {
        name: "Phase 6: Capstone Project",
        courses: [
          { id: "capstone", title: "Full Stack Capstone Project", description: "Real-world full-stack application project.", duration: "4 weeks", instructor: { name: "Mike Johnson", role: "Tech Lead" }, skills: ["Full Stack", "Project"], modules: [] },
        ],
      },
    ],
  },
  {
    id: "uiux",
    slug: "uiux",
    title: "UI / UX Designer",
    description: "Master design fundamentals, UX research, wireframing, and UI design using Figma. Learn developer handoff and collaboration.",
    skills: ["Figma", "Wireframing", "UX Research", "Design Systems", "Accessibility"],
    duration: "4–5 months",
    progress: 0,
    phases: [
      {
        name: "UI / UX Designer Path",
        courses: [
          { id: "design-fundamentals", title: "Design Fundamentals", description: "Core design principles, color theory, typography.", duration: "2 weeks", instructor: { name: "Emma Davis", role: "Lead Designer" }, skills: ["Design Principles"], modules: [] },
          { id: "ux-research", title: "UX Research & User Personas", description: "User research methods and persona creation.", duration: "2 weeks", instructor: { name: "Lisa Park", role: "UX Researcher" }, skills: ["User Research"], modules: [] },
          { id: "information-architecture", title: "Information Architecture", description: "Structure and organize content effectively.", duration: "1 week", instructor: { name: "Emma Davis", role: "Lead Designer" }, skills: ["IA"], modules: [] },
          { id: "wireframing", title: "Wireframing & Prototyping", description: "Create wireframes and interactive prototypes.", duration: "3 weeks", instructor: { name: "Chris Brown", role: "Product Designer" }, skills: ["Wireframes", "Prototyping"], modules: [] },
          { id: "figma", title: "UI Design using Figma", description: "Professional UI design with Figma.", duration: "4 weeks", instructor: { name: "Emma Davis", role: "Lead Designer" }, skills: ["Figma"], modules: [] },
          { id: "design-systems", title: "Design Systems & Accessibility", description: "Create scalable design systems and accessible interfaces.", duration: "2 weeks", instructor: { name: "Lisa Park", role: "UX Researcher" }, skills: ["Design Systems", "A11y"], modules: [] },
          { id: "handoff", title: "Developer Handoff & Collaboration", description: "Handoff workflows and design–dev collaboration.", duration: "1 week", instructor: { name: "Chris Brown", role: "Product Designer" }, skills: ["Handoff"], modules: [] },
          { id: "uiux-capstone", title: "UI / UX Capstone Design Project", description: "End-to-end design project.", duration: "3 weeks", instructor: { name: "Emma Davis", role: "Lead Designer" }, skills: ["Design Project"], modules: [] },
        ],
      },
    ],
  },
  {
    id: "data-analyst",
    slug: "data-analyst",
    title: "Data Analyst / Data Engineer",
    description: "Data fundamentals, SQL, Python for analysis, visualization, and data engineering basics. Prepare for analytics and data roles.",
    skills: ["SQL", "Python", "Data Visualization", "Analytics", "ETL"],
    duration: "5–6 months",
    progress: 0,
    phases: [
      {
        name: "Data Path",
        courses: [
          { id: "data-fundamentals", title: "Data Fundamentals", description: "Introduction to data types, structures, and concepts.", duration: "1 week", instructor: { name: "James Wilson", role: "Data Engineer" }, skills: ["Data Basics"], modules: [] },
          { id: "sql", title: "SQL & Database Concepts", description: "Querying and managing relational databases.", duration: "3 weeks", instructor: { name: "James Wilson", role: "Data Engineer" }, skills: ["SQL"], modules: [] },
          { id: "python-data", title: "Python for Data Analysis", description: "Python for data manipulation and analysis.", duration: "4 weeks", instructor: { name: "Anna Liu", role: "Data Scientist" }, skills: ["Python", "Pandas"], modules: [] },
          { id: "data-cleaning", title: "Data Cleaning & Transformation", description: "ETL and data quality processes.", duration: "2 weeks", instructor: { name: "James Wilson", role: "Data Engineer" }, skills: ["ETL", "Cleaning"], modules: [] },
          { id: "visualization", title: "Data Visualization Tools", description: "Create effective data visualizations.", duration: "2 weeks", instructor: { name: "Anna Liu", role: "Data Scientist" }, skills: ["Visualization"], modules: [] },
          { id: "business-analytics", title: "Business & Product Analytics", description: "Apply analytics to business decisions.", duration: "3 weeks", instructor: { name: "Anna Liu", role: "Data Scientist" }, skills: ["Analytics"], modules: [] },
          { id: "data-engineering", title: "Data Engineering Basics", description: "Data pipelines and infrastructure.", duration: "3 weeks", instructor: { name: "James Wilson", role: "Data Engineer" }, skills: ["Data Engineering"], modules: [] },
          { id: "data-capstone", title: "Data Analysis Capstone Project", description: "End-to-end data analysis project.", duration: "4 weeks", instructor: { name: "Anna Liu", role: "Data Scientist" }, skills: ["Capstone"], modules: [] },
        ],
      },
    ],
  },
  {
    id: "cloud-devops",
    slug: "cloud-devops",
    title: "Cloud & DevOps Engineer",
    description: "Linux, networking, cloud platforms (AWS/Azure), CI/CD, Docker, and Kubernetes. Build production-ready infrastructure skills.",
    skills: ["Linux", "AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
    duration: "5–6 months",
    progress: 0,
    phases: [
      {
        name: "Cloud & DevOps Path",
        courses: [
          { id: "linux", title: "Linux Fundamentals", description: "Linux commands, file systems, and shell scripting.", duration: "2 weeks", instructor: { name: "Ryan Martinez", role: "DevOps Lead" }, skills: ["Linux"], modules: [] },
          { id: "networking", title: "Networking Basics", description: "Network fundamentals and protocols.", duration: "2 weeks", instructor: { name: "Ryan Martinez", role: "DevOps Lead" }, skills: ["Networking"], modules: [] },
          { id: "cloud", title: "Cloud Fundamentals (AWS / Azure)", description: "Cloud concepts and cloud provider basics.", duration: "4 weeks", instructor: { name: "Ryan Martinez", role: "DevOps Lead" }, skills: ["AWS", "Azure"], modules: [] },
          { id: "iac", title: "Infrastructure as Code Basics", description: "Terraform and IaC principles.", duration: "3 weeks", instructor: { name: "Ryan Martinez", role: "DevOps Lead" }, skills: ["Terraform"], modules: [] },
          { id: "cicd", title: "CI/CD Pipelines", description: "Build and deploy pipelines.", duration: "3 weeks", instructor: { name: "Ryan Martinez", role: "DevOps Lead" }, skills: ["CI/CD"], modules: [] },
          { id: "docker", title: "Docker & Containerization", description: "Container concepts and Docker.", duration: "2 weeks", instructor: { name: "Ryan Martinez", role: "DevOps Lead" }, skills: ["Docker"], modules: [] },
          { id: "kubernetes", title: "Kubernetes Basics", description: "Container orchestration with Kubernetes.", duration: "3 weeks", instructor: { name: "Ryan Martinez", role: "DevOps Lead" }, skills: ["Kubernetes"], modules: [] },
          { id: "monitoring", title: "Monitoring, Logging & Security", description: "Observability and security in cloud.", duration: "3 weeks", instructor: { name: "Ryan Martinez", role: "DevOps Lead" }, skills: ["Monitoring"], modules: [] },
          { id: "cloud-capstone", title: "Cloud & DevOps Capstone Project", description: "End-to-end DevOps project.", duration: "4 weeks", instructor: { name: "Ryan Martinez", role: "DevOps Lead" }, skills: ["Capstone"], modules: [] },
        ],
      },
    ],
  },
  {
    id: "qa",
    slug: "qa",
    title: "Software Tester / QA Engineer",
    description: "Manual and automation testing, test case design, API testing, and bug tracking. Become job-ready for QA roles.",
    skills: ["Manual Testing", "Automation", "API Testing", "Test Plans", "Bug Tracking"],
    duration: "4–5 months",
    progress: 0,
    phases: [
      {
        name: "QA Path",
        courses: [
          { id: "testing-fundamentals", title: "Software Testing Fundamentals", description: "Core testing concepts and types.", duration: "2 weeks", instructor: { name: "Nina Patel", role: "QA Lead" }, skills: ["Testing Basics"], modules: [] },
          { id: "manual-testing", title: "Manual Testing Techniques", description: "Exploratory and manual testing methods.", duration: "2 weeks", instructor: { name: "Nina Patel", role: "QA Lead" }, skills: ["Manual Testing"], modules: [] },
          { id: "test-design", title: "Test Case Design & Test Plans", description: "Design effective test cases and plans.", duration: "2 weeks", instructor: { name: "Nina Patel", role: "QA Lead" }, skills: ["Test Design"], modules: [] },
          { id: "automation", title: "Automation Testing Basics", description: "Introduction to test automation.", duration: "3 weeks", instructor: { name: "Nina Patel", role: "QA Lead" }, skills: ["Selenium", "Automation"], modules: [] },
          { id: "api-testing", title: "API Testing", description: "Testing REST APIs and tools.", duration: "2 weeks", instructor: { name: "Nina Patel", role: "QA Lead" }, skills: ["API Testing"], modules: [] },
          { id: "performance-security", title: "Performance & Security Testing", description: "Performance and security test approaches.", duration: "2 weeks", instructor: { name: "Nina Patel", role: "QA Lead" }, skills: ["Performance", "Security"], modules: [] },
          { id: "bug-tracking", title: "Bug Tracking & Reporting", description: "Bug lifecycle and reporting tools.", duration: "1 week", instructor: { name: "Nina Patel", role: "QA Lead" }, skills: ["JIRA", "Bug Tracking"], modules: [] },
          { id: "qa-capstone", title: "QA Capstone Project", description: "End-to-end testing project.", duration: "3 weeks", instructor: { name: "Nina Patel", role: "QA Lead" }, skills: ["Capstone"], modules: [] },
        ],
      },
    ],
  },
  {
    id: "digital-marketing",
    slug: "digital-marketing",
    title: "Digital Marketing / Tech Marketing",
    description: "SEO, SEM, content marketing, social media strategy, analytics, and campaign execution. Prepare for marketing roles in tech.",
    skills: ["SEO", "SEM", "Content Marketing", "Social Media", "Analytics"],
    duration: "4–5 months",
    progress: 0,
    phases: [
      {
        name: "Digital Marketing Path",
        courses: [
          { id: "dm-fundamentals", title: "Digital Marketing Fundamentals", description: "Core digital marketing concepts.", duration: "2 weeks", instructor: { name: "Kate Williams", role: "Marketing Lead" }, skills: ["Marketing Basics"], modules: [] },
          { id: "seo-sem", title: "SEO & SEM", description: "Search engine optimization and paid search.", duration: "3 weeks", instructor: { name: "Kate Williams", role: "Marketing Lead" }, skills: ["SEO", "SEM"], modules: [] },
          { id: "content-marketing", title: "Content Marketing", description: "Content strategy and creation.", duration: "2 weeks", instructor: { name: "Kate Williams", role: "Marketing Lead" }, skills: ["Content"], modules: [] },
          { id: "social-media", title: "Social Media Strategy", description: "Social media marketing and campaigns.", duration: "2 weeks", instructor: { name: "Kate Williams", role: "Marketing Lead" }, skills: ["Social Media"], modules: [] },
          { id: "analytics", title: "Analytics & Performance Tracking", description: "Marketing analytics and KPIs.", duration: "2 weeks", instructor: { name: "Kate Williams", role: "Marketing Lead" }, skills: ["Analytics"], modules: [] },
          { id: "automation", title: "Marketing Automation Tools", description: "Automation platforms and workflows.", duration: "2 weeks", instructor: { name: "Kate Williams", role: "Marketing Lead" }, skills: ["Automation"], modules: [] },
          { id: "campaigns", title: "Campaign Planning & Execution", description: "Plan and run marketing campaigns.", duration: "2 weeks", instructor: { name: "Kate Williams", role: "Marketing Lead" }, skills: ["Campaigns"], modules: [] },
          { id: "dm-capstone", title: "Digital Marketing Capstone Project", description: "End-to-end marketing project.", duration: "3 weeks", instructor: { name: "Kate Williams", role: "Marketing Lead" }, skills: ["Capstone"], modules: [] },
        ],
      },
    ],
  },
];

export function getPathBySlug(slug: string): LearningPath | undefined {
  return learningPaths.find((p) => p.slug === slug);
}

export function getCourseInPath(
  pathSlug: string,
  courseId: string
): { path: LearningPath; course: Course } | undefined {
  const path = getPathBySlug(pathSlug);
  if (!path) return undefined;
  for (const phase of path.phases) {
    const course = phase.courses.find((c) => c.id === courseId);
    if (course) return { path, course };
  }
  return undefined;
}

