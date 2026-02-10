const { EntitySchema } = require('typeorm');

/**
 * Lesson completion (user progress).
 * When a learner clicks "Complete Lesson", a row is added here.
 * Manager view: COUNT(*) FROM user_progress WHERE user_id = ?.
 */
const UserProgressEntity = new EntitySchema({
  name: 'UserProgress',
  tableName: 'user_progress',
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
    lessonId: {
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
    { columns: ['lessonId'] },
    { columns: ['userId', 'lessonId'], unique: true },
  ],
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'userId' },
      onDelete: 'CASCADE',
    },
    lesson: {
      type: 'many-to-one',
      target: 'Lesson',
      joinColumn: { name: 'lessonId' },
      onDelete: 'CASCADE',
    },
  },
});

module.exports = { UserProgressEntity };
