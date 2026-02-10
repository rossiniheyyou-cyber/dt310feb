const { MigrationInterface, QueryRunner } = require('typeorm');

/**
 * Migration: Add passwordResetToken and passwordResetExpires to users table.
 */
module.exports = class AddPasswordResetFields1700000001000 {
  name = 'AddPasswordResetFields1700000001000';

  async up(queryRunner) {
    const table = await queryRunner.getTable('users');
    if (table) {
      const tokenCol = table.findColumnByName('passwordResetToken');
      const expiresCol = table.findColumnByName('passwordResetExpires');
      
      if (!tokenCol) {
        await queryRunner.query(`
          ALTER TABLE users
          ADD COLUMN passwordResetToken VARCHAR(255) NULL
        `);
        console.log('✓ Added users.passwordResetToken');
      } else {
        console.log('⚠ users.passwordResetToken already exists, skipping');
      }

      if (!expiresCol) {
        await queryRunner.query(`
          ALTER TABLE users
          ADD COLUMN passwordResetExpires DATETIME NULL
        `);
        console.log('✓ Added users.passwordResetExpires');
      } else {
        console.log('⚠ users.passwordResetExpires already exists, skipping');
      }
    }
  }

  async down(queryRunner) {
    const table = await queryRunner.getTable('users');
    if (table) {
      if (table.findColumnByName('passwordResetToken')) {
        await queryRunner.query('ALTER TABLE users DROP COLUMN passwordResetToken');
        console.log('✓ Dropped users.passwordResetToken');
      }
      if (table.findColumnByName('passwordResetExpires')) {
        await queryRunner.query('ALTER TABLE users DROP COLUMN passwordResetExpires');
        console.log('✓ Dropped users.passwordResetExpires');
      }
    }
  }
};
