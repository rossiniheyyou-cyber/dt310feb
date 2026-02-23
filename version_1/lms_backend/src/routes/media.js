const express = require('express');
const { getDataSource } = require('../config/db');
const { getUploadPresignedUrl, getPresignedUrl } = require('../services/storage');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

const router = express.Router();

const WRITE_ROLES = ['admin', 'instructor'];
const READ_ROLES = ['admin', 'instructor', 'learner'];

/**
 * Helper: validate positive integer ID
 */
function isValidId(raw) {
  const n = Number.parseInt(String(raw || ''), 10);
  return Number.isFinite(n) && n > 0;
}

/**
 * Helper: sanitize filename for S3 key
 */
function sanitizeFileName(fileName) {
  return String(fileName || '')
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 255);
}

/**
 * Helper: build S3 key based on category and IDs
 */
function buildS3Key(category, params) {
  const { courseId, lessonId, assignmentId, resourceId, fileName, userId } = params;
  const sanitized = sanitizeFileName(fileName);

  switch (category) {
    case 'course_thumbnail':
      return `courses/${courseId || 'draft'}/thumbnails/${userId || 'user'}_${Date.now()}_${sanitized}`;
    case 'lesson_video':
      if (!courseId || !lessonId) {
        throw new Error('courseId and lessonId required for lesson_video');
      }
      return `courses/${courseId}/lessons/${lessonId}/videos/${sanitized}`;

    case 'assignment_submission':
      if (!assignmentId) {
        throw new Error('assignmentId required for assignment_submission');
      }
      return `assignments/${assignmentId}/submissions/${sanitized}`;

    case 'resource_file':
      if (!resourceId) {
        throw new Error('resourceId required for resource_file');
      }
      return `resources/${resourceId}/files/${sanitized}`;

    default:
      throw new Error(`Invalid contentTypeCategory: ${category}`);
  }
}

/**
 * Helper: check if user has access to content
 */
async function checkContentAccess(user, category, params) {
  const ds = getDataSource();
  if (!ds || !ds.isInitialized) {
    return false;
  }

  const { courseId, lessonId, assignmentId, resourceId } = params;

  // Admins and instructors have full access
  if (user.role === 'admin' || user.role === 'instructor') {
    return true;
  }

  // Learners: check if they have access to the course/lesson
  if (category === 'lesson_video' && courseId) {
    // For now, if course exists and is published, learner can access
    // TODO: Add enrollment check if needed
    const courseRepo = ds.getRepository('Course');
    const course = await courseRepo.findOne({
      where: { id: Number(courseId), deletedAt: null },
      select: { id: true, status: true },
    });
    return course && course.status === 'published';
  }

  // For assignments and resources, check if user is assigned
  // TODO: Implement assignment/resource access checks
  return false;
}

/**
 * @swagger
 * tags:
 *   - name: Media
 *     description: S3 file storage endpoints (upload/download signed URLs)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     MediaUploadRequest:
 *       type: object
 *       required: [contentTypeCategory, fileName]
 *       properties:
 *         contentTypeCategory:
 *           type: string
 *           enum: [lesson_video, assignment_submission, resource_file]
 *           description: Category of content
 *         fileName:
 *           type: string
 *           description: Original filename
 *         contentType:
 *           type: string
 *           description: MIME type (e.g., video/mp4)
 *         courseId:
 *           type: integer
 *           description: Required for lesson_video
 *         lessonId:
 *           type: integer
 *           description: Required for lesson_video
 *         assignmentId:
 *           type: integer
 *           description: Required for assignment_submission
 *         resourceId:
 *           type: integer
 *           description: Required for resource_file
 *     MediaUploadResponse:
 *       type: object
 *       properties:
 *         fileKey:
 *           type: string
 *           description: S3 object key
 *         uploadUrl:
 *           type: string
 *           description: Presigned PUT URL (expires in 15 minutes)
 *         expiresIn:
 *           type: integer
 *           description: Expiry time in seconds
 *     MediaDownloadRequest:
 *       type: object
 *       required: [fileKey]
 *       properties:
 *         fileKey:
 *           type: string
 *           description: S3 object key
 *     MediaDownloadResponse:
 *       type: object
 *       properties:
 *         fileKey:
 *           type: string
 *         downloadUrl:
 *           type: string
 *           description: Presigned GET URL (expires in 15 minutes)
 *         expiresIn:
 *           type: integer
 */

