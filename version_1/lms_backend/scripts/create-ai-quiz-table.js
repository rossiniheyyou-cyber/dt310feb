/**
 * Create ai_quiz_attempts table if it doesn't exist.
 * Use this when the full migration run fails (e.g. due to another migration).
 * Run from backend root: node scripts/create-ai-quiz-table.js
 */

require('dotenv').config();
const { initializeDataSource, getDataSource } = require('../src/config/db');

const CREATE_SQL = `
  CREATE TABLE IF NOT EXISTS ai_quiz_attempts (
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
`;

(async () => {
  try {
    await initializeDataSource();
    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      console.error('Database not initialized. Check DB_* env vars.');
      process.exit(1);
    }
    await ds.query(CREATE_SQL);
    console.log('✓ ai_quiz_attempts table is ready (created or already exists).');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
