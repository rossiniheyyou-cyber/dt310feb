import { apiRequest } from './client';

/**
 * PUBLIC_INTERFACE
 * Fetch paginated courses from the backend.
 *
 * Notes:
 * - This function is written to be compatible with common pagination styles.
 * - It accepts a `search` term for filtering by course name/title.
 */
export async function fetchCourses({ page = 1, limit = 12, search = '' } = {}) {
  const params = new URLSearchParams();

  // Support a couple of common backend param names without hardcoding a single one.
  // If the backend only accepts one style, the extra params are typically ignored.
  params.set('page', String(page));
  params.set('limit', String(limit));
  params.set('q', search || '');
  params.set('search', search || '');
  params.set('name', search || '');

  // Backend likely serves under /api/*; keep this aligned with existing backend routing.
  return apiRequest({
    method: 'GET',
    url: `/api/courses?${params.toString()}`,
  });
}
