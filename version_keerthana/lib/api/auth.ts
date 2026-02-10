/**
 * Authentication Service
 * Handles login, signup, token management, and user session
 */

import apiClient from './client';

// Type definitions matching backend response
export const PROFESSIONAL_TITLES = ['Associate Fullstack Developer', 'Fullstack Developer', 'Senior Fullstack Developer'] as const;
export type ProfessionalTitle = (typeof PROFESSIONAL_TITLES)[number];

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'instructor' | 'learner' | 'manager';
  professionalTitle?: ProfessionalTitle | string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  age?: number;
  country?: string;
  phoneNumber?: string;
}

export interface AuthResponseWithApproval extends AuthResponse {
  requiresApproval?: boolean;
  message?: string;
}

/**
 * Login user with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  
  // Store token and user info
  if (response.data.token) {
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('digitalt3-current-user', JSON.stringify({
      name: response.data.user.name,
      email: response.data.user.email,
      role: response.data.user.role,
      professionalTitle: response.data.user.professionalTitle ?? 'Fullstack Developer',
    }));
  }
  
  return response.data;
};

/**
 * Register new user
 */
export const register = async (data: RegisterData): Promise<AuthResponseWithApproval> => {
  const response = await apiClient.post<AuthResponseWithApproval>('/auth/register', data);
  
  // Store token and user info only if account is approved (has token)
  if (response.data.token) {
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('digitalt3-current-user', JSON.stringify({
      name: response.data.user.name,
      email: response.data.user.email,
      role: response.data.user.role,
      professionalTitle: response.data.user.professionalTitle ?? 'Fullstack Developer',
    }));
  }

  return response.data;
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<{ user: User }>('/auth/me');
  return response.data.user;
};

/**
 * Logout user - clear local storage and token
 */
export const logout = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('digitalt3-current-user');
  localStorage.removeItem('loggedEmails');
  localStorage.removeItem('users');
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('auth_token');
  return !!token;
};

/**
 * Update current user profile (name, professionalTitle)
 */
export const updateProfile = async (data: { name?: string; professionalTitle?: string }): Promise<{ user: User }> => {
  const response = await apiClient.patch<{ user: User }>('/auth/profile', data);
  return response.data;
};

/**
 * Get stored auth token
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

/**
 * Get user role for routing
 */
export const getUserRole = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const userStr = localStorage.getItem('digitalt3-current-user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.role || null;
    }
  } catch (e) {
    console.error('Error parsing user data:', e);
  }
  return null;
};

/**
 * Get dashboard route based on user role
 */
export const getDashboardRoute = (role: string): string => {
  switch (role) {
    case 'admin':
      return '/dashboard/admin';
    case 'instructor':
      return '/dashboard/instructor';
    case 'manager':
      return '/dashboard/manager';
    case 'learner':
    default:
      return '/dashboard/learner';
  }
};

/**
 * Request password reset
 */
export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string; // Only in development
  resetExpires?: string; // Only in development
}

export const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
  const response = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', { email });
  return response.data;
};

/**
 * Reset password with token
 */
export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export const resetPassword = async (data: ResetPasswordData): Promise<ResetPasswordResponse> => {
  const response = await apiClient.post<ResetPasswordResponse>('/auth/reset-password', data);
  return response.data;
};
