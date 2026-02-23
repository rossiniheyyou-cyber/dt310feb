/**
 * Add overview, outcomes, and videoPlaylist to courses table.
 * - overview: TEXT, course overview/summary
 * - outcomes: JSON array of learning outcomes
 * - videoPlaylist: JSON array of { title, url } for video playlist
 */
module.exports = class AddCourseOverviewOutcomesPlaylist1700000002000 {
  name = 'AddCourseOverviewOutcomesPlaylist1700000002000';

  async up(queryRunner) {
    await queryRunner.query('ALTER TABLE `courses` ADD COLUMN `overview` text NULL');
    await queryRunner.query('ALTER TABLE `courses` ADD COLUMN `outcomes` json NULL');
    await queryRunner.query('ALTER TABLE `courses` ADD COLUMN `videoPlaylist` json NULL');
  }

  async down(queryRunner) {
    await queryRunner.query('ALTER TABLE `courses` DROP COLUMN `overview`');
    await queryRunner.query('ALTER TABLE `courses` DROP COLUMN `outcomes`');
    await queryRunner.query('ALTER TABLE `courses` DROP COLUMN `videoPlaylist`');
  }
};
