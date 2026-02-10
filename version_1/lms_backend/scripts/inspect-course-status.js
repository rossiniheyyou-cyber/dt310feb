/**
 * Inspect the DB schema for courses.status enum and current pending_approval rows.
 * Run: node scripts/inspect-course-status.js
 */

require('dotenv').config();
const { initializeDataSource } = require('../src/config/db');

async function main() {
  const ds = await initializeDataSource();
  try {
    const [col] = await ds.query("SHOW COLUMNS FROM courses LIKE 'status'");
    console.log('courses.status column:', col);

    const rows = await ds.query(
      "SELECT id, title, status, deletedAt, createdAt, updatedAt FROM courses WHERE deletedAt IS NULL ORDER BY id DESC LIMIT 20"
    );
    console.log('latest courses (up to 20):');
    rows.forEach((r) => console.log(`- ${r.id}: ${r.title} (${r.status})`));

    const pending = await ds.query(
      "SELECT COUNT(*) AS count FROM courses WHERE deletedAt IS NULL AND status = 'pending_approval'"
    );
    console.log('pending_approval count:', pending?.[0]?.count);
  } finally {
    await ds.destroy();
  }
}

main().catch((e) => {
  console.error('inspect failed:', e);
  process.exit(1);
});

