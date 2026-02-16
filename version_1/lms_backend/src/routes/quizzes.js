const express = require('express');
const auth = require('../middleware/auth');
const { getDataSource } = require('../config/db');
const { createAIService } = require('../services/ai');

const router = express.Router();
const QUIZ_SIZE = 10;

function isInstructor(role) {
  return ['instructor', 'INSTRUCTOR', 'admin', 'ADMIN', 'manager', 'MANAGER'].includes(String(role || ''));
}
function isLearner(role) {
  return (role || '').toLowerCase() === 'learner';
}
function isValidId(raw) {
  const n = Number.parseInt(String(raw || ''), 10);
  return Number.isFinite(n) && n > 0;
}
async function isUserEnrolledInCourse(ds, userId, courseId) {
  const enrollRepo = ds.getRepository('CourseEnrollment');
  const row = await enrollRepo.findOne({
    where: { userId: Number(userId), courseId: Number(courseId) },
    select: { id: true },
  });
  return !!row;
}

/** Strip correctAnswerIndex for take endpoint */
function questionsForTake(snapshot) {
  if (!Array.isArray(snapshot)) return [];
  return snapshot.map((q) => ({
    questionText: q.questionText,
    options: Array.isArray(q.options) ? q.options : [],
  }));
}

/**
 * GET /courses/:courseId/quizzes — list quizzes for a course (instructor + learner).
 */
