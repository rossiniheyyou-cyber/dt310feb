const express = require('express');
const auth = require('../middleware/auth');
const { getDataSource } = require('../config/db');

const router = express.Router();

/** Default course duration in days for "course end" calendar event when learner enrolls */
const DEFAULT_COURSE_DURATION_DAYS = 14;

function isValidId(raw) {
  const n = Number.parseInt(String(raw || ''), 10);
  return Number.isFinite(n) && n > 0;
}

function isLearner(role) {
  return String(role || '').toLowerCase() === 'learner';
}

/**
 * POST /enrollments/courses/:courseId
 * Enroll current learner into a published course.
 */
router.post('/courses/:courseId', auth, async (req, res, next) => {
  try {
    if (!isLearner(req.user?.role)) {
      return res.status(403).json({ message: 'Only learners can enroll in courses' });
    }

    const courseId = Number(req.params.courseId);
    if (!isValidId(courseId)) {
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
      where: { id: courseId, deletedAt: null, status: 'published' },
      select: { id: true, title: true },
    });
    if (!course) {
      return res.status(404).json({ message: 'Published course not found' });
    }

    const enrollRepo = ds.getRepository('CourseEnrollment');
    const existing = await enrollRepo.findOne({ where: { userId, courseId } });
    if (existing) {
      return res.status(200).json({ message: 'Already enrolled', enrollment: { courseId: String(courseId), enrolledAt: existing.enrolledAt } });
    }

    const saved = await enrollRepo.save(enrollRepo.create({ userId, courseId }));

    // Create calendar events: course start (today) and course end (start + duration)
    const eventRepo = ds.getRepository('CalendarEvent');
    const enrolledAt = saved.enrolledAt ? new Date(saved.enrolledAt) : new Date();
    const startDateStr = enrolledAt.toISOString().split('T')[0];
    const endDate = new Date(enrolledAt);
    endDate.setDate(endDate.getDate() + DEFAULT_COURSE_DURATION_DAYS);
    const endDateStr = endDate.toISOString().split('T')[0];
    const courseTitle = (course.title || 'Course').trim();

    const startEvent = eventRepo.create({
      userId,
      title: `${courseTitle} – Start`,
      eventType: 'course',
      eventDate: startDateStr,
      startTime: null,
      endTime: null,
      meetingLink: null,
      courseId: String(courseId),
      courseTitle,
    });
    const endEvent = eventRepo.create({
      userId,
      title: `${courseTitle} – End`,
      eventType: 'course',
      eventDate: endDateStr,
      startTime: null,
      endTime: null,
      meetingLink: null,
      courseId: String(courseId),
      courseTitle,
    });
    await eventRepo.save([startEvent, endEvent]);

    return res.status(201).json({
      message: 'Enrolled successfully',
      enrollment: { courseId: String(courseId), enrolledAt: saved.enrolledAt },
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /enrollments/me
 * List current learner enrollments.
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

    const enrollRepo = ds.getRepository('CourseEnrollment');
    const rows = await enrollRepo.find({
      where: { userId },
      select: { courseId: true, enrolledAt: true },
      order: { enrolledAt: 'DESC' },
    });

    return res.status(200).json({
      enrollments: rows.map((r) => ({
        courseId: String(r.courseId),
        enrolledAt: r.enrolledAt,
      })),
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

