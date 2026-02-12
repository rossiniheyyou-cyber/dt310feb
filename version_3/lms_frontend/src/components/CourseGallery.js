import React, { useMemo, useState } from 'react';
import { usePaginatedCourses } from '../hooks/usePaginatedCourses';

function safeText(v) {
  return typeof v === 'string' ? v : '';
}

function CourseCard({ course }) {
  const title = safeText(course?.title || course?.name) || 'Untitled course';
  const description = safeText(course?.description) || 'No description available.';
  const level = safeText(course?.level);
  const category = safeText(course?.category);

  return (
    <article className="course-card">
      <div className="course-card-header">
        <h3 className="course-title">{title}</h3>
        <div className="course-badges">
          {category ? <span className="badge">{category}</span> : null}
          {level ? <span className="badge badge-muted">{level}</span> : null}
        </div>
      </div>
      <p className="course-desc">{description}</p>
    </article>
  );
}

/**
 * PUBLIC_INTERFACE
 * Course Gallery UI:
 * - Loads courses from backend using pagination + search filtering
 * - Shows loading/error/empty states
 */
export default function CourseGallery() {
  const {
    page,
    limit,
    search,
    items,
    total,
    totalPages,
    isLoading,
    error,
    setPage,
    setSearch,
    refresh,
  } = usePaginatedCourses({ initialLimit: 9 });

  const [searchInput, setSearchInput] = useState(search);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const rangeText = useMemo(() => {
    if (!total) return '0 courses';
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    return `${start}–${end} of ${total}`;
  }, [limit, page, total]);

  const onApplySearch = (e) => {
    e.preventDefault();
    const next = searchInput.trim();
    setPage(1);
    setSearch(next);
  };

  return (
    <section className="course-gallery">
      <div className="row row-between" style={{ marginTop: 0 }}>
        <div>
          <h2 className="h1" style={{ fontSize: 22, marginBottom: 6 }}>
            Course Gallery
          </h2>
          <p className="muted" style={{ marginBottom: 0 }}>
            Browse seeded courses and validate pagination + filtering.
          </p>
        </div>

        <div className="row" style={{ marginTop: 0 }}>
          <button className="btn btn-secondary" type="button" onClick={refresh} disabled={isLoading}>
            {isLoading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      <form className="course-toolbar" onSubmit={onApplySearch}>
        <label className="field" style={{ flex: 1, margin: 0 }}>
          <span className="field-label">Search</span>
          <input
            className="input"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by course name (e.g., AI Ethics)"
          />
          <span className="field-help">Uses backend filtering when available.</span>
        </label>

        <div className="row" style={{ marginTop: 0 }}>
          <button className="btn btn-primary" type="submit" disabled={isLoading}>
            Search
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              setSearchInput('');
              setPage(1);
              setSearch('');
            }}
            disabled={isLoading || (!search && !searchInput)}
          >
            Clear
          </button>
        </div>
      </form>

      {error ? (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="course-skeleton" aria-live="polite">
          <p className="muted">Loading courses…</p>
          <div className="course-grid">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div className="course-card skeleton" key={idx} />
            ))}
          </div>
        </div>
      ) : items?.length ? (
        <>
          <div className="course-grid" aria-live="polite">
            {items.map((c) => (
              <CourseCard key={String(c?.id || c?._id || c?.uuid || Math.random())} course={c} />
            ))}
          </div>

          <div className="course-pagination">
            <div className="muted">{rangeText}</div>
            <div className="row" style={{ marginTop: 0 }}>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!canPrev}
              >
                Prev
              </button>
              <div className="page-indicator" aria-label="Current page">
                Page <strong>{page}</strong> / {totalPages}
              </div>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={!canNext}
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="course-empty">
          <p className="muted" style={{ marginBottom: 10 }}>
            No courses found.
          </p>
          <button className="btn btn-secondary" type="button" onClick={refresh}>
            Try again
          </button>
        </div>
      )}
    </section>
  );
}
