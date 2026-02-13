/**
 * Lessons API Service
 * Handles all lesson-related API calls
 */

import apiClient from './client';

// Type definitions
export interface LessonQuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  videoUrl: string | null;
  duration: number | null;
  aiSummary: string | null;
  aiQuizJson: LessonQuizQuestion[] | null;
  order: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedLessonsResponse {
  items: Lesson[];
  page: number;
  limit: number;
  total: number;
}

export interface LessonsByCourseResponse {
  items: Lesson[];
  total: number;
}

export interface LessonCreateRequest {
  courseId: number;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  duration?: number;
  order?: number;
  status?: 'draft' | 'published' | 'archived';
}

export interface LessonUpdateRequest {
  courseId?: number;
  title?: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  duration?: number;
  order?: number;
  status?: 'draft' | 'published' | 'archived';
}

export interface LessonsQueryParams {
  page?: number;
  limit?: number;
  courseId?: string;
  search?: string;
  sortBy?: 'order' | 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'ASC' | 'DESC';
  includeCourse?: boolean;
}

export interface LessonContentResponse {
  lessonId: number;
  aiSummary: string | null;
  aiQuizJson: LessonQuizQuestion[] | null;
}

export interface QuizSubmissionRequest {
  answers: number[] | Record<string, number>;
}

export interface QuizSubmissionResponse {
  lessonId: number;
  correctCount: number;
  total: number;
  percentage: number;
  readinessScore: number;
  readinessScoreQuizCount: number;
}

/**
 * Get paginated list of lessons
 */
export const getLessons = async (params?: LessonsQueryParams): Promise<PaginatedLessonsResponse> => {
  const response = await apiClient.get<PaginatedLessonsResponse>('/lessons', {
    params: {
      page: params?.page || 1,
      limit: params?.limit || 20,
      courseId: params?.courseId,
      search: params?.search,
      sortBy: params?.sortBy || 'order',
      sortOrder: params?.sortOrder || 'ASC',
      includeCourse: params?.includeCourse,
    },
  });
  return response.data;
};

/**
 * Get lessons by course ID
 */
export const getLessonsByCourse = async (
  courseId: string,
  params?: { search?: string; sortBy?: string; sortOrder?: string }
): Promise<LessonsByCourseResponse> => {
  const response = await apiClient.get<LessonsByCourseResponse>(`/lessons/by-course/${courseId}`, {
    params: {
      search: params?.search,
      sortBy: params?.sortBy || 'order',
      sortOrder: params?.sortOrder || 'ASC',
    },
  });
  return response.data;
};

/**
 * Get a single lesson by ID
 */
export const getLesson = async (lessonId: string): Promise<Lesson> => {
  const response = await apiClient.get<Lesson>(`/lessons/${lessonId}`);
  return response.data;
};

/**
 * Create a new lesson (admin/instructor only)
 */
export const createLesson = async (data: LessonCreateRequest): Promise<Lesson> => {
  const response = await apiClient.post<Lesson>('/lessons', data);
  return response.data;
};

/**
 * Update a lesson (admin/instructor only)
 */
export const updateLesson = async (lessonId: string, data: LessonUpdateRequest): Promise<Lesson> => {
  const response = await apiClient.patch<Lesson>(`/lessons/${lessonId}`, data);
  return response.data;
};

/**
 * Delete a lesson (admin/instructor only)
 */
export const deleteLesson = async (lessonId: string): Promise<void> => {
  await apiClient.delete(`/lessons/${lessonId}`);
};

/**
 * Get AI-generated content for a lesson (summary + quiz)
 */
export const getLessonContent = async (lessonId: string): Promise<LessonContentResponse> => {
  const response = await apiClient.get<LessonContentResponse>(`/lessons/${lessonId}/content`);
  return response.data;
};

/**
 * Submit quiz answers and update readiness score
 */
export const submitQuiz = async (
  lessonId: string,
  answers: number[] | Record<string, number>
): Promise<QuizSubmissionResponse> => {
  const response = await apiClient.post<QuizSubmissionResponse>(`/lessons/${lessonId}/submit-quiz`, {
    answers,
  });
  return response.data;
};

/**
 * Generate AI content for a lesson (admin/instructor only)
 */
export const generateAIContent = async (lessonId: string): Promise<LessonContentResponse> => {
  const response = await apiClient.post<LessonContentResponse>(`/lessons/${lessonId}/generate-ai`);
  return response.data;
};

/**
 * Get presigned video view URL for a lesson
 */
export const getLessonVideoViewUrl = async (
  lessonId: string
): Promise<{ fileKey: string; viewUrl: string }> => {
  const response = await apiClient.post<{ fileKey: string; viewUrl: string }>(
    `/lessons/${lessonId}/video-view-url`
  );
  return response.data;
};
