const { MigrationInterface, QueryRunner } = require('typeorm');

/**
 * Migration: Add pass criteria (passMark, totalPoints) to assessments and make dueDateISO nullable.
 * When assessments are added during course creation, there is no due date.
 */
module.exports = class AddAssessmentPassCriteriaAndOptionalDue1700000002100 {
  name = 'AddAssessmentPassCriteriaAndOptionalDue1700000002100';

  async up(queryRunner) {
    const table = await queryRunner.getTable('assessments');
    if (table) {
      // Make dueDateISO nullable
      await queryRunner.query(`
        ALTER TABLE assessments
        MODIFY COLUMN dueDateISO DATE NULL
      `);
      // Add pass criteria columns
      const colNames = table.columns.map((c) => c.name);
      if (!colNames.includes('passMark')) {
        await queryRunner.query(`ALTER TABLE assessments ADD COLUMN passMark INT NULL`);
      }
      if (!colNames.includes('totalPoints')) {
        await queryRunner.query(`ALTER TABLE assessments ADD COLUMN totalPoints INT NULL`);
      }
    }
  }

  async down(queryRunner) {
    const table = await queryRunner.getTable('assessments');
    if (table) {
      const cols = table.columns.map((c) => c.name);
      if (cols.includes('passMark')) {
        await queryRunner.query(`ALTER TABLE assessments DROP COLUMN passMark`);
      }
      if (cols.includes('totalPoints')) {
        await queryRunner.query(`ALTER TABLE assessments DROP COLUMN totalPoints`);
      }
      await queryRunner.query(`
        ALTER TABLE assessments
        MODIFY COLUMN dueDateISO DATE NOT NULL
      `);
    }
  }
};
