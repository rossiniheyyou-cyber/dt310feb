/**
 * API Client Configuration
 * Centralized axios instance with authentication and error handling
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Get API URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

let cachedNextAuthToken: string | null = null;
let cachedNextAuthTokenAt = 0;
const NEXTAUTH_TOKEN_TTL_MS = 60_000; // 1 minute cache to avoid session fetch on every request

// Request interceptor - Add auth token if available
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window === 'undefined') return config;
    if (!config.headers) return config;

    // 1) Preferred: backend JWT stored by local auth flow
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }

    // 2) Azure AD / NextAuth flow: use backend JWT attached to the NextAuth session (if present)
    const now = Date.now();
    if (cachedNextAuthToken && now - cachedNextAuthTokenAt < NEXTAUTH_TOKEN_TTL_MS) {
      config.headers.Authorization = `Bearer ${cachedNextAuthToken}`;
      return config;
    }

    try {
      const mod = await import('next-auth/react');
      const session = await mod.getSession();
      const sessionToken = (session?.user as { backendAccessToken?: string | null } | undefined)?.backendAccessToken;
      if (sessionToken) {
        cachedNextAuthToken = sessionToken;
        cachedNextAuthTokenAt = now;
        config.headers.Authorization = `Bearer ${sessionToken}`;
      }
    } catch {
      // ignore
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized - clear token and redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('digitalt3-current-user');
        // Only redirect if not already on auth page
        if (!window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth/login';
        }
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { API_BASE_URL };
