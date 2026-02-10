const { EntitySchema } = require('typeorm');

/**
 * MediaMetadata Entity
 * Stores metadata for files stored in S3 (not the file binaries).
 * Supports courses/lessons/videos, assignments/submissions, and resources/files.
 */
const MediaMetadataEntity = new EntitySchema({
  name: 'MediaMetadata',
  tableName: 'media_metadata',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: 'increment',
    },
    /**
     * S3 object key (e.g., courses/123/lessons/456/videos/video.mp4)
     * This is the path in S3, NOT a public URL.
     */
    s3Key: {
      type: 'varchar',
      length: 1024,
      nullable: false,
      unique: true,
    },
    /**
     * Content type (e.g., video/mp4, application/pdf)
     */
    contentType: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    /**
     * File size in bytes
     */
    fileSize: {
      type: 'bigint',
      nullable: true,
    },
    /**
     * Original filename (for display purposes)
     */
    originalFileName: {
      type: 'varchar',
      length: 512,
      nullable: true,
    },
    /**
     * Content category: 'lesson_video', 'assignment_submission', 'resource_file'
     */
    contentTypeCategory: {
      type: 'varchar',
      length: 100,
      nullable: false,
    },
    /**
     * Foreign key references (nullable, depends on category)
     */
    courseId: {
      type: 'int',
      nullable: true,
    },
    lessonId: {
      type: 'int',
      nullable: true,
    },
    assignmentId: {
      type: 'int',
      nullable: true,
    },
    resourceId: {
      type: 'int',
      nullable: true,
    },
    /**
     * User who uploaded the file
     */
    uploadedBy: {
      type: 'int',
      nullable: false,
    },
    /**
     * Soft delete support
     */
    deletedAt: {
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
  indices: [
    { columns: ['s3Key'] },
    { columns: ['deletedAt'] },
    { columns: ['courseId'] },
    { columns: ['lessonId'] },
    { columns: ['assignmentId'] },
    { columns: ['uploadedBy'] },
    { columns: ['contentTypeCategory'] },
  ],
  relations: {
    /**
     * Optional relation to Course (if this media belongs to a course)
     */
    course: {
      type: 'many-to-one',
      target: 'Course',
      joinColumn: { name: 'courseId' },
      nullable: true,
      onDelete: 'SET NULL',
    },
    /**
     * Optional relation to Lesson (if this media belongs to a lesson)
     */
    lesson: {
      type: 'many-to-one',
      target: 'Lesson',
      joinColumn: { name: 'lessonId' },
      nullable: true,
      onDelete: 'SET NULL',
    },
    /**
     * Relation to User (uploader)
     */
    uploader: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'uploadedBy' },
      nullable: false,
      onDelete: 'RESTRICT',
    },
  },
});

module.exports = { MediaMetadataEntity };
