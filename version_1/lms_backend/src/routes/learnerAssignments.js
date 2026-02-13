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

async function isUserEnrolledInCourse(ds, userId, courseId) {
  const enrollRepo = ds.getRepository('CourseEnrollment');
  const row = await enrollRepo.findOne({
    where: { userId: Number(userId), courseId: Number(courseId) },
    select: { id: true },
  });
  return !!row;
}

/**
 * GET /learner/assignments-assessments
 * Returns real-time assignments (empty - no backend entity) and quizzes from enrolled courses.
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

      const enrollRepo = ds.getRepository('CourseEnrollment');
      const quizRepo = ds.getRepository('Quiz');
      const attemptRepo = ds.getRepository('QuizAttempt');
      const courseRepo = ds.getRepository('Course');

      const enrollments = await enrollRepo.find({
        where: { userId },
        select: { courseId: true },
      });
      const courseIds = [...new Set(enrollments.map((e) => e.courseId))];

      const quizzes = [];
      for (const courseId of courseIds) {
        const course = await courseRepo.findOne({
          where: { id: courseId, deletedAt: null },
          select: { id: true, title: true, tags: true },
        });
        if (!course) continue;

        const tag = course.tags && course.tags[0] ? String(course.tags[0]) : '';
        const pathSlug = TAG_TO_SLUG[tag] || (tag ? tag.toLowerCase().replace(/\s+/g, '-') : 'fullstack');

        const quizRows = await quizRepo.find({
          where: { courseId },
          select: { id: true, title: true, courseId: true, createdAt: true },
          order: { createdAt: 'DESC' },
        });

        for (const q of quizRows) {
          const allAttempts = await attemptRepo.find({
            where: { quizId: q.id, userId, status: 'completed' },
            select: { score: true, totalQuestions: true, completedAt: true },
            order: { completedAt: 'DESC' },
          });
          const bestAttempt = allAttempts[0];
          const scorePct = bestAttempt && bestAttempt.totalQuestions > 0
            ? Math.round((bestAttempt.score / bestAttempt.totalQuestions) * 100)
            : null;
          const status = bestAttempt
            ? (scorePct >= 70 ? 'Reviewed' : 'Submitted')
            : 'Assigned';

          quizzes.push({
            id: String(q.id),
            title: q.title,
            course: course.title,
            courseId: String(course.id),
            pathSlug,
            module: 'Quiz',
            moduleId: `quiz-${q.id}`,
            role: tag || 'General',
            type: 'Quiz',
            dueDate: '',
            dueDateISO: '',
            status,
            score: scorePct,
            attemptsCount: allAttempts.length,
            lastAttemptAt: bestAttempt?.completedAt || null,
          });
        }
      }

      const totalQuizzes = quizzes.length;
      const completedQuizzes = quizzes.filter((q) => q.status === 'Reviewed' || q.status === 'Submitted').length;
      const pendingQuizzes = quizzes.filter((q) => q.status === 'Assigned').length;

      return res.status(200).json({
        assignments: [],
        quizzes,
        summary: {
          totalAssignments: 0,
          completedAssignments: 0,
          pendingAssignments: 0,
          overdueAssignments: 0,
          totalQuizzes: totalQuizzes,
          completedQuizzes,
          pendingQuizzes,
        },
      });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
