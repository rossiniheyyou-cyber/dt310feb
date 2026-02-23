const { EntitySchema } = require('typeorm');

/**
 * Instructor-created assessments (assignments, quizzes) with due dates.
 * Used for calendar visibility and learner assignment lists.
 */
const AssessmentEntity = new EntitySchema({
  name: 'Assessment',
  tableName: 'assessments',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: 'increment',
    },
    title: {
      type: 'varchar',
      length: 500,
      nullable: false,
    },
    description: {
      type: 'text',
      nullable: true,
    },
    courseId: {
      type: 'varchar',
      length: 64,
      nullable: true,
    },
    courseTitle: {
      type: 'varchar',
      length: 500,
      nullable: true,
    },
    pathSlug: {
      type: 'varchar',
      length: 64,
      nullable: true,
      default: 'fullstack',
    },
    module: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    moduleId: {
      type: 'varchar',
      length: 64,
      nullable: true,
    },
    type: {
      type: 'varchar',
      length: 32,
      nullable: false,
      default: 'assignment',
    },
    dueDateISO: {
      type: 'date',
      nullable: true,
    },
    passMark: {
      type: 'int',
      nullable: true,
    },
    totalPoints: {
      type: 'int',
      nullable: true,
    },
    createdById: {
      type: 'int',
      nullable: false,
    },
    status: {
      type: 'varchar',
      length: 32,
      nullable: false,
      default: 'published',
    },
    createdAt: {
      type: 'datetime',
      createDate: true,
    },
  },
  indices: [
    { name: 'idx_assessments_createdById', columns: ['createdById'] },
    { name: 'idx_assessments_dueDateISO', columns: ['dueDateISO'] },
  ],
});

module.exports = { AssessmentEntity };
