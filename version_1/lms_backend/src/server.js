require('dotenv').config();

const app = require('./app');
const { initializeDataSource, getConfiguredDbName, getDbMeta } = require('./config/db');


const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  const dbName = getConfiguredDbName() || '(unknown)';

  // Safe startup log (no secrets).
  const dbHost = process.env.DB_HOST;
  const dbPort = process.env.DB_PORT || '3306';
  console.log(dbHost ? `MySQL target: ${dbHost}:${dbPort}/${dbName}` : 'MySQL target: (DB_HOST not set yet)');

  try {
    await initializeDataSource();
    console.log('Database Connected Successfully');
  } catch (err) {
    // Do not hard-fail startup: backend preview should boot even if DB isn't reachable yet.
    const code = err && err.code ? String(err.code) : null;

    if (code === 'MYSQL_ENV_MISSING') {
      console.warn(`DB not configured (missing env vars). Continuing to start server without DB. Error: ${err.message}`);
    } else {
      const meta = getDbMeta();
      const hint = meta ? `${meta.type} ${meta.host}:${meta.port}/${meta.database}` : 'unknown target';
      console.warn(`DB connection failed at startup (${hint}). Continuing to start server without DB. Error: ${err.message}`);
    }
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT}`);
    // Helpful for local dev convenience; binding is still controlled by HOST above.
    console.log(`Local access (if applicable): http://localhost:${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });

  return server;
}

module.exports = start();
