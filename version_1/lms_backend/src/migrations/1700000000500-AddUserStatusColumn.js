const { MigrationInterface, QueryRunner } = require('typeorm');

/**
 * Migration: Add status column to users table
 * Adds pending/active/revoked status for account approval system
 */
module.exports = class AddUserStatusColumn1700000000500 {
  name = 'AddUserStatusColumn1700000000500';

  async up(queryRunner) {
    // Check if column already exists
    const table = await queryRunner.getTable('users');
    const statusColumn = table?.findColumnByName('status');

    if (!statusColumn) {
      await queryRunner.query(`
        ALTER TABLE users 
        ADD COLUMN status ENUM('pending', 'active', 'revoked') 
        DEFAULT 'active' 
        NOT NULL
      `);
      console.log('✓ Added status column to users table');
    } else {
      console.log('⚠ status column already exists, skipping');
    }

    // Update existing users to 'active' if they don't have a status
    await queryRunner.query(`
      UPDATE users 
      SET status = 'active' 
      WHERE status IS NULL OR status = ''
    `);
    console.log('✓ Updated existing users to active status');
  }

  async down(queryRunner) {
    const table = await queryRunner.getTable('users');
    const statusColumn = table?.findColumnByName('status');

    if (statusColumn) {
      await queryRunner.query(`ALTER TABLE users DROP COLUMN status`);
      console.log('✓ Removed status column from users table');
    }
  }
};
