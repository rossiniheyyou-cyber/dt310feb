/**
 * Instructor API - dashboard stats, my courses, enrollments, submission stats
 */

import apiClient from './client';

export interface InstructorDashboardStats {
  activeCourses: number;
  enrolledLearners: number;
  pendingReviews: number;
  learnersAtRisk: number;
}

export const getInstructorDashboardStats = async (): Promise<InstructorDashboardStats> => {
  const response = await apiClient.get<InstructorDashboardStats>('/instructor/dashboard-stats');
  return response.data;
};

export interface InstructorCourse {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  status: string;
  tags: string[];
  enrolledCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface InstructorCoursesResponse {
  items: InstructorCourse[];
  total: number;
}

export const getInstructorMyCourses = async (): Promise<InstructorCoursesResponse> => {
  const response = await apiClient.get<InstructorCoursesResponse>('/instructor/my-courses');
  return response.data;
};

export interface EnrollmentItem {
  userId: string;
  name: string;
  email: string;
  enrolledAt: string;
}

export const getCourseEnrollments = async (courseId: string): Promise<{ enrollments: EnrollmentItem[]; total: number }> => {
  const response = await apiClient.get<{ enrollments: EnrollmentItem[]; total: number }>(
    `/instructor/courses/${courseId}/enrollments`
  );
  return response.data;
};

export interface CourseSubmissionStats {
  quizSubmissions: number;
  quizTotal: number;
  assessmentTotal: number;
  assessmentSubmissions: number;
}

export const getCourseSubmissionStats = async (courseId: string): Promise<CourseSubmissionStats> => {
  const response = await apiClient.get<CourseSubmissionStats>(
    `/instructor/courses/${courseId}/submission-stats`
  );
  return response.data;
};

export interface QuizAttemptForInstructor {
  id: number;
  quizId: number;
  quizTitle: string;
  userId: number;
  learnerName: string;
  learnerEmail: string;
  score: number;
  totalQuestions: number;
  completedAt: string | null;
  submittedAt: string;
}

export const getCourseQuizAttempts = async (courseId: string): Promise<{ attempts: QuizAttemptForInstructor[]; courseTitle: string }> => {
  const response = await apiClient.get<{ attempts: QuizAttemptForInstructor[]; courseTitle: string }>(
    `/instructor/courses/${courseId}/quiz-attempts`
  );
  return response.data;
};

export interface InstructorSubmissionItem {
  id: string;
  type: 'quiz' | 'assignment';
  title: string;
  course: string;
  learnerName: string;
  learnerEmail: string;
  submittedAt: string;
  status: string;
  score?: number;
  totalQuestions?: number;
  quizId?: number;
  assignmentId?: string;
}

export interface InstructorSubmissionsResponse {
  quizAttempts: InstructorSubmissionItem[];
  assignmentSubmissions: InstructorSubmissionItem[];
}

export const getInstructorSubmissions = async (): Promise<InstructorSubmissionsResponse> => {
  const response = await apiClient.get<InstructorSubmissionsResponse>('/instructor/submissions');
  return response.data;
};

export interface InstructorAssessmentItem {
  id: string;
  title: string;
  type: 'assignment' | 'quiz';
  course: string;
  module: string;
  dueDateISO: string | null;
  dueDate: string;
  status: string;
  submissions: number;
  reviewed: number;
}

export interface InstructorAssessmentsResponse {
  assessments: InstructorAssessmentItem[];
}

export const getInstructorAssessments = async (): Promise<InstructorAssessmentsResponse> => {
  const response = await apiClient.get<InstructorAssessmentsResponse>('/instructor/assessments');
  return response.data;
};
