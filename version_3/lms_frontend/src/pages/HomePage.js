import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/**
 * PUBLIC_INTERFACE
 * Minimal landing page.
 */
export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="page">
      <div className="container">
        <div className="card">
          <h1 className="h1">Learning Insights Platform</h1>
          <p className="muted">
            Minimal frontend to validate backend APIs (auth, courses, lessons) with a clean Ocean Professional UI.
          </p>

          {!isAuthenticated ? (
            <div className="row">
              <Link className="btn btn-primary" to="/login">
                Login
              </Link>
              <Link className="btn btn-secondary" to="/signup">
                Create account
              </Link>
            </div>
          ) : (
            <div className="row">
              <p className="muted">Signed in as <strong>{user?.name || user?.email}</strong>.</p>
              <Link className="btn btn-primary" to="/dashboard">
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
