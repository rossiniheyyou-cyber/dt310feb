const express = require('express');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const { getDataSource } = require('../config/db');

const router = express.Router();

/**
 * GET /learner/dashboard
 * Aggregated real-time data for learner dashboard.
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

      const userRepo = ds.getRepository('User');
      const enrollRepo = ds.getRepository('CourseEnrollment');
      const progressRepo = ds.getRepository('UserProgress');
      const completionRepo = ds.getRepository('CourseCompletion');
      const courseRepo = ds.getRepository('Course');
      const lessonRepo = ds.getRepository('Lesson');
      const quizAttemptRepo = ds.getRepository('QuizAttempt');

      const [user, enrollments, lessonProgress, courseCompletions, quizAttempts] = await Promise.all([
        userRepo.findOne({ where: { id: userId }, select: { readinessScore: true, name: true } }),
        enrollRepo.find({ where: { userId }, select: { courseId: true, enrolledAt: true }, order: { enrolledAt: 'DESC' } }),
        progressRepo.find({ where: { userId }, select: { lessonId: true, completedAt: true }, order: { completedAt: 'DESC' } }),
        completionRepo.find({ where: { userId }, select: { courseId: true, completedAt: true } }),
        quizAttemptRepo.find({ where: { userId, status: 'completed' }, select: { score: true, totalQuestions: true } }),
      ]);

      const completedLessonIds = new Set(lessonProgress.map((p) => p.lessonId));
      const completedCourseIds = new Set(courseCompletions.map((c) => c.courseId));

      const enrollmentsWithProgress = [];
      for (const e of enrollments) {
        const course = await courseRepo.findOne({
          where: { id: e.courseId, deletedAt: null, status: 'published' },
          select: { id: true, title: true, tags: true },
        });
        if (!course) continue;

        const lessons = await lessonRepo.find({
          where: { courseId: e.courseId },
          select: { id: true },
        });
        const totalLessons = lessons.length;
        const completedCount = lessons.filter((l) => completedLessonIds.has(l.id)).length;
        const courseCompleted = completedCourseIds.has(e.courseId);

        const tagToSlug = {
          'Full Stack Developer': 'fullstack',
          'UI / UX Designer': 'uiux',
          'Data Analyst / Engineer': 'data-analyst',
          'Cloud & DevOps Engineer': 'cloud-devops',
          'QA Engineer': 'qa',
          'Digital Marketing': 'digital-marketing',
        };
        const tag = course.tags && course.tags[0] ? String(course.tags[0]) : '';
        const pathSlug = tagToSlug[tag] || (tag ? tag.toLowerCase().replace(/\s+/g, '-') : 'fullstack');

        enrollmentsWithProgress.push({
          courseId: String(course.id),
          courseTitle: course.title,
          pathSlug,
          enrolledAt: e.enrolledAt,
          totalLessons,
          completedLessons: completedCount,
          progress: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
          courseCompleted,
        });
      }

      const mostRecent = enrollmentsWithProgress
        .filter((e) => !e.courseCompleted)
        .sort((a, b) => new Date(b.enrolledAt || 0).getTime() - new Date(a.enrolledAt || 0).getTime())[0];

      const totalEnrolled = enrollmentsWithProgress.length;
      const completedCourses = enrollmentsWithProgress.filter((e) => e.courseCompleted).length;
      const courseCompletion = totalEnrolled > 0 ? (completedCourses / totalEnrolled) * 100 : 0;
      const quizScores = quizAttempts
        .filter((a) => a.totalQuestions > 0)
        .map((a) => (a.score / a.totalQuestions) * 100);
      const avgQuizScore = quizScores.length > 0
        ? quizScores.reduce((s, v) => s + v, 0) / quizScores.length
        : 70;
      const readinessScore = Math.round(
        Math.min(100, Math.max(0,
          courseCompletion * 0.5 +
          avgQuizScore * 0.3 +
          (user?.readinessScore != null ? Number(user.readinessScore) : 70) * 0.2
        ))
      );

      return res.status(200).json({
        readinessScore,
        userName: user?.name || req.user?.name || 'Learner',
        enrollments: enrollmentsWithProgress,
        mostRecentCourse: mostRecent || null,
        totalEnrolled,
        completedCourses,
      });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
