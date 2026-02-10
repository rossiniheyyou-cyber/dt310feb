/**
 * Axios API client for the LMS backend.
 *
 * Uses an env-driven base URL.
 * In CRA, environment variables must be prefixed with REACT_APP_.
 */

import axios from 'axios';

const DEFAULT_BASE_URL = 'http://localhost:4000';

/**
 * PUBLIC_INTERFACE
 * Returns the configured API base URL (CRA: REACT_APP_API_BASE_URL).
 */
export function getApiBaseUrl() {
  return (process.env.REACT_APP_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
}

/**
 * Normalize various backend/axios error shapes into a stable { message, status, data } shape.
 */
function normalizeApiError(err) {
  // Axios error with response
  if (err?.response) {
    const status = err.response.status;
    const data = err.response.data;
    const message =
      data?.message ||
      data?.error ||
      (typeof data === 'string' ? data : '') ||
      `Request failed with status ${status}`;

    const normalized = new Error(message);
    normalized.status = status;
    normalized.data = data;
    return normalized;
  }

  // Axios error without response (network / CORS / DNS)
  if (err?.request) {
    const normalized = new Error('Network error: could not reach API server.');
    normalized.status = 0;
    normalized.data = null;
    return normalized;
  }

  // Unknown
  const normalized = new Error(err?.message || 'Unknown error');
  normalized.status = err?.status || 0;
  normalized.data = err?.data || null;
  return normalized;
}

/**
 * Shared axios instance.
 * - withCredentials is enabled for future compatibility with cookie-based auth.
 */
export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

/**
 * PUBLIC_INTERFACE
 * Sets (or clears) the Authorization bearer token on the shared axios instance.
 */
export function setApiAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

/**
 * PUBLIC_INTERFACE
 * Performs a request against the backend with normalized error handling.
 *
 * Prefer using `api.get/post/...` directly for simple calls; use this helper when you
 * want a stable thrown Error shape across the app.
 */
export async function apiRequest(config) {
  try {
    const res = await api.request(config);
    return res.data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}
