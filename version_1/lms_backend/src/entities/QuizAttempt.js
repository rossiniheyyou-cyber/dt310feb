const { EntitySchema } = require('typeorm');

const ATTEMPT_STATUSES = ['in_progress', 'completed'];

/**
 * Learner's attempt at an instructor-created quiz. Auto-graded on submit.
 */
const QuizAttemptEntity = new EntitySchema({
  name: 'QuizAttempt',
  tableName: 'quiz_attempts',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: 'increment',
    },
    quizId: {
      type: 'int',
      nullable: false,
    },
    userId: {
      type: 'int',
      nullable: false,
    },
    /** JSON array of selected option indices (0-3) per question */
    answersSnapshot: {
      type: 'json',
      nullable: true,
    },
    score: {
      type: 'int',
      nullable: true,
    },
    totalQuestions: {
      type: 'int',
      nullable: false,
      default: 10,
    },
    status: {
      type: 'enum',
      enum: ATTEMPT_STATUSES,
      default: 'in_progress',
    },
    createdAt: {
      type: 'datetime',
      createDate: true,
    },
    completedAt: {
      type: 'datetime',
      nullable: true,
    },
  },
  indices: [
    { name: 'idx_quiz_attempts_quizId', columns: ['quizId'] },
    { name: 'idx_quiz_attempts_userId', columns: ['userId'] },
    { name: 'idx_quiz_attempts_quiz_user', columns: ['quizId', 'userId'] },
  ],
});

module.exports = { QuizAttemptEntity, ATTEMPT_STATUSES };
