# Environment Variables & Integration Audit

## 1. Backend Environment (version_1/lms_backend)

### Where .env is loaded
- **File location**: `.env` at **backend root** (`version_1/lms_backend/.env`), **not** in `src/`.
- **Reason**: `require('dotenv').config()` in `src/server.js` loads from `process.cwd()`, which is the backend root when you run `npm run dev` from `lms_backend`.

### Backend variables (all read from `process.env`)

| Variable | Required | Used In | Purpose |
|----------|----------|---------|---------|
| **DB_HOST** | Yes | `config/db.js` | MySQL/RDS host |
| **DB_PORT** | No (default 3306) | `config/db.js` | MySQL port |
| **DB_USERNAME** | Yes | `config/db.js` | DB user |
| **DB_PASSWORD** | Yes | `config/db.js` | DB password |
| **DEFAULT_DB** | Yes | `config/db.js` | Database name |
| **DB_SSL** | No (default true) | `config/db.js` | Set `false` to disable TLS |
| **DB_SSL_CA_PATH** | No | `config/db.js` | Path to RDS CA bundle (e.g. global-bundle.pem) |
| **PORT** | No (default 3001) | `server.js` | Backend listener port |
| **HOST** | No (default 0.0.0.0) | `server.js` | Bind address |
| **ALLOWED_ORIGINS** | No (default *) | `app.js` | CORS origins, e.g. `http://localhost:3000` |
| **JWT_SECRET** | Yes for auth | `utils/jwt.js` | Secret for signing JWTs |
| **ANTHROPIC_API_KEY** | No (optional) | `services/ai.js` | Claude API key for AI features |
| **ANTHROPIC_MODEL** | No | `services/ai.js` | Default: `claude-sonnet-4-20250514` |
| **ANTHROPIC_MAX_TOKENS** | No | `services/ai.js` | Default: 1024 |
| **ANTHROPIC_VERSION** | No | `services/ai.js` | API version header |

### Database connection (SSL)
- **File**: `src/config/db.js`
- **Driver**: TypeORM with MySQL (uses mysql2 under the hood).
- **SSL**: Built from env via `buildMySqlSslOptionsFromEnv()`:
  - Uses `DB_SSL` / `DB_SSL_ENABLED` (default: TLS on).
  - Sets `rejectUnauthorized: false` for RDS (no hardcoding; all from env or safe defaults).
  - Optional CA from `DB_SSL_CA_PATH` or `global-bundle.pem` at backend root.

---

## 2. Frontend Environment (version_keerthana)

### Where .env is loaded
- **File**: `.env.local` at **frontend root** (`version_keerthana/.env.local`).
- Next.js loads `NEXT_PUBLIC_*` from `.env.local` at build/runtime.

### Frontend variables

| Variable | Required | Used In | Purpose |
|----------|----------|---------|---------|
| **NEXT_PUBLIC_API_URL** | Yes | `lib/api/client.ts` | Backend base URL for all API calls |

### Cross-check with backend
- Backend default port is **3001** (`server.js`: `PORT = process.env.PORT || 3001`).
- Frontend must use: **`NEXT_PUBLIC_API_URL=http://localhost:3001`** so login and all API calls hit the backend.

---

## 3. Claude / Anthropic integration

### Location
- **File**: `src/services/ai.js`
- **Used from**: `src/routes/lessons.js` (lesson create auto-AI, and `POST /lessons/:id/generate-ai`).

### Env usage (no hardcoding)
- **ANTHROPIC_API_KEY**: Read from `process.env.ANTHROPIC_API_KEY`. If missing, `new AIService()` throws with code `ANTHROPIC_API_KEY_MISSING`.
- **ANTHROPIC_MODEL**: `process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514'`.
- **ANTHROPIC_MAX_TOKENS**: `process.env.ANTHROPIC_MAX_TOKENS || 1024`.
- **ANTHROPIC_VERSION**: `process.env.ANTHROPIC_VERSION || '2023-06-01'`.

### Error handling (backend does not crash)
- **Lesson create** (`lessons.js`): `createAIService()` is inside a try/catch; on failure only a warning is logged and lesson creation still succeeds.
- **Generate-AI route** (`POST /lessons/:id/generate-ai`): Catches `ANTHROPIC_API_KEY_MISSING` and returns **503** with message `"AI service not configured (missing ANTHROPIC_API_KEY)"`. Other AI errors return 502/400 with messages. No unhandled throw to crash the server.

### Model version
- Default model: **claude-sonnet-4-20250514** (overridable via `ANTHROPIC_MODEL`).
- To use e.g. `claude-3-5-sonnet-latest` or `claude-3-opus`, set `ANTHROPIC_MODEL` in backend `.env`.

---

## 4. Security – .gitignore

### Backend (version_1/lms_backend/.gitignore)
- `.env` – present.
- `.env.local` and `.env.*.local` – added so env files with credentials are not committed.

### Frontend (version_keerthana/.gitignore)
- `.env*` – present, so `.env.local` and other env files are ignored.

**Do not commit**: RDS credentials, JWT_SECRET, ANTHROPIC_API_KEY, or any real secrets. Use `.env` only locally or in a secure CI secret store.

---

## 5. Login flow (simple implementation)

### Frontend (version_keerthana)
- **Login page**: `app/auth/login/page.tsx` sends `POST` to `NEXT_PUBLIC_API_URL + '/auth/login'` with `{ email, password }`.
- **API client**: `lib/api/client.ts` uses `process.env.NEXT_PUBLIC_API_URL` (fallback `http://localhost:3001`).
- **Auth service**: `lib/api/auth.ts` calls the backend and stores the JWT in localStorage.

### Backend (version_1/lms_backend)
- **Route**: `POST /auth/login` in `src/routes/auth.js`.
- **Logic**: Uses `getDataSource()` (TypeORM) to read from the `users` table; validates password with bcrypt; returns JWT and user object. No hardcoded credentials; all from DB and env.

### CORS
- Backend `app.js` uses `ALLOWED_ORIGINS` from env.
- Backend `.env` set to **`ALLOWED_ORIGINS=http://localhost:3000`** so the frontend dev server is allowed.

---

## 6. Summary of changes made

1. **Backend `.env`** created at `version_1/lms_backend/.env` with:
   - RDS credentials (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DEFAULT_DB).
   - DB_SSL=true.
   - PORT=3001, ALLOWED_ORIGINS=http://localhost:3000, JWT_SECRET.
   - Optional ANTHROPIC_* commented placeholders.

2. **Backend `server.js`**: After successful `initializeDataSource()`, logs **"Database Connected Successfully"**.

3. **Frontend `.env.local`**: **NEXT_PUBLIC_API_URL=http://localhost:3001** (matches backend PORT).

4. **Frontend `lib/api/client.ts`**: Fallback base URL set to `http://localhost:3001`.

5. **Backend `.gitignore`**: `.env.local` and `.env.*.local` added so env files are not committed.

---

## 7. Verification checklist

- [ ] Backend: `npm run dev` from `lms_backend` – terminal shows "Database Connected Successfully" when RDS is reachable.
- [ ] Backend: No `.env` or `.env.local` committed (check `git status`).
- [ ] Frontend: `NEXT_PUBLIC_API_URL` is `http://localhost:3001` in `.env.local`.
- [ ] Frontend: Login from http://localhost:3000/auth/login hits backend and returns token when credentials are valid.
- [ ] CORS: Requests from http://localhost:3000 to http://localhost:3001 are allowed.
- [ ] AI: If ANTHROPIC_API_KEY is missing, generate-ai returns 503 and server does not crash.
