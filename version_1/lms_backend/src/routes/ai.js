const express = require('express');
const auth = require('../middleware/auth');
const { createAIService } = require('../services/ai');
const { getDataSource } = require('../config/db');

const router = express.Router();

const LEARNER_AI_QUIZ_TOTAL = 10;
const DIFFICULTIES = ['easy', 'medium', 'hard'];

/**
 * @swagger
 * tags:
 *   - name: AI
 *     description: AI Mentor and Chatbot endpoints
 */

/**
 * Helper: validate positive integer ID
 */
function isValidId(raw) {
  const n = Number.parseInt(String(raw || ''), 10);
  return Number.isFinite(n) && n > 0;
}

/**
 * @swagger
 * /ai/chat:
 *   post:
 *     summary: Chat with AI Mentor or Global Chatbot
 *     description: |
 *       Sends a message to the DigitalT3 AI Mentor (course-specific) or Global Chatbot (general platform help).
 *       Requires authentication.
 *       Automatically includes course/lesson context when courseId/lessonId are provided.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *                 description: User's question or message
 *                 example: "Can you explain the main concepts in this lesson?"
 *               context:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [mentor, chatbot]
 *                     default: chatbot
 *                     description: Type of AI interaction
 *                   courseId:
 *                     type: integer
 *                     description: Course ID for mentor context
 *                   lessonId:
 *                     type: integer
 *                     description: Lesson ID for mentor context
 *     responses:
 *       200:
 *         description: AI response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: AI-generated response
 *                 type:
 *                   type: string
 *                   enum: [mentor, chatbot]
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Missing or invalid token
 *       503:
 *         description: AI service not available
 */
