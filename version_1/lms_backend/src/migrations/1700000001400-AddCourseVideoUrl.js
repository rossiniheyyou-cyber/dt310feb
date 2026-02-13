class AddCourseVideoUrl1700000001400 {
  name = 'AddCourseVideoUrl1700000001400';

  async up(queryRunner) {
    await queryRunner.query(
      'ALTER TABLE `courses` ADD COLUMN `videoUrl` varchar(1024) NULL'
    );
  }

  async down(queryRunner) {
    await queryRunner.query('ALTER TABLE `courses` DROP COLUMN `videoUrl`');
  }
}

module.exports = { AddCourseVideoUrl1700000001400 };
