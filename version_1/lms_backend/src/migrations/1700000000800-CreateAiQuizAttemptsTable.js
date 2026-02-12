const { MigrationInterface, QueryRunner } = require('typeorm');

/**
 * Migration: Create ai_quiz_attempts table for learner AI quiz logs.
 * Stores attempt metadata, 10 MCQs snapshot, answers, score, and AI feedback.
 */
module.exports = class CreateAiQuizAttemptsTable1700000000800 {
  name = 'CreateAiQuizAttemptsTable1700000000800';

  async up(queryRunner) {
    const table = await queryRunner.getTable('ai_quiz_attempts');
    if (!table) {
      await queryRunner.query(`
        CREATE TABLE ai_quiz_attempts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          userId INT NOT NULL,
          courseId VARCHAR(64) NULL,
          courseTitle VARCHAR(500) NOT NULL DEFAULT '',
          lessonTitle VARCHAR(500) NULL,
          difficulty ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
          status ENUM('in_progress', 'completed') NOT NULL DEFAULT 'in_progress',
          questionsSnapshot JSON NOT NULL,
          answersSnapshot JSON NULL,
          score INT NULL,
          totalQuestions INT NOT NULL DEFAULT 10,
          feedbackText TEXT NULL,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          completedAt DATETIME NULL,
          INDEX idx_ai_quiz_attempts_userId (userId),
          INDEX idx_ai_quiz_attempts_createdAt (createdAt),
          INDEX idx_ai_quiz_attempts_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✓ Created ai_quiz_attempts table');
    } else {
      console.log('⚠ ai_quiz_attempts table already exists, skipping');
    }
  }

  async down(queryRunner) {
    const table = await queryRunner.getTable('ai_quiz_attempts');
    if (table) {
      await queryRunner.query('DROP TABLE IF EXISTS ai_quiz_attempts');
      console.log('✓ Dropped ai_quiz_attempts table');
    }
  }
};
