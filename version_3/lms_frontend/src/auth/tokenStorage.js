const TOKEN_KEY = 'lms_access_token';

/**
 * PUBLIC_INTERFACE
 * Gets the current access token (if any) from storage.
 */
export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * PUBLIC_INTERFACE
 * Persists the access token in storage.
 */
export function setStoredToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Ignore storage failures (e.g., disabled storage)
  }
}

/**
 * PUBLIC_INTERFACE
 * Clears any stored access token.
 */
export function clearStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore
  }
}
