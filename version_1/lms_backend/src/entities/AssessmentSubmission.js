const { EntitySchema } = require('typeorm');

/**
 * Learner submission for an assignment-type assessment.
 * Used to show "completed" on calendar and to notify instructor.
 */
const AssessmentSubmissionEntity = new EntitySchema({
  name: 'AssessmentSubmission',
  tableName: 'assessment_submissions',
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
    assessmentId: {
      type: 'int',
      nullable: false,
    },
    content: {
      type: 'text',
      nullable: true,
      comment: 'Text/link or summary of submission',
    },
    fileKey: {
      type: 'varchar',
      length: 1024,
      nullable: true,
    },
    status: {
      type: 'varchar',
      length: 32,
      nullable: false,
      default: 'submitted',
    },
    submittedAt: {
      type: 'datetime',
      createDate: true,
    },
    reviewedAt: {
      type: 'datetime',
      nullable: true,
    },
    instructorFeedback: {
      type: 'text',
      nullable: true,
    },
  },
  indices: [
    { name: 'idx_assessment_submissions_userId', columns: ['userId'] },
    { name: 'idx_assessment_submissions_assessmentId', columns: ['assessmentId'] },
    { name: 'idx_assessment_submissions_user_assessment', columns: ['userId', 'assessmentId'], unique: true },
  ],
});

module.exports = { AssessmentSubmissionEntity };
