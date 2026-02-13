/**
 * User Management API Service
 * Handles user CRUD operations, account requests, and role management
 */

import apiClient from './client';

// Professional titles constant - matches backend and auth service
export const PROFESSIONAL_TITLES = ['Associate Fullstack Developer', 'Fullstack Developer', 'Senior Fullstack Developer'] as const;
export type ProfessionalTitle = (typeof PROFESSIONAL_TITLES)[number];

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'instructor' | 'learner' | 'manager';
  status?: 'pending' | 'active' | 'revoked';
  createdAt?: string;
}

export interface AccountRequest {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface UsersResponse {
  users: User[];
}

export interface RequestsResponse {
  requests: AccountRequest[];
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  role?: 'admin' | 'instructor' | 'learner' | 'manager';
  status?: 'pending' | 'active' | 'revoked';
  professionalTitle?: ProfessionalTitle | string;
}

/**
 * Get all users (admin only)
 */
export const getUsers = async (params?: { status?: string; role?: string }): Promise<UsersResponse> => {
  const response = await apiClient.get<UsersResponse>('/users', { params });
  return response.data;
};

/**
 * Get account requests (admin only)
 */
export const getAccountRequests = async (): Promise<RequestsResponse> => {
  const response = await apiClient.get<RequestsResponse>('/users/requests');
  return response.data;
};

/**
 * Approve account request (admin only)
 */
export const approveAccount = async (userId: string, role: 'learner' | 'instructor' | 'manager' | 'admin'): Promise<{ message: string; user: User }> => {
  const response = await apiClient.post<{ message: string; user: User }>(`/users/${userId}/approve`, { role });
  return response.data;
};

/**
 * Reject account request (admin only)
 */
export const rejectAccount = async (userId: string, reason: string): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(`/users/${userId}/reject`, { reason });
  return response.data;
};

/**
 * Revoke user account (admin only)
 */
export const revokeUser = async (userId: string, reason: string): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(`/users/${userId}/revoke`, { reason });
  return response.data;
};

/**
 * Update user (admin only)
 */
export const updateUser = async (userId: string, data: UpdateUserRequest): Promise<{ message: string; user: User }> => {
  const response = await apiClient.patch<{ message: string; user: User }>(`/users/${userId}`, data);
  return response.data;
};

/**
 * Get user by ID (admin only, or own profile)
 */
export const getUser = async (userId: string): Promise<{ user: User }> => {
  const response = await apiClient.get<{ user: User }>(`/users/${userId}`);
  return response.data;
};

/**
 * Search users by email (for manager team management)
 */
export const searchUsersByEmail = async (email: string): Promise<UsersResponse> => {
  const response = await apiClient.get<UsersResponse>('/users', {
    params: { search: email },
  });
  return response.data;
};
