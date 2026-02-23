const express = require('express');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const { getDataSource } = require('../config/db');

const router = express.Router();

/** Notify all learners enrolled in the course that a new assessment was published */
async function notifyEnrolledLearners(ds, assessment) {
  const courseId = assessment.courseId ? Number(assessment.courseId) : null;
  if (!courseId || !Number.isFinite(courseId)) return;
  const enrollRepo = ds.getRepository('CourseEnrollment');
  const notificationRepo = ds.getRepository('Notification');
  const enrollments = await enrollRepo.find({
    where: { courseId },
    select: { userId: true },
  });
  const title = 'New assessment';
  const message = `"${assessment.title}" is now available. Due: ${assessment.dueDateISO || 'No due date'}.`;
  for (const e of enrollments) {
    await notificationRepo.save(notificationRepo.create({
      userId: e.userId,
      type: 'new_assessment',
      title,
      message,
      metadata: { assessmentId: assessment.id, courseId },
      isRead: false,
    }));
  }
}

/**
 * GET /calendar/events
 * Returns calendar events for the current user (reminders) + assessments with due dates.
 * Role-based: learners see their reminders + assignments/quizzes from enrolled courses.
 * Instructors/managers/admins see their reminders + assessments they created.
 */
router.get(
  '/events',
  auth,
  rbac(['learner', 'instructor', 'admin', 'manager']),
  async (req, res, next) => {
    try {
      const userId = Number(req.user?.id);
      if (!Number.isFinite(userId)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const ds = getDataSource();
      if (!ds || !ds.isInitialized) {
        return res.status(503).json({ events: [] });
      }

      const role = (req.user?.role || '').toLowerCase();
      const eventRepo = ds.getRepository('CalendarEvent');
      const assessmentRepo = ds.getRepository('Assessment');
      const enrollRepo = ds.getRepository('CourseEnrollment');

      // 1. User's own calendar events (reminders, meetings, live classes)
      const userEvents = await eventRepo.find({
        where: { userId },
        order: { eventDate: 'ASC', startTime: 'ASC' },
      });

      const events = userEvents.map((e) => {
        let type = 'reminder';
        if (e.eventType === 'live_class') type = 'live_class';
        else if (e.eventType === 'meeting') type = 'meeting';
        else if (e.eventType === 'course') type = 'course';
        return {
          id: `ev-${e.id}`,
          title: e.title,
          date: new Date(e.eventDate),
          startTime: e.startTime || '09:00',
          endTime: e.endTime || null,
          type,
          status: 'upcoming',
          courseId: e.courseId,
          courseTitle: e.courseTitle,
          meetingLink: e.meetingLink,
        };
      });

      // 2. Assessments with due dates (only published; learners see completed if they submitted)
      let assessments = [];
      let submissionByAssessmentId = {};
      if (role === 'learner') {
        const enrollments = await enrollRepo.find({
          where: { userId },
          select: { courseId: true },
        });
        const enrolledCourseIds = new Set(enrollments.map((e) => String(e.courseId)));
        const allAssessments = await assessmentRepo.find({
          where: { status: 'published' },
          order: { dueDateISO: 'ASC' },
        });
        assessments = allAssessments.filter((a) =>
          a.courseId ? enrolledCourseIds.has(String(a.courseId)) : true
        );
        const subRepo = ds.getRepository('AssessmentSubmission');
        const submissions = await subRepo.find({
          where: { userId },
          select: { assessmentId: true },
        });
        submissionByAssessmentId = submissions.reduce((acc, s) => {
          acc[s.assessmentId] = true;
          return acc;
        }, {});
      } else {
        assessments = await assessmentRepo.find({
          where: { createdById: userId },
          order: { dueDateISO: 'ASC' },
        });
      }

      for (const a of assessments) {
        if (!a.dueDateISO) continue; // Skip assessments with no due date in calendar
        const d = new Date(a.dueDateISO);
        d.setHours(23, 59, 0, 0);
        const completed = role === 'learner' && submissionByAssessmentId[a.id];
        events.push({
          id: `a-${a.id}`,
          title: completed ? `${a.title} (completed)` : a.title,
          date: d,
          startTime: '23:59',
          endTime: null,
          type: a.type === 'quiz' ? 'quiz' : 'assignment',
          status: completed ? 'completed' : 'upcoming',
          courseId: a.courseId,
          courseTitle: a.courseTitle,
        });
      }

      events.sort((a, b) => new Date(a.date) - new Date(b.date));

      return res.status(200).json({ events });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * POST /calendar/events
 * Create a calendar event (reminder, meeting, or live class).
 */
router.post(
  '/events',
  auth,
  rbac(['learner', 'instructor', 'admin', 'manager']),
  async (req, res, next) => {
    try {
      const userId = Number(req.user?.id);
      if (!Number.isFinite(userId)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { title, eventType, eventDate, startTime, endTime, meetingLink, courseId, courseTitle } = req.body || {};
      if (!title || !eventDate) {
        return res.status(400).json({ message: 'Title and eventDate are required' });
      }

      const role = (req.user?.role || '').toLowerCase();
      const type = (eventType || 'reminder').toLowerCase();
      let allowedType = type;
      if (type === 'course') allowedType = 'reminder'; // only system creates 'course' events
      if (type === 'live_class' && role !== 'instructor') allowedType = 'meeting';
      if (type === 'meeting' && !['instructor', 'admin', 'manager'].includes(role)) allowedType = 'reminder';
      if (type === 'reminder') allowedType = 'reminder';

      const ds = getDataSource();
      if (!ds || !ds.isInitialized) {
        return res.status(503).json({ message: 'Database unavailable' });
      }

      const eventRepo = ds.getRepository('CalendarEvent');
      const event = eventRepo.create({
        userId,
        title: String(title).trim(),
        eventType: allowedType,
        eventDate: eventDate.split('T')[0],
        startTime: startTime || null,
        endTime: endTime || null,
        meetingLink: meetingLink || null,
        courseId: courseId || null,
        courseTitle: courseTitle || null,
      });
      await eventRepo.save(event);

      return res.status(201).json({
        id: event.id,
        title: event.title,
        eventType: event.eventType,
        eventDate: event.eventDate,
        startTime: event.startTime,
        endTime: event.endTime,
        meetingLink: event.meetingLink,
      });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * PATCH /calendar/events/:id
 * Update a calendar event (reminder, meeting, live class). User must own it.
 */
router.patch(
  '/events/:id',
  auth,
  rbac(['learner', 'instructor', 'admin', 'manager']),
  async (req, res, next) => {
    try {
      const userId = Number(req.user?.id);
      if (!Number.isFinite(userId)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const idStr = String(req.params.id || '').replace(/^ev-/, '');
      const eventId = Number.parseInt(idStr, 10);
      if (!Number.isFinite(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const { title, eventType, eventDate, startTime, endTime, meetingLink, courseId, courseTitle } = req.body || {};

      const ds = getDataSource();
      if (!ds || !ds.isInitialized) {
        return res.status(503).json({ message: 'Database unavailable' });
      }

      const eventRepo = ds.getRepository('CalendarEvent');
      const event = await eventRepo.findOne({ where: { id: eventId, userId } });
      if (!event) {
        return res.status(404).json({ message: 'Event not found or you do not have permission to edit it' });
      }

      if (title !== undefined) event.title = String(title).trim();
      if (eventDate !== undefined) event.eventDate = eventDate.split('T')[0];
      if (startTime !== undefined) event.startTime = startTime || null;
      if (endTime !== undefined) event.endTime = endTime || null;
      if (meetingLink !== undefined) event.meetingLink = meetingLink || null;
      if (courseId !== undefined) event.courseId = courseId || null;
      if (courseTitle !== undefined) event.courseTitle = courseTitle || null;

      if (eventType !== undefined) {
        const role = (req.user?.role || '').toLowerCase();
        const type = (eventType || 'reminder').toLowerCase();
        let allowedType = type;
        if (type === 'live_class' && role !== 'instructor') allowedType = 'meeting';
        if (type === 'meeting' && !['instructor', 'admin', 'manager'].includes(role)) allowedType = 'reminder';
        event.eventType = allowedType;
      }

      await eventRepo.save(event);

      return res.status(200).json({
        id: event.id,
        title: event.title,
        eventType: event.eventType,
        eventDate: event.eventDate,
        startTime: event.startTime,
        endTime: event.endTime,
        meetingLink: event.meetingLink,
      });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * DELETE /calendar/events/:id
 * Delete a calendar event. User must own it.
 */
router.delete(
  '/events/:id',
  auth,
  rbac(['learner', 'instructor', 'admin', 'manager']),
  async (req, res, next) => {
    try {
      const userId = Number(req.user?.id);
      if (!Number.isFinite(userId)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const idStr = String(req.params.id || '').replace(/^ev-/, '');
      const eventId = Number.parseInt(idStr, 10);
      if (!Number.isFinite(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const ds = getDataSource();
      if (!ds || !ds.isInitialized) {
        return res.status(503).json({ message: 'Database unavailable' });
      }

      const eventRepo = ds.getRepository('CalendarEvent');
      const event = await eventRepo.findOne({ where: { id: eventId, userId } });
      if (!event) {
        return res.status(404).json({ message: 'Event not found or you do not have permission to delete it' });
      }

      await eventRepo.remove(event);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * POST /calendar/assessments
 * Create an assessment (instructor only) - for assignments/quizzes with due dates.
 */
router.post(
  '/assessments',
  auth,
  rbac(['instructor', 'admin']),
  async (req, res, next) => {
    try {
      const userId = Number(req.user?.id);
      if (!Number.isFinite(userId)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { title, courseId, courseTitle, pathSlug, module, moduleId, type, dueDateISO, passMark, totalPoints, description, status: bodyStatus } = req.body || {};
      if (!title) {
        return res.status(400).json({ message: 'Title is required' });
      }

      const ds = getDataSource();
      if (!ds || !ds.isInitialized) {
        return res.status(503).json({ message: 'Database unavailable' });
      }

      const status = (bodyStatus || 'published').toLowerCase() === 'draft' ? 'draft' : 'published';
      const assessmentRepo = ds.getRepository('Assessment');
      const assessment = assessmentRepo.create({
        title: String(title).trim(),
        courseId: courseId || null,
        courseTitle: courseTitle || null,
        pathSlug: pathSlug || 'fullstack',
        module: module || null,
        moduleId: moduleId || null,
        type: (type || 'assignment').toLowerCase() === 'quiz' ? 'quiz' : 'assignment',
        dueDateISO: dueDateISO ? String(dueDateISO).split('T')[0] : null,
        passMark: passMark != null ? Number(passMark) : null,
        totalPoints: totalPoints != null ? Number(totalPoints) : null,
        description: typeof description === 'string' && description.trim() ? description.trim() : null,
        createdById: userId,
        status,
      });
      await assessmentRepo.save(assessment);

      if (status === 'published') {
        await notifyEnrolledLearners(ds, assessment);
      }

      return res.status(201).json({
        id: assessment.id,
        title: assessment.title,
        type: assessment.type,
        dueDateISO: assessment.dueDateISO,
        status: assessment.status,
      });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * PATCH /calendar/assessments/:id
 * Update an assessment (instructor only). User must have created it.
 */
router.patch(
  '/assessments/:id',
  auth,
  rbac(['instructor', 'admin']),
  async (req, res, next) => {
    try {
      const userId = Number(req.user?.id);
      if (!Number.isFinite(userId)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const idStr = String(req.params.id || '').replace(/^a-/, '');
      const assessmentId = Number.parseInt(idStr, 10);
      if (!Number.isFinite(assessmentId)) {
        return res.status(400).json({ message: 'Invalid assessment ID' });
      }

      const { title, courseId, courseTitle, pathSlug, module, moduleId, type, dueDateISO, passMark, totalPoints, status: bodyStatus } = req.body || {};

      const ds = getDataSource();
      if (!ds || !ds.isInitialized) {
        return res.status(503).json({ message: 'Database unavailable' });
      }

      const assessmentRepo = ds.getRepository('Assessment');
      const assessment = await assessmentRepo.findOne({ where: { id: assessmentId, createdById: userId } });
      if (!assessment) {
        return res.status(404).json({ message: 'Assessment not found or you do not have permission to edit it' });
      }

      const wasDraft = assessment.status === 'draft';
      if (title !== undefined) assessment.title = String(title).trim();
      if (courseId !== undefined) assessment.courseId = courseId || null;
      if (courseTitle !== undefined) assessment.courseTitle = courseTitle || null;
      if (pathSlug !== undefined) assessment.pathSlug = pathSlug || 'fullstack';
      if (module !== undefined) assessment.module = module || null;
      if (moduleId !== undefined) assessment.moduleId = moduleId || null;
      if (type !== undefined) assessment.type = (type || 'assignment').toLowerCase() === 'quiz' ? 'quiz' : 'assignment';
      if (dueDateISO !== undefined) assessment.dueDateISO = dueDateISO ? String(dueDateISO).split('T')[0] : null;
      if (passMark !== undefined) assessment.passMark = passMark != null ? Number(passMark) : null;
      if (totalPoints !== undefined) assessment.totalPoints = totalPoints != null ? Number(totalPoints) : null;
      if (bodyStatus !== undefined) assessment.status = bodyStatus === 'draft' ? 'draft' : 'published';

      await assessmentRepo.save(assessment);

      if (wasDraft && assessment.status === 'published') {
        await notifyEnrolledLearners(ds, assessment);
      }

      return res.status(200).json({
        id: assessment.id,
        title: assessment.title,
        type: assessment.type,
        dueDateISO: assessment.dueDateISO,
      });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * DELETE /calendar/assessments/:id
 * Delete an assessment (instructor only). User must have created it.
 */
router.delete(
  '/assessments/:id',
  auth,
  rbac(['instructor', 'admin']),
  async (req, res, next) => {
    try {
      const userId = Number(req.user?.id);
      if (!Number.isFinite(userId)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const idStr = String(req.params.id || '').replace(/^a-/, '');
      const assessmentId = Number.parseInt(idStr, 10);
      if (!Number.isFinite(assessmentId)) {
        return res.status(400).json({ message: 'Invalid assessment ID' });
      }

      const ds = getDataSource();
      if (!ds || !ds.isInitialized) {
        return res.status(503).json({ message: 'Database unavailable' });
      }

      const assessmentRepo = ds.getRepository('Assessment');
      const assessment = await assessmentRepo.findOne({ where: { id: assessmentId, createdById: userId } });
      if (!assessment) {
        return res.status(404).json({ message: 'Assessment not found or you do not have permission to delete it' });
      }

      await assessmentRepo.remove(assessment);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
