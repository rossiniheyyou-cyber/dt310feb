const { MigrationInterface, QueryRunner } = require('typeorm');

/**
 * Migration: Add professionalTitle to users (Associate / Fullstack / Senior Fullstack Developer).
 */
module.exports = class AddUserProfessionalTitle1700000000900 {
  name = 'AddUserProfessionalTitle1700000000900';

  async up(queryRunner) {
    const table = await queryRunner.getTable('users');
    if (table) {
      const col = table.findColumnByName('professionalTitle');
      if (!col) {
        await queryRunner.query(`
          ALTER TABLE users
          ADD COLUMN professionalTitle ENUM('Associate Fullstack Developer', 'Fullstack Developer', 'Senior Fullstack Developer')
          NULL DEFAULT 'Fullstack Developer'
        `);
        console.log('✓ Added users.professionalTitle');
      } else {
        console.log('⚠ users.professionalTitle already exists, skipping');
      }
    }
  }

  async down(queryRunner) {
    const table = await queryRunner.getTable('users');
    if (table && table.findColumnByName('professionalTitle')) {
      await queryRunner.query('ALTER TABLE users DROP COLUMN professionalTitle');
      console.log('✓ Dropped users.professionalTitle');
    }
  }
};
