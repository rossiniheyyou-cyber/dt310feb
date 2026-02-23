const { MigrationInterface, QueryRunner } = require('typeorm');

/**
 * Migration: Add notification types new_assessment and assessment_submitted.
 * MySQL: MODIFY COLUMN to extend ENUM.
 */
module.exports = class AddNotificationTypesForAssessments1700000002600 {
  name = 'AddNotificationTypesForAssessments1700000002600';

  async up(queryRunner) {
    await queryRunner.query(`
      ALTER TABLE notifications
      MODIFY COLUMN type ENUM(
        'course_approved', 'course_rejected', 'user_approved', 'user_revoked',
        'course_removed', 'user_removed', 'new_assessment', 'assessment_submitted'
      ) NOT NULL
    `);
    console.log('✓ Extended notifications.type enum');
  }

  async down(queryRunner) {
    await queryRunner.query(`
      ALTER TABLE notifications
      MODIFY COLUMN type ENUM(
        'course_approved', 'course_rejected', 'user_approved', 'user_revoked',
        'course_removed', 'user_removed'
      ) NOT NULL
    `);
  }
};