/**
 * @swagger
 * /media/upload-url:
 *   post:
 *     summary: Get presigned upload URL for S3
 *     description: |
 *       Generates a time-limited presigned PUT URL for uploading files to S3.
 *       Requires authentication and Instructor/Admin role.
 *       After upload, store the fileKey in media_metadata table.
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MediaUploadRequest'
 *     responses:
 *       200:
 *         description: Upload URL generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MediaUploadResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Insufficient permissions (requires Instructor/Admin)
 *       503:
 *         description: S3 not configured
 */
router.post('/upload-url', auth, rbac(WRITE_ROLES), async (req, res, next) => {
  try {
    const { contentTypeCategory, fileName, contentType, courseId, lessonId, assignmentId, resourceId } = req.body;

    if (!contentTypeCategory || !['lesson_video', 'assignment_submission', 'resource_file', 'course_thumbnail'].includes(contentTypeCategory)) {
      return res.status(400).json({ message: 'contentTypeCategory must be one of: lesson_video, assignment_submission, resource_file, course_thumbnail' });
    }

    if (!fileName || typeof fileName !== 'string' || fileName.trim().length === 0) {
      return res.status(400).json({ message: 'fileName is required' });
    }

    // Build S3 key based on category
    let fileKey;
    try {
      fileKey = buildS3Key(contentTypeCategory, {
        courseId: courseId ? Number(courseId) : null,
        lessonId: lessonId ? Number(lessonId) : null,
        assignmentId: assignmentId ? Number(assignmentId) : null,
        resourceId: resourceId ? Number(resourceId) : null,
        fileName,
        userId: req.user?.id ? String(req.user.id) : null,
      });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    // Generate presigned upload URL
    const expiresInSeconds = 900; // 15 minutes
    const uploadUrl = await getUploadPresignedUrl(fileKey, {
      contentType: contentType || undefined,
      expiresInSeconds,
    });

    // Store metadata in database (before upload completes)
    const ds = getDataSource();
    if (ds && ds.isInitialized) {
      try {
        const mediaRepo = ds.getRepository('MediaMetadata');
        const metadata = mediaRepo.create({
          s3Key: fileKey,
          contentType: contentType || null,
          originalFileName: fileName,
          contentTypeCategory,
          courseId: courseId ? Number(courseId) : null,
          lessonId: lessonId ? Number(lessonId) : null,
          assignmentId: assignmentId ? Number(assignmentId) : null,
          resourceId: resourceId ? Number(resourceId) : null,
          uploadedBy: Number(req.user.id),
        });
        await mediaRepo.save(metadata);
      } catch (dbErr) {
        // Log but don't fail - metadata can be updated after upload
        console.warn('Failed to save media metadata:', dbErr.message);
      }
    }

    return res.status(200).json({
      fileKey,
      uploadUrl,
      expiresIn: expiresInSeconds,
    });
  } catch (err) {
    if (err && (err.code === 'AWS_S3_BUCKET_NAME_MISSING' || err.code === 'S3_KEY_INVALID')) {
      return res.status(503).json({ message: err.message });
    }
    return next(err);
  }
});

/**
 * @swagger
 * /media/download-url:
 *   post:
 *     summary: Get presigned download URL for S3 content
 *     description: |
 *       Generates a time-limited presigned GET URL for downloading/viewing files from S3.
 *       Requires authentication and verifies user has access to the content.
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MediaDownloadRequest'
 *     responses:
 *       200:
 *         description: Download URL generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MediaDownloadResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Insufficient permissions or no access to content
 *       404:
 *         description: File not found
 *       503:
 *         description: S3 not configured
 */
router.post('/download-url', auth, rbac(READ_ROLES), async (req, res, next) => {
  try {
    const { fileKey } = req.body;

    if (!fileKey || typeof fileKey !== 'string' || fileKey.trim().length === 0) {
      return res.status(400).json({ message: 'fileKey is required' });
    }

    // Verify file exists in metadata and user has access
    const ds = getDataSource();
    if (ds && ds.isInitialized) {
      const mediaRepo = ds.getRepository('MediaMetadata');
      const metadata = await mediaRepo.findOne({
        where: { s3Key: fileKey.trim(), deletedAt: null },
        relations: { course: true, lesson: true },
      });

      if (!metadata) {
        return res.status(404).json({ message: 'File not found' });
      }

      // Check access
      const hasAccess = await checkContentAccess(req.user, metadata.contentTypeCategory, {
        courseId: metadata.courseId,
        lessonId: metadata.lessonId,
        assignmentId: metadata.assignmentId,
        resourceId: metadata.resourceId,
      });

      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied to this content' });
      }
    }

    // Generate presigned download URL
    const expiresInSeconds = 900; // 15 minutes
    const downloadUrl = await getPresignedUrl(fileKey.trim(), {
      expiresInSeconds,
    });

    return res.status(200).json({
      fileKey: fileKey.trim(),
      downloadUrl,
      expiresIn: expiresInSeconds,
    });
  } catch (err) {
    if (err && (err.code === 'AWS_S3_BUCKET_NAME_MISSING' || err.code === 'S3_KEY_INVALID')) {
      return res.status(503).json({ message: err.message });
    }
    return next(err);
  }
});