router.post('/chat', auth, async (req, res, next) => {
  try {
    const { message, context = {} } = req.body || {};

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ message: 'message is required and must be a non-empty string' });
    }

    const userRole = req.user?.role || 'learner';
    const { type = 'chatbot', courseId, lessonId } = context;

    // Determine effective type based on user role
    let effectiveType = type;
    if (type === 'chatbot' && (userRole === 'instructor' || userRole === 'manager' || userRole === 'admin')) {
      // Auto-detect role-based bot for instructors/managers/admins
      effectiveType = userRole;
    }

    // Build enriched context
    let enrichedContext = {
      type: effectiveType,
      userRole,
    };

    const ds = getDataSource();
    if (ds && ds.isInitialized) {
      // Fetch course/lesson context for mentor or instructor
      if ((effectiveType === 'mentor' || effectiveType === 'instructor') && (courseId || lessonId)) {
        // Fetch course details if courseId provided
        if (courseId && isValidId(courseId)) {
          try {
            const courseRepo = ds.getRepository('Course');
            const course = await courseRepo.findOne({
              where: { id: Number(courseId), deletedAt: null },
              select: { id: true, title: true, description: true },
            });
            if (course) {
              enrichedContext.courseId = course.id;
              enrichedContext.courseTitle = course.title || null;
              enrichedContext.courseDescription = course.description || null;
            }
          } catch (dbErr) {
            console.warn('Failed to fetch course context:', dbErr.message);
          }
        }

        // Fetch lesson details if lessonId provided
        if (lessonId && isValidId(lessonId)) {
          try {
            const lessonRepo = ds.getRepository('Lesson');
            const lesson = await lessonRepo.findOne({
              where: { id: Number(lessonId), deletedAt: null },
              select: { id: true, title: true, content: true, aiSummary: true },
            });
            if (lesson) {
              enrichedContext.lessonId = lesson.id;
              enrichedContext.lessonTitle = lesson.title || null;
              enrichedContext.lessonContent = lesson.content || null;
              enrichedContext.aiSummary = lesson.aiSummary || null;
            }
          } catch (dbErr) {
            console.warn('Failed to fetch lesson context:', dbErr.message);
          }
        }
      }

      // Fetch role-specific context
      const userId = Number.parseInt(req.user.id, 10);
      if (Number.isFinite(userId)) {
        if (userRole === 'instructor') {
          try {
            // Fetch instructor's courses
            const courseRepo = ds.getRepository('Course');
            const instructorCourses = await courseRepo.find({
              where: { createdById: userId, deletedAt: null },
              select: { id: true, title: true, status: true },
              order: { createdAt: 'DESC' },
              take: 10,
            });

            // Get student stats (simplified - count users enrolled in instructor's courses)
            // Note: This assumes enrollment tracking exists. For now, we'll use a placeholder.
            const userRepo = ds.getRepository('User');
            const totalLearners = await userRepo.count({
              where: { role: 'learner' },
            });

            enrichedContext.instructorContext = {
              courses: instructorCourses.map((c) => ({
                id: c.id,
                title: c.title,
                status: c.status,
                studentCount: 0, // TODO: Implement enrollment tracking
              })),
              studentStats: {
                totalStudents: totalLearners,
                avgScore: null, // TODO: Calculate from quiz scores
              },
              atRiskStudents: [], // TODO: Implement at-risk detection
            };
          } catch (dbErr) {
            console.warn('Failed to fetch instructor context:', dbErr.message);
            enrichedContext.instructorContext = {};
          }
        } else if (userRole === 'manager' || userRole === 'admin') {
          try {
            const userRepo = ds.getRepository('User');
            const courseRepo = ds.getRepository('Course');
            const lessonRepo = ds.getRepository('Lesson');

            // System-wide stats
            const totalUsers = await userRepo.count();
            const totalLearners = await userRepo.count({ where: { role: 'learner' } });
            const totalCourses = await courseRepo.count({ where: { deletedAt: null } });
            const totalLessons = await lessonRepo.count({ where: { deletedAt: null } });

            // Calculate average readiness score
            const learnersWithScores = await userRepo
              .createQueryBuilder('user')
              .select('AVG(user.readinessScore)', 'avg')
              .where('user.role = :role', { role: 'learner' })
              .andWhere('user.readinessScore > 0')
              .getRawOne();

            const avgReadiness = learnersWithScores?.avg ? Number(learnersWithScores.avg).toFixed(1) : 0;

            if (userRole === 'manager') {
              // Manager context: team progress and skill gaps
              enrichedContext.managerContext = {
                teamProgress: {
                  totalMembers: totalLearners,
                  completionRate: 0, // TODO: Calculate from course completions
                  avgReadiness: avgReadiness,
                },
                skillGaps: [], // TODO: Implement skill gap analysis
                complianceStatus: {
                  compliant: 0,
                  nonCompliant: 0,
                },
              };
            } else {
              // Admin context: system stats
              enrichedContext.adminContext = {
                systemStats: {
                  totalUsers,
                  totalCourses,
                  totalLessons,
                  activeLearners: totalLearners,
                  avgReadinessScore: avgReadiness,
                },
              };
            }
          } catch (dbErr) {
            console.warn('Failed to fetch manager/admin context:', dbErr.message);
            if (userRole === 'manager') {
              enrichedContext.managerContext = {};
            } else {
              enrichedContext.adminContext = {};
            }
          }
        }
      }
    }

    // Call AI service
    let aiResponse;
    try {
      const ai = createAIService();
      aiResponse = await ai.chat(message.trim(), enrichedContext);
    } catch (aiErr) {
      // Log the error for debugging
      console.error('AI chat error:', {
        code: aiErr?.code,
        status: aiErr?.status,
        message: aiErr?.message,
        stack: aiErr?.stack,
      });

      // Handle specific AI errors
      if (aiErr && aiErr.code === 'ANTHROPIC_API_KEY_MISSING') {
        return res.status(503).json({
          message: 'AI service not configured (missing ANTHROPIC_API_KEY)',
          fallback: 'The AI Mentor is currently resting. Please try again in a few minutes.',
        });
      }

      // Rate limit or API errors
      if (aiErr && (aiErr.status === 429 || aiErr.status === 500 || aiErr.status === 503)) {
        return res.status(503).json({
          message: 'AI service temporarily unavailable',
          fallback: 'The AI Mentor is currently resting. Please try again in a few minutes.',
        });
      }

      // Handle other Anthropic API errors
      if (aiErr && aiErr.status) {
        return res.status(503).json({
          message: `AI service error (${aiErr.status})`,
          fallback: 'The AI Mentor is currently resting. Please try again in a few minutes.',
        });
      }

      // Re-throw unexpected errors to be handled by Express error handler
      throw aiErr;
    }

    return res.status(200).json({
      response: aiResponse,
      type: enrichedContext.type,
      userRole: enrichedContext.userRole,
    });
  } catch (err) {
    return next(err);
  }
});

// --- Instructor: AI feedback on assignment submissions ---

/**
 * POST /ai/assignment-feedback
 * Body: { assignmentTitle, assignmentDescription?, submissionContent? }
 * Returns: { feedback }
 * Instructor (or manager/admin) only.
 */
