const { MigrationInterface, QueryRunner } = require('typeorm');

/**
 * Migration: Add description column to assessments for assignment problem statements.
 */
module.exports = class AddAssessmentDescription1700000002300 {
  name = 'AddAssessmentDescription1700000002300';

  async up(queryRunner) {
    const table = await queryRunner.getTable('assessments');
    if (table) {
      const colNames = table.columns.map((c) => c.name);
      if (!colNames.includes('description')) {
        await queryRunner.query(`ALTER TABLE assessments ADD COLUMN description TEXT NULL`);
      }
    }
  }

  async down(queryRunner) {
    const table = await queryRunner.getTable('assessments');
    if (table) {
      const colNames = table.columns.map((c) => c.name);
      if (colNames.includes('description')) {
        await queryRunner.query(`ALTER TABLE assessments DROP COLUMN description`);
      }
    }
  }
};
