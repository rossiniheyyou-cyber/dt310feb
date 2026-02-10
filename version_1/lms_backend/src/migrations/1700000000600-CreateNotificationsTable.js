const { MigrationInterface, QueryRunner } = require('typeorm');

/**
 * Migration: Create notifications table
 * Stores notifications for users (course approvals, rejections, user revocations, etc.)
 */
module.exports = class CreateNotificationsTable1700000000600 {
  name = 'CreateNotificationsTable1700000000600';

  async up(queryRunner) {
    // Check if table already exists
    const table = await queryRunner.getTable('notifications');

    if (!table) {
      await queryRunner.query(`
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
    } else {
      console.log('⚠ notifications table already exists, skipping');
    }
  }

  async down(queryRunner) {
    const table = await queryRunner.getTable('notifications');
    if (table) {
      await queryRunner.query(`DROP TABLE IF EXISTS notifications`);
      console.log('✓ Dropped notifications table');
    }
  }
};
