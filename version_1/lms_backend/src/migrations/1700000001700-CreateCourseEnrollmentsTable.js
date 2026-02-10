class CreateCourseEnrollmentsTable1700000001700 {
  name = 'CreateCourseEnrollmentsTable1700000001700';

  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE \`course_enrollments\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`userId\` int NOT NULL,
        \`courseId\` int NOT NULL,
        \`enrolledAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_user_course_enrollment\` (\`userId\`,\`courseId\`),
        KEY \`IDX_course_enrollments_userId\` (\`userId\`),
        KEY \`IDX_course_enrollments_courseId\` (\`courseId\`),
        CONSTRAINT \`FK_course_enrollments_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_course_enrollments_course\` FOREIGN KEY (\`courseId\`) REFERENCES \`courses\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  async down(queryRunner) {
    await queryRunner.query('DROP TABLE IF EXISTS `course_enrollments`');
  }
}

module.exports = { CreateCourseEnrollmentsTable1700000001700 };

