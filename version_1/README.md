# digitalt3-learning-insights-platform-311763-311772

## Backend

See `lms_backend/README.md` for configuration.

### Database

The backend uses **AWS RDS MySQL only** via TypeORM. Connection details are provided via environment variables in `lms_backend/.env`.

Required env vars:

- `DB_HOST`
- `DB_PORT` (default 3306)
- `DB_USERNAME`
- `DB_PASSWORD`
- `DEFAULT_DB`

SSL/TLS:

- `DB_SSL=true` (default behavior in code is enabled unless set false)
- Optional: `DB_SSL_CA_PATH=./global-bundle.pem`
- The connection enforces `rejectUnauthorized=false` as required for this environment.
