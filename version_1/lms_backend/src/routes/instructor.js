const express = require('express');
const { In } = require('typeorm');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const { getDataSource } = require('../config/db');

const router = express.Router();

/**
 * GET /instructor/dashboard-stats
 * Returns KPIs for instructor dashboard: active courses, enrolled learners, pending reviews, learners at risk.
 */
router.get(
  '/dashboard-stats',
  auth,
  rbac(['instructor', 'admin']),
  async (req, res, next) => {
    try {
      const userId = Number(req.user?.id);
      if (!Number.isFinite(userId)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const ds = getDataSource();
      if (!ds || !ds.isInitialized) {
        return res.status(503).json({
          activeCourses: 0,
          enrolledLearners: 0,
          pendingReviews: 0,
          learnersAtRisk: 0,
        });
      }

      const courseRepo = ds.getRepository('Course');
      const enrollRepo = ds.getRepository('CourseEnrollment');
      const quizRepo = ds.getRepository('Quiz');
      const attemptRepo = ds.getRepository('QuizAttempt');

      // Courses created by this instructor
      const myCourses = await courseRepo.find({
        where: { createdById: userId, deletedAt: null },
        select: { id: true },
      });
      const myCourseIds = myCourses.map((c) => c.id);
      const activeCourses = myCourseIds.length;

      if (activeCourses === 0) {
        return res.status(200).json({
          activeCourses: 0,
          enrolledLearners: 0,
          pendingReviews: 0,
          learnersAtRisk: 0,
        });
      }

      // Distinct learners enrolled in instructor's courses
      const enrollments = await enrollRepo
        .createQueryBuilder('e')
        .select('DISTINCT e.userId')
        .where('e.courseId IN (:...ids)', { ids: myCourseIds })
        .getRawMany();
      const enrolledLearners = enrollments.length;

      // Pending reviews: assignment submissions (Assessment has no submission entity - use 0 for now)
      // QuizAttempts are auto-graded. When assignment submissions exist, count them.
      const pendingReviews = 0;

      // Learners at risk: enrolled learners with no recent quiz completion (inactive 7+ days)
      const learnerIds = enrollments.map((e) => e.userId);
      let learnersAtRisk = 0;
      if (learnerIds.length > 0 && myCourseIds.length > 0) {
        const quizRepo = ds.getRepository('Quiz');
        const quizzes = await quizRepo.find({ where: { courseId: In(myCourseIds) }, select: { id: true } });
        const quizIds = quizzes.map((q) => q.id);
        if (quizIds.length > 0) {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          const recentAttempts = await attemptRepo
            .createQueryBuilder('a')
            .where('a.quizId IN (:...qids)', { qids: quizIds })
            .andWhere('a.userId IN (:...uids)', { uids: learnerIds })
            .andWhere('a.status = :status', { status: 'completed' })
            .andWhere('a.completedAt >= :since', { since: sevenDaysAgo })
            .select('DISTINCT a.userId', 'userId')
            .getRawMany();
          const activeLearnerIds = new Set(recentAttempts.map((r) => Number(r.userId)));
          learnersAtRisk = learnerIds.filter((id) => !activeLearnerIds.has(Number(id))).length;
        } else {
          learnersAtRisk = learnerIds.length;
        }
      }

      return res.status(200).json({
        activeCourses,
        enrolledLearners,
        pendingReviews,
        learnersAtRisk,
      });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * GET /instructor/courses/:courseId/enrollments
 * List learners enrolled in a course. Instructor must own the course.
 */
router.get(
  '/courses/:courseId/enrollments',
  auth,
  rbac(['instructor', 'admin']),
  async (req, res, next) => {
    try {
      const userId = Number(req.user?.id);
      const courseId = Number(req.params.courseId);
      if (!Number.isFinite(userId) || !Number.isFinite(courseId)) {
        return res.status(400).json({ message: 'Invalid request' });
      }

      const ds = getDataSource();
      if (!ds || !ds.isInitialized) {
        return res.status(503).json({ message: 'Database unavailable' });
      }

      const courseRepo = ds.getRepository('Course');
      const course = await courseRepo.findOne({
        where: { id: courseId, createdById: userId, deletedAt: null },
        select: { id: true, title: true },
      });
      if (!course) {
        return res.status(404).json({ message: 'Course not found or access denied' });
      }

      const enrollRepo = ds.getRepository('CourseEnrollment');
      const userRepo = ds.getRepository('User');
      const enrollments = await enrollRepo.find({
        where: { courseId },
        select: { userId: true, enrolledAt: true },
        order: { enrolledAt: 'DESC' },
      });

      const userIds = [...new Set(enrollments.map((e) => e.userId))];
      const users = await userRepo.find({
        where: userIds.map((id) => ({ id })),
        select: { id: true, name: true, email: true },
      });
      const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

      const result = enrollments.map((e) => ({
        userId: String(e.userId),
        name: userMap[e.userId]?.name || 'Unknown',
        email: userMap[e.userId]?.email || '',
        enrolledAt: e.enrolledAt,
      }));

      return res.status(200).json({ enrollments: result, total: result.length });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * GET /instructor/courses/:courseId/submission-stats
 * Quiz and assessment submission counts for a course.
 */
router.get(
  '/courses/:courseId/submission-stats',
  auth,
  rbac(['instructor', 'admin']),
  async (req, res, next) => {
    try {
      const userId = Number(req.user?.id);
      const courseId = Number(req.params.courseId);
      if (!Number.isFinite(userId) || !Number.isFinite(courseId)) {
        return res.status(400).json({ message: 'Invalid request' });
      }

      const ds = getDataSource();
      if (!ds || !ds.isInitialized) {
        return res.status(503).json({
          quizSubmissions: 0,
          assessmentSubmissions: 0,
          quizTotal: 0,
        });
      }

      const courseRepo = ds.getRepository('Course');
      const course = await courseRepo.findOne({
        where: { id: courseId, createdById: userId, deletedAt: null },
        select: { id: true },
      });
      if (!course) {
        return res.status(404).json({ message: 'Course not found or access denied' });
      }

      const quizRepo = ds.getRepository('Quiz');
      const attemptRepo = ds.getRepository('QuizAttempt');
      const assessmentRepo = ds.getRepository('Assessment');

      const quizzes = await quizRepo.find({
        where: { courseId },
        select: { id: true },
      });
      const quizIds = quizzes.map((q) => q.id);
      let quizSubmissions = 0;
      if (quizIds.length > 0) {
        const count = await attemptRepo.count({
          where: { quizId: quizIds, status: 'completed' },
        });
        quizSubmissions = count;
      }

      const assessments = await assessmentRepo.count({
        where: { courseId: String(courseId), createdById: userId },
      });

      return res.status(200).json({
        quizSubmissions,
        quizTotal: quizIds.length,
        assessmentTotal: assessments,
        assessmentSubmissions: 0,
      });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * GET /instructor/courses/:courseId/quiz-attempts
 * List all quiz attempts for this course (instructor view). Real-time submissions.
 */
router.get(
  '/courses/:courseId/quiz-attempts',
  auth,
  rbac(['instructor', 'admin']),
  async (req, res, next) => {
    try {
      const userId = Number(req.user?.id);
      const courseId = Number(req.params.courseId);
      if (!Number.isFinite(userId) || !Number.isFinite(courseId)) {
        return res.status(400).json({ message: 'Invalid request' });
      }

      const ds = getDataSource();
      if (!ds || !ds.isInitialized) {
        return res.status(503).json({ attempts: [] });
      }

      const courseRepo = ds.getRepository('Course');
      const course = await courseRepo.findOne({
        where: { id: courseId, createdById: userId, deletedAt: null },
        select: { id: true, title: true },
      });
      if (!course) {
        return res.status(404).json({ message: 'Course not found or access denied' });
      }

      const attemptRepo = ds.getRepository('QuizAttempt');
      const quizRepo = ds.getRepository('Quiz');
      const userRepo = ds.getRepository('User');

      const quizzes = await quizRepo.find({
        where: { courseId },
        select: { id: true, title: true },
      });
      const quizIds = quizzes.map((q) => q.id);
      const quizMap = Object.fromEntries(quizzes.map((q) => [q.id, q]));

      if (quizIds.length === 0) {
        return res.status(200).json({ attempts: [], courseTitle: course.title });
      }

      const attempts = await attemptRepo.find({
        where: { quizId: In(quizIds), status: 'completed' },
        order: { completedAt: 'DESC' },
        take: 200,
        select: { id: true, quizId: true, userId: true, score: true, totalQuestions: true, completedAt: true, createdAt: true },
      });

      const userIds = [...new Set(attempts.map((a) => a.userId))];
      const users = await userRepo.find({
        where: userIds.map((id) => ({ id })),
        select: { id: true, name: true, email: true },
      });
      const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

      const result = attempts.map((a) => ({
        id: a.id,
        quizId: a.quizId,
        quizTitle: quizMap[a.quizId]?.title || 'Quiz',
        userId: a.userId,
        learnerName: userMap[a.userId]?.name || 'Unknown',
        learnerEmail: userMap[a.userId]?.email || '',
        score: a.score,
        totalQuestions: a.totalQuestions,
        completedAt: a.completedAt,
        submittedAt: a.completedAt || a.createdAt,
      }));

      return res.status(200).json({ attempts: result, courseTitle: course.title });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * GET /instructor/submissions
 * List all quiz attempts across instructor's courses (for Assessments > Pending Reviews / Submissions).
 */
router.get(
  '/submissions',
  auth,
  rbac(['instructor', 'admin']),
  async (req, res, next) => {
    try {
      const userId = Number(req.user?.id);
      if (!Number.isFinite(userId)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const ds = getDataSource();
      if (!ds || !ds.isInitialized) {
        return res.status(503).json({ quizAttempts: [], assignmentSubmissions: [] });
      }

      const courseRepo = ds.getRepository('Course');
      const myCourses = await courseRepo.find({
        where: { createdById: userId, deletedAt: null },
        select: { id: true, title: true },
      });
      const myCourseIds = myCourses.map((c) => c.id);
      const courseMap = Object.fromEntries(myCourses.map((c) => [c.id, c]));

      const userRepo = ds.getRepository('User');
      let quizAttempts = [];
      if (myCourseIds.length > 0) {
        const quizRepo = ds.getRepository('Quiz');
        const quizzes = await quizRepo.find({
          where: { courseId: myCourseIds },
          select: { id: true, title: true, courseId: true },
        });
        const quizIds = quizzes.map((q) => q.id);
        const quizMap = Object.fromEntries(quizzes.map((q) => [q.id, q]));

        const attemptRepo = ds.getRepository('QuizAttempt');
        const attempts = await attemptRepo.find({
          where: { quizId: In(quizIds), status: 'completed' },
          order: { completedAt: 'DESC' },
          take: 300,
          select: { id: true, quizId: true, userId: true, score: true, totalQuestions: true, completedAt: true },
        });

        const userIds = [...new Set(attempts.map((a) => a.userId))];
        const users = await userRepo.find({
          where: userIds.map((id) => ({ id })),
          select: { id: true, name: true, email: true },
        });
        const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

        quizAttempts = attempts.map((a) => ({
          id: String(a.id),
          type: 'quiz',
          title: quizMap[a.quizId]?.title || 'Quiz',
          course: courseMap[quizMap[a.quizId]?.courseId]?.title || 'Course',
          learnerName: userMap[a.userId]?.name || 'Unknown',
          learnerEmail: userMap[a.userId]?.email || '',
          submittedAt: (a.completedAt || a.createdAt)?.toISOString?.() || new Date().toISOString(),
          status: 'completed',
          score: a.score,
          totalQuestions: a.totalQuestions,
          quizId: a.quizId,
        }));
      }

      const assessmentRepo = ds.getRepository('Assessment');
      const subRepo = ds.getRepository('AssessmentSubmission');
      const myAssessments = await assessmentRepo.find({
        where: { createdById: userId },
        select: { id: true, title: true, courseTitle: true },
      });
      const myAssessmentIds = myAssessments.map((a) => a.id);
      const assessmentMap = Object.fromEntries(myAssessments.map((a) => [a.id, a]));
      let assignmentSubmissions = [];
      if (myAssessmentIds.length > 0) {
        const subs = await subRepo.find({
          where: { assessmentId: In(myAssessmentIds) },
          order: { submittedAt: 'DESC' },
          take: 200,
        });
        const subUserIds = [...new Set(subs.map((s) => s.userId))];
        const subUsers = await userRepo.find({
          where: subUserIds.map((id) => ({ id })),
          select: { id: true, name: true, email: true },
        });
        const subUserMap = Object.fromEntries(subUsers.map((u) => [u.id, u]));
        assignmentSubmissions = subs.map((s) => {
          const assessment = assessmentMap[s.assessmentId];
          return {
            id: `sub-${s.id}`,
            assignmentId: `a-${s.assessmentId}`,
            type: 'assignment',
            title: assessment?.title || 'Assignment',
            course: assessment?.courseTitle || 'Course',
            learnerName: subUserMap[s.userId]?.name || 'Unknown',
            learnerEmail: subUserMap[s.userId]?.email || '',
            submittedAt: (s.submittedAt || s.createdAt)?.toISOString?.() || new Date().toISOString(),
            status: s.status === 'reviewed' ? 'reviewed' : 'submitted',
          };
        });
      }

      return res.status(200).json({
        quizAttempts,
        assignmentSubmissions,
      });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * GET /instructor/my-courses
 * List courses created by this instructor with enrollment counts.
 */
router.get(
  '/my-courses',
  auth,
  rbac(['instructor', 'admin']),
  async (req, res, next) => {
    try {
      const userId = Number(req.user?.id);
      if (!Number.isFinite(userId)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const ds = getDataSource();
      if (!ds || !ds.isInitialized) {
        return res.status(503).json({ items: [], total: 0 });
      }

      const courseRepo = ds.getRepository('Course');
      const enrollRepo = ds.getRepository('CourseEnrollment');

      const courses = await courseRepo.find({
        where: { createdBy: { id: userId }, deletedAt: null },
        order: { createdAt: 'DESC' },
        relations: { createdBy: true },
      });

      const courseIds = courses.map((c) => c.id);
      const enrollmentCounts = {};
      if (courseIds.length > 0) {
        const counts = await enrollRepo
          .createQueryBuilder('e')
          .select('e.courseId', 'courseId')
          .addSelect('COUNT(*)', 'count')
          .where('e.courseId IN (:...ids)', { ids: courseIds })
          .groupBy('e.courseId')
          .getRawMany();
        counts.forEach((r) => {
          enrollmentCounts[r.courseId] = Number(r.count) || 0;
        });
      }

      const items = courses.map((c) => ({
        id: String(c.id),
        title: c.title,
        description: c.description || '',
        videoUrl: c.videoUrl || undefined,
        status: c.status,
        tags: Array.isArray(c.tags) ? c.tags : [],
        enrolledCount: enrollmentCounts[c.id] || 0,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));

      return res.status(200).json({ items, total: items.length });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * GET /instructor/assessments
 * List assessments created by this instructor (real-time). Includes submission counts.
 */
router.get(
  '/assessments',
  auth,
  rbac(['instructor', 'admin']),
  async (req, res, next) => {
    try {
      const userId = Number(req.user?.id);
      if (!Number.isFinite(userId)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const ds = getDataSource();
      if (!ds || !ds.isInitialized) {
        return res.status(503).json({ assessments: [] });
      }

      const assessmentRepo = ds.getRepository('Assessment');
      const subRepo = ds.getRepository('AssessmentSubmission');
      const assessments = await assessmentRepo.find({
        where: { createdById: userId },
        order: { dueDateISO: 'ASC', createdAt: 'DESC' },
      });

      const assessmentIds = assessments.map((a) => a.id);
      let submissionCounts = {};
      let reviewedCounts = {};
      if (assessmentIds.length > 0) {
        const counts = await subRepo
          .createQueryBuilder('s')
          .select('s.assessmentId', 'assessmentId')
          .addSelect('COUNT(*)', 'count')
          .where('s.assessmentId IN (:...ids)', { ids: assessmentIds })
          .groupBy('s.assessmentId')
          .getRawMany();
        counts.forEach((r) => {
          submissionCounts[r.assessmentId] = Number(r.count) || 0;
        });
        const reviewed = await subRepo
          .createQueryBuilder('s')
          .select('s.assessmentId', 'assessmentId')
          .addSelect('COUNT(*)', 'count')
          .where('s.assessmentId IN (:...ids)', { ids: assessmentIds })
          .andWhere("s.status = 'reviewed'")
          .groupBy('s.assessmentId')
          .getRawMany();
        reviewed.forEach((r) => {
          reviewedCounts[r.assessmentId] = Number(r.count) || 0;
        });
      }

      const list = assessments.map((a) => {
        const dueDate = a.dueDateISO
          ? new Date(a.dueDateISO).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : null;
        return {
          id: `a-${a.id}`,
          title: a.title,
          type: a.type === 'quiz' ? 'quiz' : 'assignment',
          course: a.courseTitle || 'General',
          module: a.module || 'Assignment',
          dueDateISO: a.dueDateISO,
          dueDate: dueDate || '—',
          status: a.status || 'published',
          submissions: submissionCounts[a.id] || 0,
          reviewed: reviewedCounts[a.id] || 0,
        };
      });

      return res.status(200).json({ assessments: list });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
