const { EntitySchema } = require('typeorm');

const ROLES = ['admin', 'instructor', 'learner', 'manager', 'PENDING', 'ADMIN', 'MANAGER', 'INSTRUCTOR', 'LEARNER'];

const AUTH_PROVIDERS = ['LOCAL', 'AZURE'];

const PROFESSIONAL_TITLES = ['Associate Fullstack Developer', 'Fullstack Developer', 'Senior Fullstack Developer'];

const UserEntity = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: 'increment',
    },
    email: {
      type: 'varchar',
      length: 255,
      unique: true,
    },
    passwordHash: {
      type: 'varchar',
      length: 255,
      // Nullable for Azure users who sign in with Microsoft
      nullable: true,
    },
    name: {
      type: 'varchar',
      length: 200,
    },
    age: {
      type: 'int',
      nullable: true,
    },
    country: {
      type: 'varchar',
      length: 100,
      nullable: true,
    },
    phoneNumber: {
      type: 'varchar',
      length: 20,
      nullable: true,
    },
    /** LOCAL = email/password, AZURE = Microsoft */
    authProvider: {
      type: 'enum',
      enum: AUTH_PROVIDERS,
      default: 'LOCAL',
    },
    /** true for staff (managers/instructors/admins), false for learners */
    isInternal: {
      type: 'boolean',
      default: false,
    },
    role: {
      type: 'enum',
      enum: ROLES,
      default: 'learner',
    },
    /** Azure AD Object ID for Azure-authenticated users */
    azureId: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    /** Professional title for display (Associate / Fullstack / Senior Fullstack Developer) */
    professionalTitle: {
      type: 'enum',
      enum: PROFESSIONAL_TITLES,
      default: 'Fullstack Developer',
      nullable: true,
    },
    status: {
      type: 'enum',
      enum: ['pending', 'active', 'revoked'],
      default: 'pending',
    },

    /**
     * Readiness score (0..100) updated when the learner submits quizzes.
     * For now this is a simple rolling average across quiz submissions.
     */
    readinessScore: {
      type: 'decimal',
      precision: 5,
      scale: 2,
      nullable: false,
      default: 0,
    },
    readinessScoreUpdatedAt: {
      type: 'datetime',
      nullable: true,
    },
    readinessScoreQuizCount: {
      type: 'int',
      nullable: false,
      default: 0,
    },

    /**
     * Password reset token (random string, stored hashed)
     */
    passwordResetToken: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    /**
     * Password reset token expiration timestamp
     */
    passwordResetExpires: {
      type: 'datetime',
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
  relations: {
    coursesCreated: {
      type: 'one-to-many',
      target: 'Course',
      inverseSide: 'createdBy',
    },
    coursesUpdated: {
      type: 'one-to-many',
      target: 'Course',
      inverseSide: 'updatedBy',
    },
  },
});

module.exports = { UserEntity, ROLES, AUTH_PROVIDERS, PROFESSIONAL_TITLES };
