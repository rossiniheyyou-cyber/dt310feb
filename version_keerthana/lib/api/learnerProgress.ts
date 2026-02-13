/**
 * Learner Progress API - comprehensive real-time data for progress page
 */

import apiClient from './client';

export interface EnrollmentProgress {
  courseId: string;
  courseTitle: string;
  pathSlug: string;
  enrolledAt: string;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  courseCompleted: boolean;
}

export interface ProgressOverview {
  overallCompletion: number;
  readinessStatus: 'On Track' | 'Needs Attention' | 'At Risk';
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

export interface LearningPathProgress {
  pathId: string;
  pathTitle: string;
  description: string;
  totalDuration: string;
  overallProgress: number;
  enrolledDate: string | null;
  expectedCompletion: string | null;
  phases: Array<{ id: string; name: string; totalCourses: number; completedCourses: number; status: string }>;
}

export interface SkillProgressItem {
  id: string;
  name: string;
  category: string;
  currentLevel: number;
  targetLevel: number;
  proficiency: string;
  relatedCourses: string[];
  hasGap: boolean;
}

export interface TimeActivityData {
  totalHoursThisWeek: number;
  totalHoursThisMonth: number;
  averageDailyHours: number;
  weeklyTrend: { week: string; hours: number }[];
  dailyActivity: { day: string; date: string; hours: number; lessonsCompleted?: number }[];
  activitySummary: {
    videosWatched: number;
    assignmentsSubmitted: number;
    quizzesCompleted: number;
    resourcesDownloaded: number;
  };
}

export interface RecentActivityItem {
  id: string;
  type: 'module_completed' | 'quiz_completed' | 'course_accessed' | 'course_completed';
  title: string;
  subtitle?: string;
  timestamp: string;
  pathSlug?: string;
  courseId?: string | null;
}

export interface LearnerProgressData {
  overview: ProgressOverview;
  learningPath: LearningPathProgress;
  skillProgress: SkillProgressItem[];
  timeActivity: TimeActivityData;
  enrollments: EnrollmentProgress[];
  recentActivity?: RecentActivityItem[];
}

export const getLearnerProgress = async (): Promise<LearnerProgressData> => {
  const response = await apiClient.get<LearnerProgressData>('/learner/progress');
  return response.data;
};
