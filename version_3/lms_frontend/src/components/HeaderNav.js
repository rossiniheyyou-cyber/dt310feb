import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/**
 * PUBLIC_INTERFACE
 * Top navigation bar with basic auth-aware actions.
 */
export default function HeaderNav() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topnav">
      <div className="topnav-inner">
        <Link to="/" className="brand">
          DigitalT3 LMS
        </Link>

        <nav className="navlinks" aria-label="Primary">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'navlink active' : 'navlink')}>
            Home
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'navlink active' : 'navlink')}>
            Dashboard
          </NavLink>
        </nav>

        <div className="auth-actions">
          {!isAuthenticated ? (
            <>
              <Link className="btn btn-secondary" to="/signup">
                Sign up
              </Link>
              <Link className="btn btn-primary" to="/login">
                Login
              </Link>
            </>
          ) : (
            <>
              <span className="user-pill" title={user?.email}>
                {user?.name || user?.email}
              </span>
              <button type="button" className="btn btn-secondary" onClick={onLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
