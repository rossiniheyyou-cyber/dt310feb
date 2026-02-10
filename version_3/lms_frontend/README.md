# Lightweight React Template for KAVIA (LMS Frontend)

This is a minimal Create React App (CRA) frontend used to validate backend APIs. It includes Login/Sign-up screens wired to the backend JWT auth endpoints.

## Quickstart

```bash
npm install
npm start
```

## Configure backend URL

Create a `.env` file in `lms_frontend/` (CRA requires `REACT_APP_` prefix):

```bash
REACT_APP_API_BASE_URL=http://localhost:4000
```

Notes:
- The frontend calls:
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/me`
- After login/sign-up, the JWT is stored in `localStorage` (interim approach) and sent as `Authorization: Bearer <token>` on authenticated requests.

## How to test

1. Start the backend (make sure CORS allows `http://localhost:3000`).
2. Start this frontend (`npm start`).
3. Visit:
   - `/signup` to create an account
   - `/login` to sign in
   - `/dashboard` (protected) to confirm route guarding and `/auth/me` hydration

## UI notes

Theme is "Ocean Professional" (Classic) with:
- Clean form inputs
- Loading states (button text changes)
- Inline error display
- A top nav showing Login/Sign-up (guest) and Logout (authenticated)

## Default CRA scripts

### `npm start`
Runs the app in development mode at http://localhost:3000.

### `npm test`
Launches the test runner.

### `npm run build`
Builds the app for production.
