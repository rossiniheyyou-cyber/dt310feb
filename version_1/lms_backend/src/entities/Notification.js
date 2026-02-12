const { EntitySchema } = require('typeorm');

const NotificationEntity = new EntitySchema({
  name: 'Notification',
  tableName: 'notifications',
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
    type: {
      type: 'enum',
      enum: ['course_approved', 'course_rejected', 'user_approved', 'user_revoked', 'course_removed', 'user_removed'],
      nullable: false,
    },
    title: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    message: {
      type: 'text',
      nullable: false,
    },
    reason: {
      type: 'text',
      nullable: true,
    },
    metadata: {
      type: 'json',
      nullable: true,
    },
    isRead: {
      type: 'boolean',
      default: false,
      nullable: false,
    },
    createdAt: {
      type: 'datetime',
      createDate: true,
    },
    readAt: {
      type: 'datetime',
      nullable: true,
    },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'userId', referencedColumnName: 'id' },
    },
  },
});

module.exports = { NotificationEntity };
