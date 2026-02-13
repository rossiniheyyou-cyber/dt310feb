/**
 * Quick script to update course status enum to include pending_approval and rejected
 * Run with: node scripts/add-course-statuses.js
 */

require('dotenv').config();
const { initializeDataSource } = require('../src/config/db');

async function updateCourseStatusEnum() {
  try {
    console.log('Connecting to database...');
    const ds = await initializeDataSource();

    console.log('Updating course status enum...');
    
    // Check current enum values
    const enumResult = await ds.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'courses' 
      AND COLUMN_NAME = 'status'
    `, [process.env.DEFAULT_DB]);

    if (enumResult.length > 0) {
      const currentEnum = enumResult[0].COLUMN_TYPE;
      if (currentEnum.includes('pending_approval') && currentEnum.includes('rejected')) {
        console.log('⚠ Course status enum already includes pending_approval and rejected!');
        await ds.destroy();
        return;
      }
    }

    // Update enum to include new statuses
    // Note: MySQL doesn't support ALTER ENUM directly, so we need to recreate the column
    await ds.query(`
      ALTER TABLE courses 
      MODIFY COLUMN status ENUM('draft', 'pending_approval', 'published', 'archived', 'rejected') 
      DEFAULT 'draft' 
      NOT NULL
    `);
    console.log('✓ Updated course status enum');

    await ds.destroy();
    console.log('✅ Migration complete!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

updateCourseStatusEnum();
