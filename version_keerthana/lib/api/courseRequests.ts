/**
 * Course Requests API Service
 */

import apiClient from './client';

export interface CourseRequest {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  instructor: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface CourseRequestsResponse {
  requests: CourseRequest[];
}

/**
 * Get pending course requests (admin only)
 */
export const getCourseRequests = async (): Promise<CourseRequestsResponse> => {
  const response = await apiClient.get<CourseRequestsResponse>('/course-requests');
  return response.data;
};

/**
 * Approve course request (admin only)
 */
export const approveCourseRequest = async (courseId: string): Promise<{ message: string; course: { id: string; title: string; status: string } }> => {
  const response = await apiClient.post<{ message: string; course: { id: string; title: string; status: string } }>(`/course-requests/${courseId}/approve`);
  return response.data;
};

/**
 * Reject course request (admin only)
 */
export const rejectCourseRequest = async (courseId: string, reason: string): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(`/course-requests/${courseId}/reject`, { reason });
  return response.data;
};

/**
 * Remove course (admin only)
 */
export const removeCourse = async (courseId: string, reason: string): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(`/course-requests/${courseId}/remove`, { reason });
  return response.data;
};
