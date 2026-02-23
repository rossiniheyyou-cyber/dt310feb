# Run the LMS app (frontend + backend)

## Ports

- **Frontend (this app):** http://localhost:3000 — open this in your browser.
- **Backend API:** http://localhost:3001 — must be running for login and data.

**Important:** Always open the app at **http://localhost:3000**. Do not open http://localhost:3001 in the browser; that is the API server only. Opening 3001 can cause "ChunkLoadError" because Next.js chunks are served by the frontend on 3000.

## Steps

### 1. Start the backend (Terminal 1)

```bash
cd version_1/lms_backend
npm run dev
```

Wait until you see: `Server listening on http://0.0.0.0:3001`

### 2. Start the frontend (Terminal 2)

```bash
cd version_keerthana
npm run dev
```

Wait until you see: `Ready on http://localhost:3000`

### 3. Open the app

In your browser (or Cursor preview), open: **http://localhost:3000**

Use http://localhost:3000/auth/login to sign in.

## If you see "Cannot connect to server"

- Ensure the backend is running in Terminal 1 on port 3001.
- Ensure you opened **http://localhost:3000** (not 3001).

## If you see ChunkLoadError

- You are likely viewing http://localhost:3001. Open **http://localhost:3000** instead.
- Optionally clear the Next.js cache and restart the frontend:
  ```bash
  cd version_keerthana
  rmdir /s /q .next
  npm run dev
  ```
