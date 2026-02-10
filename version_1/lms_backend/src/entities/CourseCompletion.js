const { EntitySchema } = require('typeorm');

/**
 * Course completion (per learner).
 * Used to notify the course instructor when a learner completes a course.
 */
const CourseCompletionEntity = new EntitySchema({
  name: 'CourseCompletion',
  tableName: 'course_completions',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: 'increment',
    },
    userId: {
      type: 'int',
      nullable: false,
    },
    courseId: {
      type: 'int',
      nullable: false,
    },
    completedAt: {
      type: 'datetime',
      createDate: true,
    },
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

module.exports = { CourseCompletionEntity };