router.post('/assignment-feedback', auth, async (req, res, next) => {
  try {
    const role = req.user?.role;
    if (role !== 'instructor' && role !== 'manager' && role !== 'admin') {
      return res.status(403).json({ message: 'Assignment feedback is only available for instructors' });
    }
    const { assignmentTitle, assignmentDescription, submissionContent } = req.body || {};
    const title = typeof assignmentTitle === 'string' ? assignmentTitle.trim() : '';
    if (!title) {
      return res.status(400).json({ message: 'assignmentTitle is required' });
    }

    const ai = createAIService();
    const feedback = await ai.generateAssignmentFeedback(
      title,
      assignmentDescription || '',
      submissionContent || ''
    );

    return res.status(200).json({ feedback });
  } catch (err) {
    if (err?.code === 'ANTHROPIC_API_KEY_MISSING' || err?.code === 'AI_INPUT_INVALID') {
      return res.status(503).json({ message: err.message || 'AI feedback not available' });
    }
    console.error('AI assignment feedback error:', err?.message || err);
    return res.status(503).json({ message: err?.message || 'Failed to generate feedback' });
  }
});

// --- Learner AI Quiz (10 MCQs, 4 options; difficulty; feedback; logs) ---

/**
 * POST /ai/quiz/generate
 * Body: { courseId?, courseTitle, lessonTitle?, difficulty }
 * Returns: { attemptId, questions: [{ questionText, options }] } — 10 items, no correctAnswerIndex
 */
function isLearner(role) {
  const r = (role || '').toLowerCase();
  return r === 'learner';
}

router.post('/quiz/generate', auth, async (req, res, next) => {
  try {
    if (!isLearner(req.user?.role)) {
      return res.status(403).json({ message: 'AI quiz is only available for learners' });
    }
    const userId = Number(req.user?.id);
    if (!Number.isFinite(userId)) {
      return res.status(401).json({ message: 'User not found' });
    }
    const { courseId, courseTitle, lessonTitle, difficulty = 'medium' } = req.body || {};
    const topic = [courseTitle, lessonTitle].filter(Boolean).join(' / ') || 'General course knowledge';
    const diff = DIFFICULTIES.includes(String(difficulty).toLowerCase()) ? String(difficulty).toLowerCase() : 'medium';

    const ai = createAIService();
    const questions = await ai.generateLearnerQuiz(topic, diff);
    if (!questions || questions.length !== LEARNER_AI_QUIZ_TOTAL) {
      return res.status(503).json({ message: 'AI could not generate quiz (expected 10 questions)' });
    }

    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available to save attempt' });
    }
    const repo = ds.getRepository('AiQuizAttempt');
    const attempt = repo.create({
      userId,
      courseId: courseId != null ? String(courseId) : null,
      courseTitle: String(courseTitle || '').slice(0, 500) || 'Course',
      lessonTitle: lessonTitle != null ? String(lessonTitle).slice(0, 500) : null,
      difficulty: diff,
      status: 'in_progress',
      questionsSnapshot: questions,
      totalQuestions: LEARNER_AI_QUIZ_TOTAL,
    });
    await repo.save(attempt);

    const safeQuestions = questions.map((q) => ({ questionText: q.questionText, options: q.options }));
    return res.status(200).json({ attemptId: attempt.id, questions: safeQuestions });
  } catch (err) {
    if (err?.code === 'ANTHROPIC_API_KEY_MISSING' || err?.code === 'AI_INPUT_INVALID' || err?.code === 'AI_OUTPUT_INVALID_JSON' || err?.code === 'AI_OUTPUT_INVALID_SCHEMA') {
      return res.status(503).json({ message: err.message || 'AI quiz generation failed' });
    }
    // Database or other errors: return 503 with a clear message instead of 500
    console.error('AI quiz generate error:', err?.message || err);
    const isDbError = err?.code === 'ER_NO_SUCH_TABLE' || err?.sqlMessage?.includes("doesn't exist") || err?.message?.includes('ai_quiz_attempts');
    const message = isDbError
      ? 'AI quiz is not available yet. Please ask an administrator to run the database migration for ai_quiz_attempts.'
      : (err?.message || 'Failed to start quiz. Please try again.');
    return res.status(503).json({ message });
  }
});

