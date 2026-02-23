const { MigrationInterface, QueryRunner } = require('typeorm');

/**
 * Migration: Add passMark and totalPoints to quizzes for pass criteria.
 */
module.exports = class AddQuizPassCriteria1700000002400 {
  name = 'AddQuizPassCriteria1700000002400';

  async up(queryRunner) {
    const table = await queryRunner.getTable('quizzes');
    if (table) {
      const colNames = table.columns.map((c) => c.name);
      if (!colNames.includes('passMark')) {
        await queryRunner.query(`ALTER TABLE quizzes ADD COLUMN passMark INT NULL`);
      }
      if (!colNames.includes('totalPoints')) {
        await queryRunner.query(`ALTER TABLE quizzes ADD COLUMN totalPoints INT NULL`);
      }
    }
  }

  async down(queryRunner) {
    const table = await queryRunner.getTable('quizzes');
    if (table) {
      const colNames = table.columns.map((c) => c.name);
      if (colNames.includes('passMark')) {
        await queryRunner.query(`ALTER TABLE quizzes DROP COLUMN passMark`);
      }
      if (colNames.includes('totalPoints')) {
        await queryRunner.query(`ALTER TABLE quizzes DROP COLUMN totalPoints`);
      }
    }
  }
};
