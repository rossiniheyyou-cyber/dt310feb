const express = require('express');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const { getDataSource } = require('../config/db');

const router = express.Router();

const TAG_TO_SLUG = {
  'Full Stack Developer': 'fullstack',
  'UI / UX Designer': 'uiux',
  'Data Analyst / Engineer': 'data-analyst',
  'Cloud & DevOps Engineer': 'cloud-devops',
  'QA Engineer': 'qa',
  'Digital Marketing': 'digital-marketing',
};

const TAG_TO_LABEL = {
  'Full Stack Developer': 'Full Stack Developer',
  'UI / UX Designer': 'UI / UX Designer',
  'Data Analyst / Engineer': 'Data Analyst / Engineer',
  'Cloud & DevOps Engineer': 'Cloud & DevOps Engineer',
  'QA Engineer': 'QA Engineer',
  'Digital Marketing': 'Digital Marketing',
};

/**
 * GET /learner/certificates
 * Returns real-time certificates from CourseCompletion for the current user.
 */
router.get(
  '/',
  auth,
  rbac(['learner', 'admin', 'instructor', 'manager']),
  async (req, res, next) => {
    try {
      const userId = Number(req.user?.id);
      if (!Number.isFinite(userId)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const ds = getDataSource();
      if (!ds || !ds.isInitialized) {
        return res.status(503).json({ message: 'Database not available' });
      }

      const completionRepo = ds.getRepository('CourseCompletion');
      const courseRepo = ds.getRepository('Course');
      const completions = await completionRepo.find({
        where: { userId },
        select: { courseId: true, completedAt: true },
        order: { completedAt: 'DESC' },
      });

      const certificates = [];
      for (const c of completions) {
        const course = await courseRepo.findOne({
          where: { id: c.courseId, deletedAt: null },
          select: { id: true, title: true, tags: true },
        });
        if (!course) continue;
        const tag = course.tags && course.tags[0] ? String(course.tags[0]) : '';
        const pathSlug = TAG_TO_SLUG[tag] || (tag ? tag.toLowerCase().replace(/\s+/g, '-') : 'fullstack');
        const pathTitle = TAG_TO_LABEL[tag] || tag || 'General';
        certificates.push({
          pathSlug,
          courseId: String(course.id),
          courseTitle: course.title,
          pathTitle,
          earnedAt: c.completedAt ? new Date(c.completedAt).toISOString() : null,
        });
      }

      return res.status(200).json({ certificates });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
