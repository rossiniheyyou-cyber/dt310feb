class CreateUserProgressTable1700000001500 {
  name = 'CreateUserProgressTable1700000001500';

  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE \`user_progress\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`userId\` int NOT NULL,
        \`lessonId\` int NOT NULL,
        \`completedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_user_lesson\` (\`userId\`,\`lessonId\`),
        KEY \`IDX_user_progress_userId\` (\`userId\`),
        KEY \`IDX_user_progress_lessonId\` (\`lessonId\`),
        CONSTRAINT \`FK_user_progress_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_user_progress_lesson\` FOREIGN KEY (\`lessonId\`) REFERENCES \`lessons\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  async down(queryRunner) {
    await queryRunner.query('DROP TABLE IF EXISTS `user_progress`');
  }
}

module.exports = { CreateUserProgressTable1700000001500 };
