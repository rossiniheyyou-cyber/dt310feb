const { EntitySchema } = require('typeorm');

/**
 * Instructor-created quiz assigned to a course. 10 MCQs, same shape as AI quiz.
 * questionsSnapshot: JSON array of { questionText, options[4], correctAnswerIndex }
 */
const QuizEntity = new EntitySchema({
  name: 'Quiz',
  tableName: 'quizzes',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: 'increment',
    },
    courseId: {
      type: 'int',
      nullable: false,
    },
    createdById: {
      type: 'int',
      nullable: false,
    },
    title: {
      type: 'varchar',
      length: 500,
      nullable: false,
    },
    /** JSON array of items: { questionText, options[4], correctAnswerIndex } */
    questionsSnapshot: {
      type: 'json',
      nullable: false,
    },
    /** Pass criteria: minimum correct to pass (out of totalPoints) */
    passMark: {
      type: 'int',
      nullable: true,
    },
    totalPoints: {
      type: 'int',
      nullable: true,
    },
    createdAt: {
      type: 'datetime',
      createDate: true,
    },
    updatedAt: {
      type: 'datetime',
      updateDate: true,
    },
  },
  indices: [
    { name: 'idx_quizzes_courseId', columns: ['courseId'] },
    { name: 'idx_quizzes_createdById', columns: ['createdById'] },
  ],
});

module.exports = { QuizEntity };
