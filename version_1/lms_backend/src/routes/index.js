const express = require('express');
const healthController = require('../controllers/health');
const authRoutes = require('./auth');
const courseRoutes = require('./courses');
const lessonRoutes = require('./lessons');
const mediaRoutes = require('./media');
const aiRoutes = require('./ai');
const userRoutes = require('./users');
const activityRoutes = require('./activity');
const notificationRoutes = require('./notifications');
const courseRequestRoutes = require('./courseRequests');
const recommendationRoutes = require('./recommendations');
const quizRoutes = require('./quizzes');
const progressRoutes = require('./progress');
const enrollmentRoutes = require('./enrollments');
const learningPathRoutes = require('./learningPath');
const learningProfileRoutes = require('./learningProfile');
const learnerDashboardRoutes = require('./learnerDashboard');
const learnerProgressRoutes = require('./learnerProgress');
const learnerCertificatesRoutes = require('./learnerCertificates');
const learnerAssignmentsRoutes = require('./learnerAssignments');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Health
 *     description: Service health and diagnostics
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health endpoint
 *     description: Returns basic service status, MySQL connectivity (TypeORM), and whether JWT auth is configured.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service health status (may be degraded if DB is unavailable)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Overall service health
 *                   enum: [ok, degraded, error]
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 *                 db:
 *                   type: object
 *                   properties:
 *                     connected:
 *                       type: boolean
 *                       example: true
 *                     type:
 *                       type: string
 *                       example: mysql
 *                     dbName:
 *                       type: string
 *                       description: Database name from DEFAULT_DB (if configured)
 *                       example: lms
 *                     error:
 *                       type: string
 *                       description: Present when the DB ping fails (no secrets)
 *                       example: connect ECONNREFUSED 127.0.0.1:3306
 *                 auth:
 *                   type: object
 *                   properties:
 *                     jwtConfigured:
 *                       type: boolean
 *                       example: true
 */
router.get('/', healthController.check.bind(healthController));

// Auth endpoints
router.use('/auth', authRoutes);

// Quiz endpoints (instructor-created quizzes, learner take/submit) — mount before /courses so /courses/:id/quizzes is matched here
router.use(quizRoutes);

// Course and lesson endpoints (OpenAPI-first; implementations may be completed in later tasks)
router.use('/courses', courseRoutes);
router.use('/lessons', lessonRoutes);

// Media/S3 storage endpoints
router.use('/media', mediaRoutes);

// AI endpoints (Mentor & Chatbot)
router.use('/ai', aiRoutes);

// User management endpoints (admin only)
router.use('/users', userRoutes);

// Activity endpoints (admin only)
router.use('/activity', activityRoutes);

// Notification endpoints
router.use('/notifications', notificationRoutes);

// Course request endpoints (admin only)
router.use('/course-requests', courseRequestRoutes);

// YouTube recommendations for AI-Powered Supplemental Learning (learners)
router.use('/recommendations', recommendationRoutes);

// Lesson completion (user progress) — learner complete, manager count
router.use('/progress', progressRoutes);

// Learner course enrollments
router.use('/enrollments', enrollmentRoutes);

// AI-generated learning path (skill gap, path generation)
router.use('/learning-path', learningPathRoutes);

// Learning target/profile (goal, target role, known skills)
router.use('/learning-profile', learningProfileRoutes);

// Learner dashboard (aggregated real-time data)
router.use('/learner/dashboard', learnerDashboardRoutes);

// Learner progress page (comprehensive real-time data)
router.use('/learner/progress', learnerProgressRoutes);

// Learner certificates (from CourseCompletion)
router.use('/learner/certificates', learnerCertificatesRoutes);

// Learner assignments & assessments (quizzes from enrolled courses)
router.use('/learner/assignments-assessments', learnerAssignmentsRoutes);

// Convenience nested endpoint for listing lessons by course
// Documented as: /courses/{courseId}/lessons
router.use('/courses/:courseId/lessons', (req, res, next) => {
  // Delegate to lessons route handler that expects "courseId" in path (we map it to a compatible route)
  req.url = `/by-course/${req.params.courseId}`;
  return lessonRoutes(req, res, next);
});

module.exports = router;
