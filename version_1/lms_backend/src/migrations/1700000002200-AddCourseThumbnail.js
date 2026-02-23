const { MigrationInterface, QueryRunner } = require('typeorm');

/**
 * Migration: Add thumbnail column to courses for image URL or file reference.
 */
module.exports = class AddCourseThumbnail1700000002200 {
  name = 'AddCourseThumbnail1700000002200';

  async up(queryRunner) {
    const table = await queryRunner.getTable('courses');
    if (table) {
      const colNames = table.columns.map((c) => c.name);
      if (!colNames.includes('thumbnail')) {
        await queryRunner.query(`ALTER TABLE courses ADD COLUMN thumbnail VARCHAR(1024) NULL`);
      }
    }
  }

  async down(queryRunner) {
    const table = await queryRunner.getTable('courses');
    if (table) {
      const colNames = table.columns.map((c) => c.name);
      if (colNames.includes('thumbnail')) {
        await queryRunner.query(`ALTER TABLE courses DROP COLUMN thumbnail`);
      }
    }
  }
};
