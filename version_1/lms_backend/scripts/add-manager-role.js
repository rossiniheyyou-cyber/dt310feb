/**
 * Add 'manager' to users.role ENUM so manager signups work.
 * Run: node scripts/add-manager-role.js
 */
require('dotenv').config();
const { initializeDataSource } = require('../src/config/db');

async function addManagerRole() {
  try {
    const ds = await initializeDataSource();
    await ds.query(`
      ALTER TABLE users
      MODIFY COLUMN role ENUM('admin', 'instructor', 'learner', 'manager') NOT NULL DEFAULT 'learner'
    `);
    console.log('✓ Added manager to users.role enum');
    await ds.destroy();
  } catch (err) {
    if (err.message && err.message.includes("Duplicate column name")) {
      console.log('✓ Manager role already in enum');
      return;
    }
    console.error('Error:', err.message);
    process.exit(1);
  }
}

addManagerRole();
