const { MigrationInterface, QueryRunner } = require('typeorm');

/**
 * Migration: Add learningProfile JSON column to users for learning target, goal, known skills.
 */
module.exports = class AddUserLearningProfile1700000001800 {
  name = 'AddUserLearningProfile1700000001800';

  async up(queryRunner) {
    const table = await queryRunner.getTable('users');
    if (table) {
      const col = table.findColumnByName('learningProfile');
      if (!col) {
        await queryRunner.query(`
          ALTER TABLE users
          ADD COLUMN learningProfile JSON NULL
        `);
        console.log('✓ Added users.learningProfile');
      } else {
        console.log('⚠ users.learningProfile already exists, skipping');
      }
    }
  }

  async down(queryRunner) {
    const table = await queryRunner.getTable('users');
    if (table && table.findColumnByName('learningProfile')) {
      await queryRunner.query('ALTER TABLE users DROP COLUMN learningProfile');
      console.log('✓ Dropped users.learningProfile');
    }
  }
};
