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
 * Returns assignments (Assessment) and course-based quizzes for enrolled courses only.
 * Learners see individual assessments for courses they are enrolled in, plus all quizzes from those courses.
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
      const enrolledCourseIdSet = new Set(courseIds.map(String));

      const assignments = [];
      try {
        const assessmentRepo = ds.getRepository('Assessment');
        const subRepo = ds.getRepository('AssessmentSubmission');
        const assessmentRows = await assessmentRepo.find({
          where: { status: 'published' },
          order: { dueDateISO: 'ASC' },
        });
        const mySubmissions = await subRepo.find({
          where: { userId },
          select: { assessmentId: true, status: true },
        });
        const subByAssessment = {};
        mySubmissions.forEach((s) => { subByAssessment[s.assessmentId] = s.status; });
        for (const a of assessmentRows) {
          const match = !a.courseId || enrolledCourseIdSet.has(String(a.courseId));
          if (!match) continue;
          const dueDate = a.dueDateISO
            ? new Date(a.dueDateISO).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            : '';
          const subStatus = subByAssessment[a.id];
          assignments.push({
            id: `a-${a.id}`,
            title: a.title,
            description: a.description || null,
            course: a.courseTitle || 'General',
            courseId: a.courseId || '',
            pathSlug: a.pathSlug || 'fullstack',
            module: a.module || 'Assignment',
            moduleId: a.moduleId || `a-${a.id}`,
            role: 'General',
            type: a.type === 'quiz' ? 'Quiz' : 'Coding',
            dueDate,
            dueDateISO: a.dueDateISO || '',
            status: subStatus === 'reviewed' ? 'Reviewed' : subStatus ? 'Submitted' : 'Assigned',
          });
        }
      } catch (_) {
        // Assessment / AssessmentSubmission table may not exist yet
      }

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
      const totalAssignments = assignments.length;
      const now = new Date().toISOString().slice(0, 10);
      const overdueAssignments = assignments.filter((a) => a.dueDateISO && a.dueDateISO < now).length;

      const completedAssignments = assignments.filter((a) => a.status === 'Submitted' || a.status === 'Reviewed').length;

      return res.status(200).json({
        assignments,
        quizzes,
        summary: {
          totalAssignments: totalAssignments,
          completedAssignments,
          pendingAssignments: totalAssignments - completedAssignments,
          overdueAssignments,
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

/**
 * POST /learner/assignments-assessments/submit
 * Submit an assignment (assessment). Enrolled learners only. Notifies instructor.
 */
router.post(
  '/submit',
  auth,
  rbac(['learner']),
  async (req, res, next) => {
    try {
      const userId = Number(req.user?.id);
      if (!Number.isFinite(userId)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { assessmentId: rawId, content, fileKey } = req.body || {};
      const assessmentId = Number.parseInt(String(rawId || '').replace(/^a-/, ''), 10);
      if (!Number.isFinite(assessmentId)) {
        return res.status(400).json({ message: 'assessmentId is required' });
      }

      const ds = getDataSource();
      if (!ds || !ds.isInitialized) {
        return res.status(503).json({ message: 'Database not available' });
      }

      const assessmentRepo = ds.getRepository('Assessment');
      const assessment = await assessmentRepo.findOne({
        where: { id: assessmentId, status: 'published' },
        select: { id: true, courseId: true, title: true, createdById: true },
      });
      if (!assessment) {
        return res.status(404).json({ message: 'Assessment not found or not published' });
      }

      const enrolled = await isUserEnrolledInCourse(ds, userId, Number(assessment.courseId));
      if (!enrolled) {
        return res.status(403).json({ message: 'You must be enrolled in this course to submit' });
      }

      const subRepo = ds.getRepository('AssessmentSubmission');
      const existing = await subRepo.findOne({ where: { userId, assessmentId } });
      if (existing) {
        existing.content = typeof content === 'string' ? content.trim() || null : null;
        existing.fileKey = fileKey || null;
        existing.status = 'submitted';
        await subRepo.save(existing);
      } else {
        const submission = subRepo.create({
          userId,
          assessmentId,
          content: typeof content === 'string' ? content.trim() || null : null,
          fileKey: fileKey || null,
          status: 'submitted',
        });
        await subRepo.save(submission);
      }

      const notificationRepo = ds.getRepository('Notification');
      await notificationRepo.save(notificationRepo.create({
        userId: assessment.createdById,
        type: 'assessment_submitted',
        title: 'Assessment submitted',
        message: `A learner submitted "${assessment.title}".`,
        metadata: { assessmentId, submittedBy: userId },
        isRead: false,
      }));

      return res.status(201).json({ message: 'Submission saved' });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
