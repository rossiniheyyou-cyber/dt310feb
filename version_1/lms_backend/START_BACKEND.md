# Start the LMS Backend

The frontend (Next.js on port 3000) needs this backend running on **port 3001**.

## Why do I get "backend not running" or "EADDRINUSE"?

- **Port 3001 already in use** – The backend is started more than once (e.g. you ran `npm run dev` in one terminal, then again in another, or Cursor/IDE started it in the background). Only one process can listen on 3001. The second one crashes with `EADDRINUSE`, and if you then close terminals or kill processes, sometimes *no* backend is left running → frontend shows "Cannot connect to server."
- **Fix:** Run only one backend. If you see EADDRINUSE, free the port and start again (see below).

## Quick start

1. Open a terminal.
2. Go to the backend folder:
   ```bash
   cd version_1/lms_backend
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
4. When you see **"Server listening on http://0.0.0.0:3001"** and **"Local access: http://localhost:3001"**, the backend is ready.

## Check that it’s running

- In the browser: [http://localhost:3001/api/health](http://localhost:3001/api/health)  
  You should see: `{"status":"ok"}`

## If port 3001 is already in use

Another process is already using port 3001 (often another backend instance).

- **Option A:** Use the app as-is; the backend may already be running. Open http://localhost:3001/api/health to check.
- **Option B:** Free the port, then run `npm run dev` again.
  - **PowerShell (from repo root):** `.\version_1\lms_backend\scripts\free-port-3001.ps1` then `cd version_1\lms_backend; npm run dev`
  - **Or manually:** `netstat -ano | findstr ":3001"` → note the PID (last column) → `taskkill /PID <pid> /F` → `npm run dev`

## Frontend config

In `version_keerthana` ensure `.env.local` contains:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Restart the Next.js dev server after changing env so the browser gets the new URL.
