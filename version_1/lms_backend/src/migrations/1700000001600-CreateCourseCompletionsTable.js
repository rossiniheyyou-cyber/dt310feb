class CreateCourseCompletionsTable1700000001600 {
  name = 'CreateCourseCompletionsTable1700000001600';

  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE \`course_completions\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`userId\` int NOT NULL,
        \`courseId\` int NOT NULL,
        \`completedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_user_course_completion\` (\`userId\`,\`courseId\`),
        KEY \`IDX_course_completions_userId\` (\`userId\`),
        KEY \`IDX_course_completions_courseId\` (\`courseId\`),
        CONSTRAINT \`FK_course_completions_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_course_completions_course\` FOREIGN KEY (\`courseId\`) REFERENCES \`courses\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  async down(queryRunner) {
    await queryRunner.query('DROP TABLE IF EXISTS `course_completions`');
  }
}

module.exports = { CreateCourseCompletionsTable1700000001600 };

