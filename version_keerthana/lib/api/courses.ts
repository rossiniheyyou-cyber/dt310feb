/**
 * Courses API Service
 * Handles all course-related API calls
 */

import apiClient from './client';

// Type definitions
export interface Course {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  status: 'draft' | 'pending_approval' | 'published' | 'archived' | 'rejected';
  tags: string[];
  createdBy?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedCoursesResponse {
  items: Course[];
  page: number;
  limit: number;
  total: number;
}

export interface VideoPlaylistItem {
  title: string;
  url: string;
}

export interface CourseCreateRequest {
  title: string;
  description?: string;
  videoUrl?: string;
  thumbnail?: string;
  overview?: string;
  outcomes?: string[];
  videoPlaylist?: VideoPlaylistItem[];
  status?: 'draft' | 'pending_approval' | 'published' | 'archived' | 'rejected';
  tags?: string[];
}

export interface CourseUpdateRequest {
  title?: string;
  description?: string;
  videoUrl?: string;
  thumbnail?: string;
  status?: 'draft' | 'pending_approval' | 'published' | 'archived' | 'rejected';
  tags?: string[];
}

export interface CoursesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'draft' | 'pending_approval' | 'published' | 'archived' | 'rejected';
}

/**
 * Get paginated list of courses
 */
export const getCourses = async (params?: CoursesQueryParams): Promise<PaginatedCoursesResponse> => {
  const response = await apiClient.get<PaginatedCoursesResponse>('/courses', {
    params: {
      page: params?.page || 1,
      limit: params?.limit || 20,
      search: params?.search,
      status: params?.status,
    },
  });
  return response.data;
};

/**
 * Get a single course by ID
 */
export const getCourse = async (courseId: string): Promise<Course> => {
  const response = await apiClient.get<Course>(`/courses/${courseId}`);
  return response.data;
};

/**
 * Create a new course (admin/instructor only)
 */
export const createCourse = async (data: CourseCreateRequest): Promise<Course> => {
  const response = await apiClient.post<Course>('/courses', data);
  return response.data;
};

/**
 * Update a course (admin/instructor only)
 */
export const updateCourse = async (courseId: string, data: CourseUpdateRequest): Promise<Course> => {
  const response = await apiClient.patch<Course>(`/courses/${courseId}`, data);
  return response.data;
};

/**
 * Delete a course (admin/instructor only)
 */
export const deleteCourse = async (courseId: string): Promise<void> => {
  await apiClient.delete(`/courses/${courseId}`);
};
