const { MigrationInterface, QueryRunner } = require('typeorm');

/**
 * Migration: Add status (draft/published) to assessments; create assessment_submissions table.
 */
module.exports = class AddAssessmentStatusAndSubmissions1700000002500 {
  name = 'AddAssessmentStatusAndSubmissions1700000002500';

  async up(queryRunner) {
    const table = await queryRunner.getTable('assessments');
    if (table) {
      const colNames = table.columns.map((c) => c.name);
      if (!colNames.includes('status')) {
        await queryRunner.query(`
          ALTER TABLE assessments
          ADD COLUMN status VARCHAR(32) NOT NULL DEFAULT 'published'
        `);
        console.log('✓ Added assessments.status');
      }
    }

    const subTable = await queryRunner.getTable('assessment_submissions');
    if (!subTable) {
      await queryRunner.query(`
        CREATE TABLE assessment_submissions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          userId INT NOT NULL,
          assessmentId INT NOT NULL,
          content TEXT NULL,
          fileKey VARCHAR(1024) NULL,
          status VARCHAR(32) NOT NULL DEFAULT 'submitted',
          submittedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          reviewedAt DATETIME NULL,
          instructorFeedback TEXT NULL,
          UNIQUE KEY UQ_user_assessment (userId, assessmentId),
          INDEX idx_assessment_submissions_userId (userId),
          INDEX idx_assessment_submissions_assessmentId (assessmentId),
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (assessmentId) REFERENCES assessments(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✓ Created assessment_submissions table');
    }
  }

  async down(queryRunner) {
    const table = await queryRunner.getTable('assessments');
    if (table && table.columns.some((c) => c.name === 'status')) {
      await queryRunner.query(`ALTER TABLE assessments DROP COLUMN status`);
    }
    const subTable = await queryRunner.getTable('assessment_submissions');
    if (subTable) {
      await queryRunner.query('DROP TABLE IF EXISTS assessment_submissions');
    }
  }
};