router.get('/courses/:courseId/quizzes', auth, async (req, res, next) => {
  try {
    const courseId = Number(req.params.courseId);
    if (!isValidId(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }
    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }
    const courseRepo = ds.getRepository('Course');
    const course = await courseRepo.findOne({
      where: { id: courseId, deletedAt: null },
      select: { id: true, title: true },
    });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    if (isLearner(req.user?.role)) {
      const enrolled = await isUserEnrolledInCourse(ds, req.user?.id, courseId);
      if (!enrolled) {
        return res.status(403).json({ message: 'You must enroll in this course to access quizzes' });
      }
    }
    const quizRepo = ds.getRepository('Quiz');
    const quizzes = await quizRepo.find({
      where: { courseId },
      order: { createdAt: 'DESC' },
      select: ['id', 'courseId', 'title', 'createdById', 'createdAt'],
    });
    return res.status(200).json({
      courseId: course.id,
      courseTitle: course.title,
      quizzes: quizzes.map((q) => ({
        id: q.id,
        courseId: q.courseId,
        title: q.title,
        createdById: q.createdById,
        createdAt: q.createdAt,
      })),
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /courses/:courseId/quizzes — create quiz (instructor only). Body: { title, questions? (10 MCQs), generateWithAi? }
 */
router.post('/courses/:courseId/quizzes', auth, async (req, res, next) => {
  try {
    if (!isInstructor(req.user?.role)) {
      return res.status(403).json({ message: 'Only instructors can create quizzes' });
    }
    const courseId = Number(req.params.courseId);
    if (!isValidId(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }
    const { title, questions, generateWithAi, topicsPrompt, fileContent } = req.body || {};
    const titleStr = typeof title === 'string' ? title.trim() : '';
    if (!titleStr) {
      return res.status(400).json({ message: 'title is required' });
    }
    const topicsStr = typeof topicsPrompt === 'string' ? topicsPrompt.trim() : '';
    const fileStr = typeof fileContent === 'string' ? fileContent.trim() : '';

    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }
    const courseRepo = ds.getRepository('Course');
    const course = await courseRepo.findOne({
      where: { id: courseId, deletedAt: null },
      relations: { createdBy: true },
    });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    const instructorId = Number(req.user?.id);
    const courseCreatorId = course.createdBy ? Number(course.createdBy.id) : null;
    if (courseCreatorId !== instructorId && !['admin', 'ADMIN', 'manager', 'MANAGER'].includes(String(req.user?.role || ''))) {
      return res.status(403).json({ message: 'You can only create quizzes for your own courses' });
    }

    let questionsSnapshot = Array.isArray(questions) ? questions : null;
    if (generateWithAi) {
      try {
        const ai = createAIService();
        const topic = [course.title || titleStr];
        if (topicsStr) topic.push('Topics to cover:', topicsStr);
        if (fileStr) topic.push('Content from uploaded document:', fileStr);
        questionsSnapshot = await ai.generateLearnerQuiz(topic.join('\n\n'), 'medium');
      } catch (aiErr) {
        console.error('AI quiz generate error:', aiErr?.message);
        return res.status(503).json({
          message: aiErr?.message || 'AI could not generate quiz. Try adding questions manually.',
        });
      }
    }
    if (!questionsSnapshot || questionsSnapshot.length !== QUIZ_SIZE) {
      return res.status(400).json({
        message: `Exactly ${QUIZ_SIZE} questions required (each with questionText, options[4], correctAnswerIndex 0-3)`,
      });
    }

    const quizRepo = ds.getRepository('Quiz');
    const quiz = quizRepo.create({
      courseId,
      createdById: instructorId,
      title: titleStr,
      questionsSnapshot,
    });
    await quizRepo.save(quiz);
    return res.status(201).json({
      id: quiz.id,
      courseId: quiz.courseId,
      title: quiz.title,
      createdAt: quiz.createdAt,
    });
  } catch (err) {
    const code = err?.code;
    const sqlMessage = err?.sqlMessage || '';
    const msg = err?.message || '';

    if (code === 'ANTHROPIC_API_KEY_MISSING' || code === 'ANTHROPIC_API_KEY_NOT_CONFIGURED') {
      return res.status(503).json({
        message: 'AI is not configured (missing ANTHROPIC_API_KEY). Set it in the backend .env to generate quizzes with AI.',
      });
    }
    if (code === 'ER_NO_SUCH_TABLE' || sqlMessage.includes("doesn't exist") || msg.includes('quizzes')) {
      console.error('Quiz create failed (table missing):', err?.message);
      return res.status(503).json({
        message: 'Quizzes are not set up yet. Run database migrations: cd version_1/lms_backend && npm run db:migrate',
      });
    }
    if (code === 'ER_BAD_FIELD_ERROR' || sqlMessage.includes('Unknown column')) {
      console.error('Quiz create failed (schema):', err?.message);
      return res.status(503).json({
        message: 'Database schema is out of date. Run migrations: npm run db:migrate',
      });
    }

    console.error('Quiz create error:', err?.message || err);
    return res.status(500).json({
      message: err?.message || 'Failed to create quiz. Please try again.',
    });
  }
});

/**
 * GET /quizzes/:id — get quiz for taking (questions without correct answers).
 */
router.get('/quizzes/:id', auth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid quiz ID' });
    }
    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }
    const quizRepo = ds.getRepository('Quiz');
    const quiz = await quizRepo.findOne({
      where: { id },
      select: ['id', 'courseId', 'title', 'questionsSnapshot'],
    });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    if (isLearner(req.user?.role)) {
      const enrolled = await isUserEnrolledInCourse(ds, req.user?.id, quiz.courseId);
      if (!enrolled) {
        return res.status(403).json({ message: 'You must enroll in this course to access this quiz' });
      }
    }
    return res.status(200).json({
      id: quiz.id,
      courseId: quiz.courseId,
      title: quiz.title,
      questions: questionsForTake(quiz.questionsSnapshot),
      totalQuestions: QUIZ_SIZE,
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /quizzes/:id/submit — submit answers, auto-grade, save attempt. Body: { answers: number[] }
 */
router.post('/quizzes/:id/submit', auth, async (req, res, next) => {
  try {
    if (!isLearner(req.user?.role)) {
      return res.status(403).json({ message: 'Only learners can submit quiz attempts' });
    }
    const userId = Number(req.user?.id);
    if (!Number.isFinite(userId)) {
      return res.status(401).json({ message: 'User not found' });
    }
    const quizId = Number(req.params.id);
    if (!isValidId(quizId)) {
      return res.status(400).json({ message: 'Invalid quiz ID' });
    }
    const { answers } = req.body || {};
    const answerList = Array.isArray(answers)
      ? answers.slice(0, QUIZ_SIZE).map((a) => (Number(a) >= 0 && Number(a) <= 3 ? Number(a) : 0))
      : [];
    if (answerList.length !== QUIZ_SIZE) {
      return res.status(400).json({ message: `answers must be an array of ${QUIZ_SIZE} numbers (0-3)` });
    }

    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }
    const quizRepo = ds.getRepository('Quiz');
    const quiz = await quizRepo.findOne({ where: { id: quizId }, select: ['id', 'courseId', 'title', 'questionsSnapshot'] });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    const enrolled = await isUserEnrolledInCourse(ds, userId, quiz.courseId);
    if (!enrolled) {
      return res.status(403).json({ message: 'You must enroll in this course to submit this quiz' });
    }

    const questions = quiz.questionsSnapshot || [];
    let score = 0;
    const correctAnswers = [];
    for (let i = 0; i < QUIZ_SIZE; i++) {
      const q = questions[i];
      const correct = q && Number.isInteger(q.correctAnswerIndex) ? q.correctAnswerIndex : 0;
      correctAnswers.push(correct);
      if (answerList[i] === correct) score += 1;
    }

    const attemptRepo = ds.getRepository('QuizAttempt');
    const attempt = attemptRepo.create({
      quizId,
      userId,
      answersSnapshot: answerList,
      score,
      totalQuestions: QUIZ_SIZE,
      status: 'completed',
      completedAt: new Date(),
    });
    await attemptRepo.save(attempt);

    return res.status(200).json({
      score,
      totalQuestions: QUIZ_SIZE,
      correctAnswers,
      attemptId: attempt.id,
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /quizzes/:id/attempts — list learner's attempts for this quiz (optional, for "View past attempts").
 */
router.get('/quizzes/:id/attempts', auth, async (req, res, next) => {
  try {
    const quizId = Number(req.params.id);
    const userId = Number(req.user?.id);
    if (!isValidId(quizId) || !Number.isFinite(userId)) {
      return res.status(400).json({ message: 'Invalid request' });
    }
    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(200).json({ attempts: [] });
    }
    const quizRepo = ds.getRepository('Quiz');
    const quiz = await quizRepo.findOne({ where: { id: quizId }, select: ['id', 'courseId'] });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    if (isLearner(req.user?.role)) {
      const enrolled = await isUserEnrolledInCourse(ds, userId, quiz.courseId);
      if (!enrolled) {
        return res.status(403).json({ message: 'You must enroll in this course to view quiz attempts' });
      }
    }
    const attemptRepo = ds.getRepository('QuizAttempt');
    const attempts = await attemptRepo.find({
      where: { quizId, userId },
      order: { createdAt: 'DESC' },
      take: 20,
      select: ['id', 'score', 'totalQuestions', 'completedAt', 'createdAt'],
    });
    return res.status(200).json({ attempts });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
