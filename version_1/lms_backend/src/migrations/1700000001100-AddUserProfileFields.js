const { MigrationInterface, QueryRunner } = require('typeorm');

/**
 * Migration: Add age, country, and phoneNumber to users table.
 */
module.exports = class AddUserProfileFields1700000001100 {
  name = 'AddUserProfileFields1700000001100';

  async up(queryRunner) {
    const table = await queryRunner.getTable('users');
    if (table) {
      const ageCol = table.findColumnByName('age');
      const countryCol = table.findColumnByName('country');
      const phoneCol = table.findColumnByName('phoneNumber');
      
      if (!ageCol) {
        await queryRunner.query(`
          ALTER TABLE users
          ADD COLUMN age INT NULL
        `);
        console.log('✓ Added users.age');
      } else {
        console.log('⚠ users.age already exists, skipping');
      }

      if (!countryCol) {
        await queryRunner.query(`
          ALTER TABLE users
          ADD COLUMN country VARCHAR(100) NULL
        `);
        console.log('✓ Added users.country');
      } else {
        console.log('⚠ users.country already exists, skipping');
      }

      if (!phoneCol) {
        await queryRunner.query(`
          ALTER TABLE users
          ADD COLUMN phoneNumber VARCHAR(20) NULL
        `);
        console.log('✓ Added users.phoneNumber');
      } else {
        console.log('⚠ users.phoneNumber already exists, skipping');
      }
    }
  }

  async down(queryRunner) {
    const table = await queryRunner.getTable('users');
    if (table) {
      if (table.findColumnByName('age')) {
        await queryRunner.query('ALTER TABLE users DROP COLUMN age');
        console.log('✓ Dropped users.age');
      }
      if (table.findColumnByName('country')) {
        await queryRunner.query('ALTER TABLE users DROP COLUMN country');
        console.log('✓ Dropped users.country');
      }
      if (table.findColumnByName('phoneNumber')) {
        await queryRunner.query('ALTER TABLE users DROP COLUMN phoneNumber');
        console.log('✓ Dropped users.phoneNumber');
      }
    }
  }
};
