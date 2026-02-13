/**
 * Learner Dashboard API - real-time aggregated data from backend
 */

import apiClient from './client';

export interface EnrollmentWithProgress {
  courseId: string;
  courseTitle: string;
  pathSlug: string;
  enrolledAt: string;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  courseCompleted: boolean;
}

export interface LearnerDashboardData {
  readinessScore: number;
  userName: string;
  enrollments: EnrollmentWithProgress[];
  mostRecentCourse: EnrollmentWithProgress | null;
  totalEnrolled: number;
  completedCourses: number;
}

export const getLearnerDashboard = async (): Promise<LearnerDashboardData> => {
  const response = await apiClient.get<LearnerDashboardData>('/learner/dashboard');
  return response.data;
};
