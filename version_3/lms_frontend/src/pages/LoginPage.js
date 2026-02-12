import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function isValidEmail(email) {
  return typeof email === 'string' && email.includes('@');
}

/**
 * PUBLIC_INTERFACE
 * Login page (email + password) wired to POST /auth/login.
 */
export default function LoginPage() {
  const { login, mockLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fromPath = useMemo(() => location.state?.from?.pathname || '/dashboard', [location.state]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (!isValidEmail(email)) return 'Please enter a valid email address.';
    if (!password) return 'Please enter your password.';
    return '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate(fromPath, { replace: true });
    } catch (err) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onMockLogin = async () => {
    setError('');
    try {
      mockLogin();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.message || 'Mock login failed.');
    }
  };

  return (
    <div className="page">
      <div className="container narrow">
        <div className="card">
          <h1 className="h1">Login</h1>
          <p className="muted">Sign in to access your dashboard.</p>

          {error ? (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          ) : null}

          <form className="form" onSubmit={onSubmit}>
            <label className="field">
              <span className="field-label">Email</span>
              <input
                className="input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </label>

            <label className="field">
              <span className="field-label">Password</span>
              <input
                className="input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </label>

            <div className="row row-between">
              <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in…' : 'Login'}
              </button>
              <Link className="link" to="/signup">
                Need an account? Sign up
              </Link>
            </div>

            <div className="row" style={{ marginTop: 8 }}>
              <button className="btn btn-secondary" type="button" onClick={onMockLogin} disabled={isSubmitting}>
                Mock Login (bypass)
              </button>
              <span className="field-help">
                For demos: skips real auth and takes you straight to the Dashboard.
              </span>
            </div>
          </form>

          <p className="hint">
            Tip: after login we call <code>/auth/me</code> using <code>Authorization: Bearer</code> to hydrate session state.
          </p>
        </div>
      </div>
    </div>
  );
}
