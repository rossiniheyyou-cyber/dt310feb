/**
 * Migration: Add 'manager' to users.role ENUM
 * So manager signups are stored correctly and login redirects to manager dashboard.
 * Run: npm run db:migrate (or typeorm migration:run)
 */
module.exports = class AddManagerRoleToUsers1700000000700 {
  name = 'AddManagerRoleToUsers1700000000700';

  async up(queryRunner) {
    await queryRunner.query(`
      ALTER TABLE users
      MODIFY COLUMN role ENUM('admin', 'instructor', 'learner', 'manager') NOT NULL DEFAULT 'learner'
    `);
    console.log('✓ Added manager to users.role enum');
  }

  async down(queryRunner) {
    await queryRunner.query(`
      ALTER TABLE users
      MODIFY COLUMN role ENUM('admin', 'instructor', 'learner') NOT NULL DEFAULT 'learner'
    `);
    console.log('✓ Reverted users.role enum');
  }
};
