/**
 * Notifications API Service
 */

import apiClient from './client';

export interface Notification {
  id: string;
  type: 'course_approved' | 'course_rejected' | 'user_approved' | 'user_revoked' | 'course_removed' | 'user_removed';
  title: string;
  message: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

/**
 * Get user's notifications
 */
export const getNotifications = async (unreadOnly: boolean = false): Promise<NotificationsResponse> => {
  const response = await apiClient.get<NotificationsResponse>('/notifications', {
    params: { unreadOnly },
  });
  return response.data;
};

/**
 * Mark notification as read
 */
export const markNotificationRead = async (notificationId: string): Promise<{ message: string }> => {
  const response = await apiClient.patch<{ message: string }>(`/notifications/${notificationId}/read`);
  return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsRead = async (): Promise<{ message: string }> => {
  const response = await apiClient.patch<{ message: string }>('/notifications/read-all');
  return response.data;
};
