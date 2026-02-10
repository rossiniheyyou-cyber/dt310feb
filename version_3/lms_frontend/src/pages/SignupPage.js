import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function isValidEmail(email) {
  return typeof email === 'string' && email.includes('@');
}

/**
 * PUBLIC_INTERFACE
 * Sign-up page (name + email + password) wired to POST /auth/register.
 */
export default function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (!name.trim()) return 'Please enter your name.';
    if (!isValidEmail(email)) return 'Please enter a valid email address.';
    if (!password || password.length < 8) return 'Password must be at least 8 characters.';
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
      await register({ name: name.trim(), email: email.trim(), password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.message || 'Sign-up failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="container narrow">
        <div className="card">
          <h1 className="h1">Create account</h1>
          <p className="muted">Register to start using the platform.</p>

          {error ? (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          ) : null}

          <form className="form" onSubmit={onSubmit}>
            <label className="field">
              <span className="field-label">Full name</span>
              <input
                className="input"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
              />
            </label>

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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
              />
              <span className="field-help">Use 8+ characters (backend requires minimum length 8).</span>
            </label>

            <div className="row row-between">
              <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating…' : 'Sign up'}
              </button>
              <Link className="link" to="/login">
                Already have an account? Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
