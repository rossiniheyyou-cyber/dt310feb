/**
 * Quick script to add status column to users table
 * Run with: node scripts/add-status-column.js
 */

require('dotenv').config();
const { initializeDataSource } = require('../src/config/db');

async function addStatusColumn() {
  try {
    console.log('Connecting to database...');
    const ds = await initializeDataSource();

    console.log('Adding status column...');
    
    // Check if column exists
    const result = await ds.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'status'
    `, [process.env.DEFAULT_DB]);

    if (result.length > 0) {
      console.log('⚠ status column already exists!');
      await ds.destroy();
      return;
    }

    // Add the column
    await ds.query(`
      ALTER TABLE users 
      ADD COLUMN status ENUM('pending', 'active', 'revoked') 
      DEFAULT 'active' 
      NOT NULL
    `);
    console.log('✓ Added status column');

    // Update existing users
    await ds.query(`
      UPDATE users 
      SET status = 'active' 
      WHERE status IS NULL OR status = ''
    `);
    console.log('✓ Updated existing users to active status');

    await ds.destroy();
    console.log('✅ Migration complete!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.message.includes('Unknown column')) {
      console.error('   Column might already exist or table structure is different.');
    }
    process.exit(1);
  }
}

addStatusColumn();
