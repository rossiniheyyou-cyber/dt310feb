import { apiRequest } from './client';

/**
 * PUBLIC_INTERFACE
 * Fetch paginated lessons from the backend (optionally filtered).
 */
export async function fetchLessons({ page = 1, limit = 20, courseId } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (courseId) params.set('courseId', String(courseId));

  return apiRequest({
    method: 'GET',
    url: `/api/lessons?${params.toString()}`,
  });
}
