const express = require('express');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const { getDataSource } = require('../config/db');

const router = express.Router();

/**
 * Get pending course requests (admin only)
 * GET /course-requests
 */
router.get('/', auth, rbac(['admin']), async (req, res, next) => {
  try {
    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const courseRepo = ds.getRepository('Course');
    let pendingCourses = [];

    try {
      pendingCourses = await courseRepo
        .createQueryBuilder('course')
        .leftJoinAndSelect('course.createdBy', 'createdBy')
        .where('course.deletedAt IS NULL')
        .andWhere('course.status = :status', { status: 'pending_approval' })
        .orderBy('course.createdAt', 'DESC')
        .getMany();
    } catch (queryErr) {
      const msg = queryErr && queryErr.message ? String(queryErr.message) : '';
      const code = queryErr && queryErr.code;
      const sqlState = queryErr && queryErr.sqlState;
      if (
        msg.includes('Unknown column') ||
        msg.includes('status') ||
        msg.includes('createdById') ||
        msg.includes('deletedAt') ||
        code === 'ER_BAD_FIELD_ERROR' ||
        code === 'ETIMEDOUT' ||
        code === 'ECONNREFUSED' ||
        code === 'ER_NET_READ_INTERRUPTED' ||
        (sqlState && String(sqlState).startsWith('08'))
      ) {
        if (code === 'ETIMEDOUT' || code === 'ECONNREFUSED' || code === 'ER_NET_READ_INTERRUPTED') {
          return res.status(503).json({ message: 'Database not available. Check MySQL connection and try again.' });
        }
        return res.status(200).json({ requests: [] });
      }
      throw queryErr;
    }

    return res.status(200).json({
      requests: pendingCourses.map(course => ({
        id: String(course.id),
        title: course.title,
        description: course.description,
        tags: course.tags || [],
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        instructor: course.createdBy ? {
          id: String(course.createdBy.id),
          name: course.createdBy.name,
          email: course.createdBy.email,
        } : null,
      })),
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * Approve course request (admin only)
 * POST /course-requests/:courseId/approve
 */
router.post('/:courseId/approve', auth, rbac(['admin']), async (req, res, next) => {
  try {
    const courseId = Number.parseInt(String(req.params.courseId || ''), 10);
    if (!Number.isFinite(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const courseRepo = ds.getRepository('Course');
    const notificationRepo = ds.getRepository('Notification');
    
    const course = await courseRepo.findOne({
      where: { id: courseId },
      relations: { createdBy: true },
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.status !== 'pending_approval') {
      return res.status(400).json({ message: 'Course is not pending approval' });
    }

    // Update course to published
    await courseRepo.update(
      { id: courseId },
      { 
        status: 'published',
        publishedAt: new Date(),
        updatedBy: req.user?.id ? { id: Number(req.user.id) } : null,
      }
    );

    // Notify instructor
    if (course.createdBy) {
      await notificationRepo.save(notificationRepo.create({
        userId: course.createdBy.id,
        type: 'course_approved',
        title: 'Course Approved',
        message: `Your course "${course.title}" has been approved and published.`,
        isRead: false,
      }));
    }

    return res.status(200).json({ 
      message: 'Course approved successfully',
      course: {
        id: String(course.id),
        title: course.title,
        status: 'published',
      },
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * Reject course request (admin only)
 * POST /course-requests/:courseId/reject
 */
router.post('/:courseId/reject', auth, rbac(['admin']), async (req, res, next) => {
  try {
    const courseId = Number.parseInt(String(req.params.courseId || ''), 10);
    if (!Number.isFinite(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    const { reason } = req.body || {};

    if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
      return res.status(400).json({ message: 'Reason is required and must be at least 10 characters' });
    }

    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const courseRepo = ds.getRepository('Course');
    const notificationRepo = ds.getRepository('Notification');
    
    const course = await courseRepo.findOne({
      where: { id: courseId },
      relations: { createdBy: true },
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.status !== 'pending_approval') {
      return res.status(400).json({ message: 'Course is not pending approval' });
    }

    // Update course to rejected
    await courseRepo.update(
      { id: courseId },
      { 
        status: 'rejected',
        updatedBy: req.user?.id ? { id: Number(req.user.id) } : null,
      }
    );

    // Notify instructor with reason
    if (course.createdBy) {
      await notificationRepo.save(notificationRepo.create({
        userId: course.createdBy.id,
        type: 'course_rejected',
        title: 'Course Rejected',
        message: `Your course "${course.title}" has been rejected.`,
        reason: reason.trim(),
        isRead: false,
        metadata: { courseId: String(course.id), courseTitle: course.title },
      }));
    }

    return res.status(200).json({ message: 'Course rejected successfully' });
  } catch (err) {
    return next(err);
  }
});

/**
 * Remove course (admin only) - soft delete with reason
 * POST /course-requests/:courseId/remove
 */
router.post('/:courseId/remove', auth, rbac(['admin']), async (req, res, next) => {
  try {
    const courseId = Number.parseInt(String(req.params.courseId || ''), 10);
    if (!Number.isFinite(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    const { reason } = req.body || {};

    if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
      return res.status(400).json({ message: 'Reason is required and must be at least 10 characters' });
    }

    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const courseRepo = ds.getRepository('Course');
    const notificationRepo = ds.getRepository('Notification');
    
    const course = await courseRepo.findOne({
      where: { id: courseId, deletedAt: null },
      relations: { createdBy: true },
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Soft delete course
    await courseRepo.update(
      { id: courseId },
      { 
        deletedAt: new Date(),
        updatedBy: req.user?.id ? { id: Number(req.user.id) } : null,
      }
    );

    // Notify instructor
    if (course.createdBy) {
      await notificationRepo.save(notificationRepo.create({
        userId: course.createdBy.id,
        type: 'course_removed',
        title: 'Course Removed',
        message: `Your course "${course.title}" has been removed from the platform.`,
        reason: reason.trim(),
        isRead: false,
        metadata: { courseId: String(course.id), courseTitle: course.title },
      }));
    }

    return res.status(200).json({ message: 'Course removed successfully' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
