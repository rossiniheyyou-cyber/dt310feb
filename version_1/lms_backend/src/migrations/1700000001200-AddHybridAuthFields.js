/**
 * Migration: Hybrid auth – auth_provider, is_internal, role PENDING/uppercase, azure_id, password_hash nullable.
 * Keeps age, country, phoneNumber. Run: npm run db:migrate
 */
module.exports = class AddHybridAuthFields1700000001200 {
  name = 'AddHybridAuthFields1700000001200';

  async up(queryRunner) {
    const table = await queryRunner.getTable('users');
    if (!table) return;

    // Make passwordHash nullable (Azure users have no password)
    await queryRunner.query(`
      ALTER TABLE users
      MODIFY COLUMN passwordHash VARCHAR(255) NULL
    `);
    console.log('✓ users.passwordHash is now nullable');

    // Add auth_provider: ENUM('LOCAL','AZURE') default LOCAL
    if (!table.findColumnByName('authProvider')) {
      await queryRunner.query(`
        ALTER TABLE users
        ADD COLUMN authProvider ENUM('LOCAL','AZURE') NOT NULL DEFAULT 'LOCAL'
      `);
      console.log('✓ Added users.authProvider');
    }

    // Add is_internal: boolean default false
    if (!table.findColumnByName('isInternal')) {
      await queryRunner.query(`
        ALTER TABLE users
        ADD COLUMN isInternal TINYINT(1) NOT NULL DEFAULT 0
      `);
      console.log('✓ Added users.isInternal');
    }

    // Extend role enum to include PENDING and uppercase (keep existing for backward compat)
    await queryRunner.query(`
      ALTER TABLE users
      MODIFY COLUMN role ENUM(
        'admin','instructor','learner','manager',
        'PENDING','ADMIN','MANAGER','INSTRUCTOR','LEARNER'
      ) NOT NULL DEFAULT 'learner'
    `);
    console.log('✓ Extended users.role enum');

    // Add azure_id nullable string
    if (!table.findColumnByName('azureId')) {
      await queryRunner.query(`
        ALTER TABLE users
        ADD COLUMN azureId VARCHAR(255) NULL
      `);
      console.log('✓ Added users.azureId');
    }
  }

  async down(queryRunner) {
    const table = await queryRunner.getTable('users');
    if (!table) return;

    if (table.findColumnByName('azureId')) {
      await queryRunner.query('ALTER TABLE users DROP COLUMN azureId');
      console.log('✓ Dropped users.azureId');
    }

    await queryRunner.query(`
      ALTER TABLE users
      MODIFY COLUMN role ENUM('admin','instructor','learner','manager') NOT NULL DEFAULT 'learner'
    `);

    if (table.findColumnByName('isInternal')) {
      await queryRunner.query('ALTER TABLE users DROP COLUMN isInternal');
    }
    if (table.findColumnByName('authProvider')) {
      await queryRunner.query('ALTER TABLE users DROP COLUMN authProvider');
    }

    await queryRunner.query(`
      ALTER TABLE users
      MODIFY COLUMN passwordHash VARCHAR(255) NOT NULL
    `);
  }
};
