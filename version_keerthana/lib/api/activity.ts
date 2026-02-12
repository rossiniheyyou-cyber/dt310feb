/**
 * Activity API Service
 * Handles system activity and instructor activity endpoints
 */

import apiClient from './client';

export interface SystemActivityEntry {
  id: string;
  type: 'user_created' | 'user_updated' | 'course_published' | 'course_archived' | 'certificate_issued' | 'login' | 'config_change';
  userId: string;
  userName: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface InstructorActivity {
  id: string;
  name: string;
  email: string;
  courseCount: number;
}

export interface ActivityResponse {
  activities: SystemActivityEntry[];
}

export interface InstructorActivityResponse {
  instructors: InstructorActivity[];
}

/**
 * Get recent system activity (admin only)
 */
export const getSystemActivity = async (limit: number = 20): Promise<ActivityResponse> => {
  const response = await apiClient.get<ActivityResponse>('/activity', {
    params: { limit },
  });
  return response.data;
};

/**
 * Get instructor activity (admin only)
 */
export const getInstructorActivity = async (): Promise<InstructorActivityResponse> => {
  const response = await apiClient.get<InstructorActivityResponse>('/activity/instructors');
  return response.data;
};
