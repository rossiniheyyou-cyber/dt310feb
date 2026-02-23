const { MigrationInterface, QueryRunner } = require('typeorm');

/**
 * Migration: Create calendar_events and assessments tables.
 * - calendar_events: user reminders, meetings, live classes
 * - assessments: instructor-created assignments/quizzes with due dates (for calendar visibility)
 */
module.exports = class CreateCalendarEventsAndAssessments1700000001900 {
  name = 'CreateCalendarEventsAndAssessments1700000001900';

  async up(queryRunner) {
    let table = await queryRunner.getTable('calendar_events');
    if (!table) {
      await queryRunner.query(`
        CREATE TABLE calendar_events (
          id INT AUTO_INCREMENT PRIMARY KEY,
          userId INT NOT NULL,
          title VARCHAR(500) NOT NULL,
          eventType ENUM('reminder', 'meeting', 'live_class') NOT NULL DEFAULT 'reminder',
          eventDate DATE NOT NULL,
          startTime VARCHAR(10) NULL,
          endTime VARCHAR(10) NULL,
          meetingLink VARCHAR(1000) NULL,
          courseId VARCHAR(64) NULL,
          courseTitle VARCHAR(500) NULL,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_calendar_events_userId (userId),
          INDEX idx_calendar_events_eventDate (eventDate)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✓ Created calendar_events table');
    }

    table = await queryRunner.getTable('assessments');
    if (!table) {
      await queryRunner.query(`
        CREATE TABLE assessments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          courseId VARCHAR(64) NULL,
          courseTitle VARCHAR(500) NULL,
          pathSlug VARCHAR(64) NULL DEFAULT 'fullstack',
          module VARCHAR(255) NULL,
          moduleId VARCHAR(64) NULL,
          type ENUM('assignment', 'quiz') NOT NULL DEFAULT 'assignment',
          dueDateISO DATE NOT NULL,
          createdById INT NOT NULL,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_assessments_createdById (createdById),
          INDEX idx_assessments_dueDateISO (dueDateISO)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✓ Created assessments table');
    }
  }

  async down(queryRunner) {
    const t1 = await queryRunner.getTable('calendar_events');
    if (t1) {
      await queryRunner.query('DROP TABLE IF EXISTS calendar_events');
      console.log('✓ Dropped calendar_events table');
    }
    const t2 = await queryRunner.getTable('assessments');
    if (t2) {
      await queryRunner.query('DROP TABLE IF EXISTS assessments');
      console.log('✓ Dropped assessments table');
    }
  }
};