/**
 * @swagger
 * /media/download-url/{contentId}:
 *   get:
 *     summary: Get presigned download URL by content ID
 *     description: |
 *       Alternative endpoint: get download URL using media metadata ID.
 *       Looks up the S3 key from metadata and generates presigned URL.
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Media metadata ID
 *     responses:
 *       200:
 *         description: Download URL generated
 *       400:
 *         description: Invalid contentId
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Access denied
 *       404:
 *         description: Content not found
 */
router.get('/download-url/:contentId', auth, rbac(READ_ROLES), async (req, res, next) => {
  try {
    const { contentId } = req.params;

    if (!isValidId(contentId)) {
      return res.status(400).json({ message: 'Invalid contentId' });
    }

    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const mediaRepo = ds.getRepository('MediaMetadata');
    const metadata = await mediaRepo.findOne({
      where: { id: Number(contentId), deletedAt: null },
      relations: { course: true, lesson: true },
    });

    if (!metadata) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check access
    const hasAccess = await checkContentAccess(req.user, metadata.contentTypeCategory, {
      courseId: metadata.courseId,
      lessonId: metadata.lessonId,
      assignmentId: metadata.assignmentId,
      resourceId: metadata.resourceId,
    });

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this content' });
    }

    // Generate presigned download URL
    const expiresInSeconds = 900;
    const downloadUrl = await getPresignedUrl(metadata.s3Key, {
      expiresInSeconds,
    });

    return res.status(200).json({
      fileKey: metadata.s3Key,
      downloadUrl,
      expiresIn: expiresInSeconds,
      metadata: {
        id: metadata.id,
        contentType: metadata.contentType,
        originalFileName: metadata.originalFileName,
        contentTypeCategory: metadata.contentTypeCategory,
      },
    });
  } catch (err) {
    if (err && (err.code === 'AWS_S3_BUCKET_NAME_MISSING' || err.code === 'S3_KEY_INVALID')) {
      return res.status(503).json({ message: err.message });
    }
    return next(err);
  }
});

module.exports = router;
