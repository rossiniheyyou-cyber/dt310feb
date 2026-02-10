const express = require('express');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const { getDataSource } = require('../config/db');

const router = express.Router();

/**
 * Record lesson completion (learner).
 * POST /progress/lessons/:lessonId/complete
 * When a learner clicks "Complete Lesson", a row is added to user_progress.
 */
router.post('/lessons/:lessonId/complete', auth, rbac(['learner', 'admin', 'instructor', 'manager']), async (req, res, next) => {
  try {
    const lessonId = Number.parseInt(String(req.params.lessonId || ''), 10);
    if (!Number.isFinite(lessonId)) {
      return res.status(400).json({ message: 'Invalid lesson ID' });
    }

    const userId = Number(req.user?.id);
    if (!Number.isFinite(userId)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const lessonRepo = ds.getRepository('Lesson');
    const lesson = await lessonRepo.findOne({ where: { id: lessonId }, select: { id: true, courseId: true } });
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const progressRepo = ds.getRepository('UserProgress');
    const existing = await progressRepo.findOne({
      where: { userId, lessonId },
    });
    if (existing) {
      return res.status(200).json({
        message: 'Already completed',
        completedAt: existing.completedAt,
      });
    }

    const row = progressRepo.create({ userId, lessonId });
    const saved = await progressRepo.save(row);
    return res.status(201).json({
      message: 'Lesson completed',
      completedAt: saved.completedAt,
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * Get lesson completion count for a user (manager tracking).
 * GET /progress/users/:userId
 * Returns: { count, completedLessonIds }.
 * Manager view runs: SELECT COUNT(*) FROM user_progress WHERE user_id = ?.
 */
router.get('/users/:userId', auth, rbac(['admin', 'manager']), async (req, res, next) => {
  try {
    const userId = Number.parseInt(String(req.params.userId || ''), 10);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const progressRepo = ds.getRepository('UserProgress');
    const rows = await progressRepo.find({
      where: { userId },
      select: { id: true, lessonId: true, completedAt: true },
      order: { completedAt: 'DESC' },
    });

    const count = rows.length;
    const completedLessonIds = rows.map((r) => r.lessonId);
    return res.status(200).json({
      userId: String(userId),
      count,
      completedLessonIds,
      completions: rows.map((r) => ({ lessonId: r.lessonId, completedAt: r.completedAt })),
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * Get current user's progress (learner).
 * GET /progress/me
 */
router.get('/me', auth, async (req, res, next) => {
  try {
    const userId = Number(req.user?.id);
    if (!Number.isFinite(userId)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const progressRepo = ds.getRepository('UserProgress');
    const rows = await progressRepo.find({
      where: { userId },
      select: { lessonId: true, completedAt: true },
      order: { completedAt: 'DESC' },
    });

    return res.status(200).json({
      count: rows.length,
      completedLessonIds: rows.map((r) => r.lessonId),
      completions: rows.map((r) => ({ lessonId: r.lessonId, completedAt: r.completedAt })),
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * Record course completion (learner) and notify instructor.
 * POST /progress/courses/:courseId/complete
 */
router.post('/courses/:courseId/complete', auth, rbac(['learner', 'admin', 'instructor', 'manager']), async (req, res, next) => {
  try {
    const courseId = Number.parseInt(String(req.params.courseId || ''), 10);
    if (!Number.isFinite(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    const userId = Number(req.user?.id);
    if (!Number.isFinite(userId)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const courseRepo = ds.getRepository('Course');
    const course = await courseRepo.findOne({
      where: { id: courseId, deletedAt: null },
      relations: { createdBy: true },
    });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const completionRepo = ds.getRepository('CourseCompletion');
    const existing = await completionRepo.findOne({ where: { userId, courseId } });
    if (existing) {
      return res.status(200).json({ message: 'Already completed', completedAt: existing.completedAt });
    }

    const row = completionRepo.create({ userId, courseId });
    const saved = await completionRepo.save(row);

    // Notify instructor (best-effort)
    if (course.createdBy?.id) {
      try {
        const notificationRepo = ds.getRepository('Notification');
        const learnerName = req.user?.name || req.user?.email || `User ${userId}`;
        await notificationRepo.save(notificationRepo.create({
          userId: course.createdBy.id,
          type: 'course_completed',
          title: 'Course completed',
          message: `${learnerName} completed your course: ${course.title}`,
          metadata: { courseId: String(course.id), courseTitle: course.title, learnerId: String(userId) },
          isRead: false,
        }));
      } catch (_) {
        // ignore
      }
    }

    return res.status(201).json({ message: 'Course completed', completedAt: saved.completedAt });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
