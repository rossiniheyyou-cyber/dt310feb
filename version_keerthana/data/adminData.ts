/**
 * Admin & Manager module data - users, departments, teams, activity.
 * Single source of truth for governance and monitoring.
 */

export type UserRole = "learner" | "instructor" | "manager" | "admin";

export type UserStatus = "active" | "inactive" | "suspended";

export type PlatformUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  departmentId: string | null;
  teamId: string | null;
  managerId: string | null;
  enrolledCourseIds: string[];
  assignedCourseIds: string[]; // for instructors
  createdAt: string;
  lastActiveAt: string;
};

export type Department = {
  id: string;
  name: string;
  managerId: string | null;
};

export type Team = {
  id: string;
  name: string;
  departmentId: string;
  managerId: string | null;
};

export type SystemActivityEntry = {
  id: string;
  type: "user_created" | "user_updated" | "course_published" | "course_archived" | "certificate_issued" | "login" | "config_change";
  userId: string;
  userName: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
};

export const departments: Department[] = [
  { id: "dept-1", name: "Engineering", managerId: "mgr-1" },
  { id: "dept-2", name: "Product", managerId: "mgr-2" },
  { id: "dept-3", name: "Design", managerId: null },
];

export const teams: Team[] = [
  { id: "team-1", name: "Full Stack", departmentId: "dept-1", managerId: "mgr-1" },
  { id: "team-2", name: "Backend", departmentId: "dept-1", managerId: "mgr-1" },
  { id: "team-3", name: "Product Core", departmentId: "dept-2", managerId: "mgr-2" },
];

export const platformUsers: PlatformUser[] = [
  { id: "admin-1", name: "Admin User", email: "admin@digitalt3.com", role: "admin", status: "active", departmentId: null, teamId: null, managerId: null, enrolledCourseIds: [], assignedCourseIds: [], createdAt: "2024-01-01", lastActiveAt: "2025-02-01T10:00:00Z" },
  { id: "mgr-1", name: "Engineering Manager", email: "manager@digitalt3.com", role: "manager", status: "active", departmentId: "dept-1", teamId: "team-1", managerId: null, enrolledCourseIds: [], assignedCourseIds: [], createdAt: "2024-02-01", lastActiveAt: "2025-02-01T09:30:00Z" },
  { id: "mgr-2", name: "Product Manager", email: "pm@digitalt3.com", role: "manager", status: "active", departmentId: "dept-2", teamId: "team-3", managerId: null, enrolledCourseIds: [], assignedCourseIds: [], createdAt: "2024-02-01", lastActiveAt: "2025-01-31T16:00:00Z" },
  { id: "inst-1", name: "Sarah Chen", email: "instructor@digitalt3.com", role: "instructor", status: "active", departmentId: null, teamId: null, managerId: null, enrolledCourseIds: [], assignedCourseIds: ["prog-basics", "rest-api", "html-css"], createdAt: "2024-03-01", lastActiveAt: "2025-02-01T08:00:00Z" },
  { id: "l1", name: "Alex Kim", email: "alex@company.com", role: "learner", status: "active", departmentId: "dept-1", teamId: "team-1", managerId: "mgr-1", enrolledCourseIds: ["prog-basics", "rest-api"], assignedCourseIds: [], createdAt: "2024-06-01", lastActiveAt: "2025-02-01T09:00:00Z" },
  { id: "l2", name: "Priya Sharma", email: "priya@company.com", role: "learner", status: "active", departmentId: "dept-1", teamId: "team-1", managerId: "mgr-1", enrolledCourseIds: ["prog-basics", "html-css"], assignedCourseIds: [], createdAt: "2024-06-15", lastActiveAt: "2025-01-31T14:00:00Z" },
  { id: "l3", name: "David Lee", email: "david@company.com", role: "learner", status: "active", departmentId: "dept-1", teamId: "team-2", managerId: "mgr-1", enrolledCourseIds: ["prog-basics"], assignedCourseIds: [], createdAt: "2024-07-01", lastActiveAt: "2025-01-30T11:00:00Z" },
  { id: "l4", name: "Emma Wilson", email: "emma@company.com", role: "learner", status: "active", departmentId: "dept-2", teamId: "team-3", managerId: "mgr-2", enrolledCourseIds: ["prog-basics"], assignedCourseIds: [], createdAt: "2024-07-15", lastActiveAt: "2025-01-31T10:00:00Z" },
];

export const systemActivity: SystemActivityEntry[] = [
  { id: "a1", type: "course_published", userId: "inst-1", userName: "Sarah Chen", description: "Published course: REST API Development", timestamp: "2025-02-01T08:30:00Z" },
  { id: "a2", type: "certificate_issued", userId: "l1", userName: "Alex Kim", description: "Certificate earned: Programming Basics", timestamp: "2025-01-31T16:00:00Z" },
  { id: "a3", type: "user_created", userId: "admin-1", userName: "Admin User", description: "New learner added: Emma Wilson", timestamp: "2025-01-31T14:00:00Z" },
  { id: "a4", type: "login", userId: "mgr-1", userName: "Engineering Manager", description: "Manager signed in", timestamp: "2025-02-01T09:30:00Z" },
  { id: "a5", type: "config_change", userId: "admin-1", userName: "Admin User", description: "Updated notification settings", timestamp: "2025-01-30T11:00:00Z" },
];

export function getUsersByRole(role: UserRole): PlatformUser[] {
  return platformUsers.filter((u) => u.role === role);
}

export function getUsersByManager(managerId: string): PlatformUser[] {
  return platformUsers.filter((u) => u.managerId === managerId && u.role === "learner");
}

export function getDepartmentById(id: string): Department | undefined {
  return departments.find((d) => d.id === id);
}

export function getTeamById(id: string): Team | undefined {
  return teams.find((t) => t.id === id);
}

export function getUserById(id: string): PlatformUser | undefined {
  return platformUsers.find((u) => u.id === id);
}

export function getManagerTeamIds(managerId: string): string[] {
  return teams.filter((t) => t.managerId === managerId).map((t) => t.id);
}

export function getLearnersForManager(managerId: string): PlatformUser[] {
  const teamIds = getManagerTeamIds(managerId);
  return platformUsers.filter((u) => u.role === "learner" && u.teamId && teamIds.includes(u.teamId));
}

export type IssuedCertificate = {
  id: string;
  pathSlug: string;
  courseId: string;
  courseTitle: string;
  pathTitle: string;
  earnedAt: string;
  learnerId: string;
  learnerName: string;
  status: "Issued" | "Revoked";
};

export const issuedCertificates: IssuedCertificate[] = [
  { id: "CERT-FULLSTACK-PROG-BASICS-20250131", pathSlug: "fullstack", courseId: "prog-basics", courseTitle: "Programming Basics", pathTitle: "Full Stack Developer", earnedAt: "2025-01-31T16:00:00Z", learnerId: "l1", learnerName: "Alex Kim", status: "Issued" },
];
