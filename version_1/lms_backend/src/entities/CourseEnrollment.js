const { EntitySchema } = require('typeorm');

/**
 * Course enrollment (per learner).
 * Used to restrict course/quizzes/assignments visibility to enrolled learners only.
 */
const CourseEnrollmentEntity = new EntitySchema({
  name: 'CourseEnrollment',
  tableName: 'course_enrollments',
  columns: {
    id: { type: 'int', primary: true, generated: 'increment' },
    userId: { type: 'int', nullable: false },
    courseId: { type: 'int', nullable: false },
    enrolledAt: { type: 'datetime', createDate: true },
  },
  indices: [
    { columns: ['userId'] },
    { columns: ['courseId'] },
    { columns: ['userId', 'courseId'], unique: true },
  ],
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'userId' },
      onDelete: 'CASCADE',
    },
    course: {
      type: 'many-to-one',
      target: 'Course',
      joinColumn: { name: 'courseId' },
      onDelete: 'CASCADE',
    },
  },
});

module.exports = { CourseEnrollmentEntity };

