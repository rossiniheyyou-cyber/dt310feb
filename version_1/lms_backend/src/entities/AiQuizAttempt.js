const { EntitySchema } = require('typeorm');

const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];
const ATTEMPT_STATUSES = ['in_progress', 'completed'];

/**
 * AI-generated quiz attempt for learners (post-course / supplemental).
 * 10 MCQs, 4 options each; difficulty chosen by learner; AI feedback after submit.
 */
const AiQuizAttemptEntity = new EntitySchema({
  name: 'AiQuizAttempt',
  tableName: 'ai_quiz_attempts',
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
      type: 'varchar',
      length: 64,
      nullable: true,
    },
    courseTitle: {
      type: 'varchar',
      length: 500,
      nullable: false,
      default: '',
    },
    lessonTitle: {
      type: 'varchar',
      length: 500,
      nullable: true,
    },
    difficulty: {
      type: 'enum',
      enum: DIFFICULTY_LEVELS,
      default: 'medium',
    },
    status: {
      type: 'enum',
      enum: ATTEMPT_STATUSES,
      default: 'in_progress',
    },
    /** JSON array of { questionText, options[4], correctAnswerIndex } — 10 items */
    questionsSnapshot: {
      type: 'json',
      nullable: false,
    },
    /** JSON array of selected option indices (0-3) per question — length 10 after submit */
    answersSnapshot: {
      type: 'json',
      nullable: true,
    },
    score: {
      type: 'int',
      nullable: true,
      comment: 'Number of correct answers (0-10)',
    },
    totalQuestions: {
      type: 'int',
      nullable: false,
      default: 10,
    },
    /** AI-generated text: where the learner should improve */
    feedbackText: {
      type: 'text',
      nullable: true,
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
    { name: 'idx_ai_quiz_attempts_userId', columns: ['userId'] },
    { name: 'idx_ai_quiz_attempts_createdAt', columns: ['createdAt'] },
    { name: 'idx_ai_quiz_attempts_status', columns: ['status'] },
  ],
});

module.exports = { AiQuizAttemptEntity, DIFFICULTY_LEVELS, ATTEMPT_STATUSES };