/**
 * POST /ai/quiz/submit
 * Body: { attemptId, answers: [0,1,2,...] } — 10 numbers (selected index per question)
 * Returns: { score, totalQuestions, feedback, correctAnswers }
 */
router.post('/quiz/submit', auth, async (req, res, next) => {
  try {
    if (!isLearner(req.user?.role)) {
      return res.status(403).json({ message: 'AI quiz is only available for learners' });
    }
    const userId = Number(req.user?.id);
    if (!Number.isFinite(userId)) {
      return res.status(401).json({ message: 'User not found' });
    }
    const { attemptId, answers } = req.body || {};
    if (!isValidId(attemptId)) {
      return res.status(400).json({ message: 'attemptId is required' });
    }
    const answerList = Array.isArray(answers) ? answers.map((a) => (Number(a) >= 0 && Number(a) <= 3 ? Number(a) : -1)) : [];
    if (answerList.length !== LEARNER_AI_QUIZ_TOTAL) {
      return res.status(400).json({ message: 'answers must be an array of 10 numbers (0-3 per question)' });
    }

    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }
    const repo = ds.getRepository('AiQuizAttempt');
    const attempt = await repo.findOne({
      where: { id: Number(attemptId), userId, status: 'in_progress' },
    });
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found or already submitted' });
    }

    const questions = attempt.questionsSnapshot || [];
    let score = 0;
    const correctAnswers = [];
    for (let i = 0; i < LEARNER_AI_QUIZ_TOTAL; i++) {
      const q = questions[i];
      const correct = q && Number.isInteger(q.correctAnswerIndex) ? q.correctAnswerIndex : 0;
      correctAnswers.push(correct);
      if (answerList[i] === correct) score += 1;
    }

    const topic = [attempt.courseTitle, attempt.lessonTitle].filter(Boolean).join(' / ') || attempt.courseTitle || 'Course';
    let feedbackText = '';
    try {
      const ai = createAIService();
      feedbackText = await ai.generateQuizFeedback(questions, answerList, topic);
    } catch (aiErr) {
      feedbackText = 'Review the questions you missed and try again when ready.';
    }

    attempt.answersSnapshot = answerList;
    attempt.score = score;
    attempt.status = 'completed';
    attempt.feedbackText = feedbackText;
    attempt.completedAt = new Date();
    await repo.save(attempt);

    return res.status(200).json({
      score,
      totalQuestions: LEARNER_AI_QUIZ_TOTAL,
      feedback: feedbackText,
      correctAnswers,
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /ai/quiz/attempts
 * Returns: [{ id, courseTitle, lessonTitle, difficulty, status, score, totalQuestions, createdAt, completedAt }]
 */
router.get('/quiz/attempts', auth, async (req, res, next) => {
  try {
    if (!isLearner(req.user?.role)) {
      return res.status(403).json({ message: 'AI quiz is only available for learners' });
    }
    const userId = Number(req.user?.id);
    if (!Number.isFinite(userId)) {
      return res.status(401).json({ message: 'User not found' });
    }
    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(200).json({ attempts: [] });
    }
    const repo = ds.getRepository('AiQuizAttempt');
    const list = await repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 100,
      select: ['id', 'courseTitle', 'lessonTitle', 'difficulty', 'status', 'score', 'totalQuestions', 'createdAt', 'completedAt'],
    });
    return res.status(200).json({ attempts: list });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /ai/quiz/attempts/:id
 * Returns full attempt for review (questions with correctAnswerIndex, answersSnapshot, score, feedback)
 */
router.get('/quiz/attempts/:id', auth, async (req, res, next) => {
  try {
    if (!isLearner(req.user?.role)) {
      return res.status(403).json({ message: 'AI quiz is only available for learners' });
    }
    const userId = Number(req.user?.id);
    if (!Number.isFinite(userId)) {
      return res.status(401).json({ message: 'User not found' });
    }
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid attempt id' });
    }
    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }
    const repo = ds.getRepository('AiQuizAttempt');
    const attempt = await repo.findOne({
      where: { id, userId },
    });
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }
    return res.status(200).json({
      id: attempt.id,
      courseTitle: attempt.courseTitle,
      lessonTitle: attempt.lessonTitle,
      difficulty: attempt.difficulty,
      status: attempt.status,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      feedbackText: attempt.feedbackText,
      questionsSnapshot: attempt.questionsSnapshot,
      answersSnapshot: attempt.answersSnapshot,
      createdAt: attempt.createdAt,
      completedAt: attempt.completedAt,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
