/**
 * Lesson completion (user progress) API.
 * Learner: record lesson complete. Manager: get completion count per user.
 */

import apiClient from './client';

export interface CompletionRecord {
  lessonId: number;
  completedAt: string;
}

export interface ProgressResponse {
  count: number;
  completedLessonIds: number[];
  completions: CompletionRecord[];
}

export interface UserProgressResponse extends ProgressResponse {
  userId: string;
}

/**
 * Record that the current user completed a lesson (learner).
 */
export const completeLesson = async (lessonId: number): Promise<{ message: string; completedAt?: string }> => {
  const response = await apiClient.post<{ message: string; completedAt?: string }>(
    `/progress/lessons/${lessonId}/complete`
  );
  return response.data;
};

/**
 * Get current user's progress (learner).
 */
export const getMyProgress = async (): Promise<ProgressResponse> => {
  const response = await apiClient.get<ProgressResponse>('/progress/me');
  return response.data;
};

/**
 * Get lesson completion count for a user (manager/admin).
 * Equivalent to: SELECT COUNT(*) FROM user_progress WHERE user_id = ?
 */
export const getProgressForUser = async (userId: string): Promise<UserProgressResponse> => {
  const response = await apiClient.get<UserProgressResponse>(`/progress/users/${userId}`);
  return response.data;
};

/**
 * Record that the current user completed a course (learner) and notify instructor.
 */
export const completeCourse = async (courseId: number): Promise<{ message: string; completedAt?: string }> => {
  const response = await apiClient.post<{ message: string; completedAt?: string }>(
    `/progress/courses/${courseId}/complete`
  );
  return response.data;
};
