/**
 * Verify MySQL/RDS database connection using credentials from .env only.
 * Run from backend root: npm run db:verify
 * No credentials are hardcoded; all values come from process.env after dotenv.config().
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');

function parseIntEnv(value, fallback) {
  const n = Number.parseInt(String(value || ''), 10);
  return Number.isFinite(n) ? n : fallback;
}

function buildSslOptionsFromEnv() {
  const sslEnabledRaw = process.env.DB_SSL || process.env.DB_SSL_ENABLED;
  const sslEnabled =
    sslEnabledRaw === undefined || sslEnabledRaw === null
      ? true
      : !['false', '0', 'no'].includes(String(sslEnabledRaw).toLowerCase());

  if (!sslEnabled) {
    return undefined;
  }

  const caPathFromEnv = process.env.DB_SSL_CA_PATH;
  const defaultCaPath = path.join(process.cwd(), 'global-bundle.pem');
  const caPath =
    caPathFromEnv && String(caPathFromEnv).trim().length > 0
      ? String(caPathFromEnv).trim()
      : defaultCaPath;

  let ca;
  try {
    if (fs.existsSync(caPath)) {
      ca = fs.readFileSync(caPath, 'utf8');
    }
  } catch {
    ca = undefined;
  }

  return {
    ...(ca ? { ca } : {}),
    rejectUnauthorized: false,
  };
}

(async () => {
  const host = process.env.DB_HOST;
  const port = parseIntEnv(process.env.DB_PORT, 3306);
  const user = process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DEFAULT_DB;

  const missing = [];
  if (!host) missing.push('DB_HOST');
  if (!user) missing.push('DB_USERNAME');
  if (!password) missing.push('DB_PASSWORD');
  if (!database) missing.push('DEFAULT_DB');

  if (missing.length > 0) {
    console.error('Missing env vars:', missing.join(', '));
    console.error('Set them in .env (backend root). Do not hardcode credentials in code.');
    process.exit(1);
  }

  const ssl = buildSslOptionsFromEnv();
  const config = {
    host,
    port,
    user,
    password,
    database,
    ...(ssl ? { ssl } : {}),
  };

  let conn;
  try {
    conn = await mysql.createConnection(config);
    const [rows] = await conn.execute('SELECT VERSION() AS v');
    console.log('Database Connected Successfully');
    console.log('MySQL version:', rows[0].v);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
