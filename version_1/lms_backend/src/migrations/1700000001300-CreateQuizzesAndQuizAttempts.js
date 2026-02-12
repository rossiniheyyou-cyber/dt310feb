/**
 * Migration: Create quizzes (instructor-created, per course) and quiz_attempts (learner attempts, auto-graded).
 */
module.exports = class CreateQuizzesAndQuizAttempts1700000001300 {
  name = 'CreateQuizzesAndQuizAttempts1700000001300';

  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE quizzes (
        id INT NOT NULL AUTO_INCREMENT,
        courseId INT NOT NULL,
        createdById INT NOT NULL,
        title VARCHAR(500) NOT NULL,
        questionsSnapshot JSON NOT NULL,
        createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        INDEX idx_quizzes_courseId (courseId),
        INDEX idx_quizzes_createdById (createdById),
        CONSTRAINT FK_quizzes_course FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
        CONSTRAINT FK_quizzes_createdBy FOREIGN KEY (createdById) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      CREATE TABLE quiz_attempts (
        id INT NOT NULL AUTO_INCREMENT,
        quizId INT NOT NULL,
        userId INT NOT NULL,
        answersSnapshot JSON NULL,
        score INT NULL,
        totalQuestions INT NOT NULL DEFAULT 10,
        status ENUM('in_progress','completed') NOT NULL DEFAULT 'in_progress',
        createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        completedAt DATETIME(6) NULL,
        PRIMARY KEY (id),
        INDEX idx_quiz_attempts_quizId (quizId),
        INDEX idx_quiz_attempts_userId (userId),
        INDEX idx_quiz_attempts_quiz_user (quizId, userId),
        CONSTRAINT FK_quiz_attempts_quiz FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE,
        CONSTRAINT FK_quiz_attempts_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created quizzes and quiz_attempts tables');
  }

  async down(queryRunner) {
    await queryRunner.query('DROP TABLE IF EXISTS quiz_attempts');
    await queryRunner.query('DROP TABLE IF EXISTS quizzes');
    console.log('✓ Dropped quiz_attempts and quizzes tables');
  }
};
