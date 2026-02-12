const express = require('express');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const { getDataSource } = require('../config/db');

const router = express.Router();

/**
 * Get recent system activity (admin only)
 * GET /activity?limit=20
 */
router.get('/', auth, rbac(['admin']), async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const activities = [];

    // Get recent course publications
    const courseRepo = ds.getRepository('Course');
    const recentCourses = await courseRepo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.createdBy', 'createdBy')
      .where('course.deletedAt IS NULL')
      .andWhere('course.status = :status', { status: 'published' })
      .orderBy('course.updatedAt', 'DESC')
      .take(Math.ceil(limit / 3))
      .getMany();

    recentCourses.forEach((course) => {
      if (course.updatedAt) {
        const createdBy = course.createdBy || {};
        activities.push({
          id: `course-${course.id}-${Date.parse(course.updatedAt)}`,
          type: 'course_published',
          userId: String(createdBy.id || ''),
          userName: createdBy.name || 'Unknown Instructor',
          description: `Published course: ${course.title}`,
          timestamp: course.updatedAt,
          metadata: { courseId: String(course.id), courseTitle: course.title },
        });
      }
    });

    // Get recent user registrations
    const userRepo = ds.getRepository('User');
    const recentUsers = await userRepo.find({
      order: { createdAt: 'DESC' },
      take: Math.ceil(limit / 3),
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    recentUsers.forEach((user) => {
      activities.push({
        id: `user-${user.id}`,
        type: 'user_created',
        userId: String(user.id),
        userName: user.name,
        description: `New ${user.role} added: ${user.name}`,
        timestamp: user.createdAt,
        metadata: { userId: String(user.id), userEmail: user.email, userRole: user.role },
      });
    });

    // Get recent logins (tracked via user updatedAt - when users log in, their record is updated)
    // Only show recent activity from last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = await userRepo
      .createQueryBuilder('user')
      .where('user.status = :status', { status: 'active' })
      .andWhere('user.updatedAt >= :sevenDaysAgo', { sevenDaysAgo })
      .orderBy('user.updatedAt', 'DESC')
      .take(Math.ceil(limit / 4))
      .getMany();

    activeUsers.forEach((user) => {
      if (user.updatedAt) {
        const roleLabel = user.role === 'manager' ? 'Manager' : user.role === 'admin' ? 'Admin' : user.role === 'instructor' ? 'Instructor' : 'Learner';
        activities.push({
          id: `login-${user.id}-${Date.parse(user.updatedAt)}`,
          type: 'login',
          userId: String(user.id),
          userName: user.name,
          description: `${roleLabel} signed in`,
          timestamp: user.updatedAt,
          metadata: { userId: String(user.id), userRole: user.role },
        });
      }
    });

    // Sort by timestamp descending and limit
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const limitedActivities = activities.slice(0, limit);

    return res.status(200).json({ activities: limitedActivities });
  } catch (err) {
    return next(err);
  }
});

/**
 * Get instructor activity (admin only)
 * GET /activity/instructors
 */
router.get('/instructors', auth, rbac(['admin']), async (req, res, next) => {
  try {
    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const userRepo = ds.getRepository('User');
    const courseRepo = ds.getRepository('Course');

    // Get all instructors
    const instructors = await userRepo.find({
      where: { role: 'instructor' },
      select: { id: true, name: true, email: true },
    });

    // Get course counts for each instructor
    const instructorActivity = await Promise.all(
      instructors.map(async (instructor) => {
        const courseCount = await courseRepo
          .createQueryBuilder('course')
          .where('course.createdBy = :instructorId', { instructorId: Number(instructor.id) })
          .andWhere('course.deletedAt IS NULL')
          .getCount();

        return {
          id: String(instructor.id),
          name: instructor.name,
          email: instructor.email,
          courseCount,
        };
      })
    );

    // Sort by course count descending
    instructorActivity.sort((a, b) => b.courseCount - a.courseCount);

    return res.status(200).json({ instructors: instructorActivity });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
