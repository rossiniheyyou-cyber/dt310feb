const { EntitySchema } = require('typeorm');

/**
 * Calendar events: reminders (user-created), meetings, live classes.
 * Used by calendar page for all roles.
 */
const CalendarEventEntity = new EntitySchema({
  name: 'CalendarEvent',
  tableName: 'calendar_events',
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
    title: {
      type: 'varchar',
      length: 500,
      nullable: false,
    },
    eventType: {
      type: 'varchar',
      length: 32,
      nullable: false,
      default: 'reminder',
    },
    eventDate: {
      type: 'date',
      nullable: false,
    },
    startTime: {
      type: 'varchar',
      length: 10,
      nullable: true,
    },
    endTime: {
      type: 'varchar',
      length: 10,
      nullable: true,
    },
    meetingLink: {
      type: 'varchar',
      length: 1000,
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
    createdAt: {
      type: 'datetime',
      createDate: true,
    },
  },
  indices: [
    { name: 'idx_calendar_events_userId', columns: ['userId'] },
    { name: 'idx_calendar_events_eventDate', columns: ['eventDate'] },
  ],
});

module.exports = { CalendarEventEntity };
