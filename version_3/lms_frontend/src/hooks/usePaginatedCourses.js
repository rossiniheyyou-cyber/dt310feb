import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchCourses } from '../api/courses';

function normalizeCoursesResponse(payload) {
  // Try common shapes:
  // 1) { items: [...], total, page, limit }
  // 2) { data: [...], meta: { total, page, limit } }
  // 3) { courses: [...], total }
  // 4) [ ... ] (array)
  if (Array.isArray(payload)) {
    return { items: payload, total: payload.length, page: 1, limit: payload.length };
  }

  const items = payload?.items || payload?.data || payload?.courses || [];
  const meta = payload?.meta || payload?.pagination || {};
  const total = payload?.total ?? meta?.total ?? meta?.count ?? items.length;
  const page = payload?.page ?? meta?.page ?? 1;
  const limit = payload?.limit ?? meta?.limit ?? items.length;

  return { items, total, page, limit };
}

/**
 * PUBLIC_INTERFACE
 * React hook to fetch and manage paginated course data.
 */
export function usePaginatedCourses({ initialPage = 1, initialLimit = 12, initialSearch = '' } = {}) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState(initialSearch);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const totalPages = useMemo(() => {
    const denom = Number(limit) || 1;
    return Math.max(1, Math.ceil((Number(total) || 0) / denom));
  }, [limit, total]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const payload = await fetchCourses({ page, limit, search });
      const normalized = normalizeCoursesResponse(payload);
      setItems(Array.isArray(normalized.items) ? normalized.items : []);
      setTotal(Number(normalized.total) || 0);
    } catch (err) {
      setError(err?.message || 'Failed to load courses.');
      setItems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    // query state
    page,
    limit,
    search,
    // data
    items,
    total,
    totalPages,
    // ui state
    isLoading,
    error,
    // actions
    setPage,
    setLimit,
    setSearch,
    refresh,
  };
}
