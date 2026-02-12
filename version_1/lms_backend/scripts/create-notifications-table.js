/**
 * Quick script to create notifications table
 * Run with: node scripts/create-notifications-table.js
 */

require('dotenv').config();
const { initializeDataSource } = require('../src/config/db');

async function createNotificationsTable() {
  try {
    console.log('Connecting to database...');
    const ds = await initializeDataSource();

    console.log('Creating notifications table...');
    
    // Check if table exists
    const result = await ds.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'notifications'
    `, [process.env.DEFAULT_DB]);

    if (result.length > 0) {
      console.log('⚠ notifications table already exists!');
      await ds.destroy();
      return;
    }

    // Create the table
    await ds.query(`
      CREATE TABLE notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        type ENUM('course_approved', 'course_rejected', 'user_approved', 'user_revoked', 'course_removed', 'user_removed') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        reason TEXT NULL,
        metadata JSON NULL,
        isRead BOOLEAN NOT NULL DEFAULT FALSE,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        readAt DATETIME NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_userId (userId),
        INDEX idx_isRead (isRead),
        INDEX idx_createdAt (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created notifications table');

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

createNotificationsTable();
