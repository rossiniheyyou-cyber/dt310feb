class CreateMediaMetadataTable1700000000400 {
  name = 'CreateMediaMetadataTable1700000000400';

  // PUBLIC_INTERFACE
  async up(queryRunner) {
    /** Create media_metadata table for S3 file metadata storage. */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`media_metadata\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`s3Key\` varchar(1024) NOT NULL,
        \`contentType\` varchar(255) DEFAULT NULL,
        \`fileSize\` bigint DEFAULT NULL,
        \`originalFileName\` varchar(512) DEFAULT NULL,
        \`contentTypeCategory\` varchar(100) NOT NULL,
        \`courseId\` int DEFAULT NULL,
        \`lessonId\` int DEFAULT NULL,
        \`assignmentId\` int DEFAULT NULL,
        \`resourceId\` int DEFAULT NULL,
        \`uploadedBy\` int NOT NULL,
        \`deletedAt\` datetime DEFAULT NULL,
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_media_metadata_s3Key\` (\`s3Key\`(768)),
        KEY \`IDX_media_metadata_deletedAt\` (\`deletedAt\`),
        KEY \`IDX_media_metadata_courseId\` (\`courseId\`),
        KEY \`IDX_media_metadata_lessonId\` (\`lessonId\`),
        KEY \`IDX_media_metadata_assignmentId\` (\`assignmentId\`),
        KEY \`IDX_media_metadata_uploadedBy\` (\`uploadedBy\`),
        KEY \`IDX_media_metadata_contentTypeCategory\` (\`contentTypeCategory\`),
        CONSTRAINT \`FK_media_metadata_course\` FOREIGN KEY (\`courseId\`) REFERENCES \`courses\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_media_metadata_lesson\` FOREIGN KEY (\`lessonId\`) REFERENCES \`lessons\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_media_metadata_uploader\` FOREIGN KEY (\`uploadedBy\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  // PUBLIC_INTERFACE
  async down(queryRunner) {
    /** Drop media_metadata table. */
    await queryRunner.query('DROP TABLE IF EXISTS `media_metadata`');
  }
}

module.exports = { CreateMediaMetadataTable1700000000400 };
