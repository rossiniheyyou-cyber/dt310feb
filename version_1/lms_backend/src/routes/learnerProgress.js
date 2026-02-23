const express = require('express');
const { In } = require('typeorm');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const { getDataSource } = require('../config/db');

const router = express.Router();

/**
 * GET /learner/progress
 * Comprehensive real-time progress data for learner progress page.
 * Merges: dashboard enrollments, learning profile, quiz stats, lesson activity.
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
        userRepo.findOne({
          where: { id: userId },
          select: { readinessScore: true, name: true, learningProfile: true },
        }),
        enrollRepo.find({
          where: { userId },
          select: { courseId: true, enrolledAt: true },
          order: { enrolledAt: 'DESC' },
        }),
        progressRepo.find({
          where: { userId },
          select: { lessonId: true, completedAt: true },
          order: { completedAt: 'DESC' },
        }),
        completionRepo.find({ where: { userId }, select: { courseId: true, completedAt: true } }),
        quizAttemptRepo.find({
          where: { userId, status: 'completed' },
          select: { id: true, quizId: true, score: true, totalQuestions: true, completedAt: true },
          order: { completedAt: 'DESC' },
          take: 200,
        }),
      ]);

      const completedLessonIds = new Set(lessonProgress.map((p) => p.lessonId));
      const completedCourseIds = new Set(courseCompletions.map((c) => c.courseId));
      const profile = user?.learningProfile && typeof user.learningProfile === 'object' ? user.learningProfile : {};

      const tagToSlug = {
        'Full Stack Developer': 'fullstack',
        'UI / UX Designer': 'uiux',
        'Data Analyst / Engineer': 'data-analyst',
        'Cloud & DevOps Engineer': 'cloud-devops',
        'QA Engineer': 'qa',
        'Digital Marketing': 'digital-marketing',
      };

      const enrollmentsWithProgress = [];
      for (const e of enrollments) {
        const course = await courseRepo.findOne({
          where: { id: e.courseId, deletedAt: null, status: 'published' },
          select: { id: true, title: true, tags: true },
        });
        if (!course) continue;

        const lessons = await lessonRepo.find({ where: { courseId: e.courseId }, select: { id: true } });
        const totalLessons = lessons.length;
        const completedCount = lessons.filter((l) => completedLessonIds.has(l.id)).length;
        const courseCompleted = completedCourseIds.has(e.courseId);
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

      const totalEnrolled = enrollmentsWithProgress.length;
      const completedCourses = enrollmentsWithProgress.filter((e) => e.courseCompleted).length;
      const overallCompletion = totalEnrolled > 0 ? Math.round((completedCourses / totalEnrolled) * 100) : 0;
      const learningPathProgress = enrollmentsWithProgress.length > 0
        ? Math.round(enrollmentsWithProgress.reduce((s, e) => s + e.progress, 0) / enrollmentsWithProgress.length)
        : 0;

      const readinessScore = user?.readinessScore != null ? Number(user.readinessScore) : 0;
      const quizScores = quizAttempts
        .filter((a) => a.score != null && a.totalQuestions > 0)
        .map((a) => Math.round((a.score / a.totalQuestions) * 100));
      const avgQuizScore = quizScores.length > 0
        ? Math.round(quizScores.reduce((s, v) => s + v, 0) / quizScores.length)
        : readinessScore;
      const quizzesCompleted = quizAttempts.length;

      const completedByDate = {};
      for (const p of lessonProgress) {
        if (p.completedAt) {
          const d = new Date(p.completedAt).toISOString().slice(0, 10);
          completedByDate[d] = (completedByDate[d] || 0) + 1;
        }
      }

      const now = new Date();
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().slice(0, 10);
        const count = completedByDate[dateStr] || 0;
        return {
          day: dayNames[d.getDay()],
          date: dateStr,
          hours: Math.round((count * 0.35) * 10) / 10,
          lessonsCompleted: count,
        };
      });

      const last4Weeks = Array.from({ length: 4 }, (_, i) => {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (7 * (3 - i)));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        let total = 0;
        for (const [d, c] of Object.entries(completedByDate)) {
          if (d >= weekStart.toISOString().slice(0, 10) && d <= weekEnd.toISOString().slice(0, 10)) {
            total += c * 0.35;
          }
        }
        return {
          week: `Week ${i + 1}`,
          hours: Math.round(total * 10) / 10,
        };
      });

      const thisWeekStart = new Date(now);
      thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      let totalHoursThisWeek = 0;
      let totalHoursThisMonth = 0;
      for (const [d, c] of Object.entries(completedByDate)) {
        const hrs = c * 0.35;
        if (d >= thisWeekStart.toISOString().slice(0, 10)) totalHoursThisWeek += hrs;
        if (d >= thisMonthStart.toISOString().slice(0, 10)) totalHoursThisMonth += hrs;
      }
      totalHoursThisWeek = Math.round(totalHoursThisWeek * 10) / 10;
      totalHoursThisMonth = Math.round(totalHoursThisMonth * 10) / 10;
      const daysWithActivity = Object.keys(completedByDate).length;
      const averageDailyHours = daysWithActivity > 0
        ? Math.round((totalHoursThisMonth / daysWithActivity) * 10) / 10
        : 0;

      const knownSkills = Array.isArray(profile.knownSkills) ? profile.knownSkills : [];
      const skillGaps = Array.isArray(profile.skillGaps) ? profile.skillGaps : [];
      const targetRole = typeof profile.targetRole === 'string' ? profile.targetRole : '';
      const pathLabel = {
        fullstack: 'Full Stack Developer',
        uiux: 'UI / UX Designer',
        'data-analyst': 'Data Analyst / Engineer',
        'cloud-devops': 'Cloud & DevOps Engineer',
        qa: 'QA / Software Tester',
        'digital-marketing': 'Digital Marketing',
      };
      const recommendedPathSlug = profile.recommendedPathSlug || 'fullstack';
      const pathTitle = pathLabel[recommendedPathSlug] || targetRole || 'Full Stack Developer';

      const firstEnrollment = enrollmentsWithProgress.length > 0
        ? enrollmentsWithProgress[enrollmentsWithProgress.length - 1]?.enrolledAt
        : null;

      // Build recent activity from lesson completions + quiz attempts
      const recentActivity = [];
      const lessonIdsToFetch = [...new Set(lessonProgress.slice(0, 30).map((p) => p.lessonId))];
      const lessonMap = {};
      if (lessonIdsToFetch.length > 0) {
        const lessons = await lessonRepo.find({
          where: { id: In(lessonIdsToFetch) },
          relations: ['course'],
          select: { id: true, title: true, courseId: true, course: { id: true, title: true, tags: true } },
        });
        for (const l of lessons) {
          const tag = l.course?.tags?.[0] ? String(l.course.tags[0]) : '';
          const pathSlug = tagToSlug[tag] || (tag ? tag.toLowerCase().replace(/\s+/g, '-') : 'fullstack');
          const courseId = l.courseId != null ? String(l.courseId) : (l.course?.id != null ? String(l.course.id) : null);
          lessonMap[l.id] = { title: l.title, courseTitle: l.course?.title || '', pathSlug, courseId };
        }
      }
      for (const p of lessonProgress.slice(0, 15)) {
        const meta = lessonMap[p.lessonId];
        if (meta && p.completedAt) {
          recentActivity.push({
            id: `lesson-${p.lessonId}`,
            type: 'module_completed',
            title: meta.title,
            subtitle: meta.courseTitle,
            timestamp: p.completedAt,
            pathSlug: meta.pathSlug,
            courseId: meta.courseId || null,
          });
        }
      }
      const quizIds = [...new Set(quizAttempts.slice(0, 15).map((a) => a.quizId).filter(Boolean))];
      const quizMap = {};
      if (quizIds.length > 0) {
        const quizRepo = ds.getRepository('Quiz');
        const quizzes = await quizRepo.find({
          where: { id: In(quizIds) },
          select: { id: true, title: true, courseId: true },
        });
        const courseIds = [...new Set(quizzes.map((q) => q.courseId).filter(Boolean))];
        const courses = courseIds.length > 0
          ? await courseRepo.find({ where: { id: In(courseIds) }, select: { id: true, title: true, tags: true } })
          : [];
        const courseById = Object.fromEntries(courses.map((c) => [c.id, c]));
        for (const q of quizzes) {
          const course = courseById[q.courseId];
          const tag = course?.tags?.[0] ? String(course.tags[0]) : '';
          quizMap[q.id] = { title: q.title, courseTitle: course?.title || '', pathSlug: tagToSlug[tag] || (tag ? tag.toLowerCase().replace(/\s+/g, '-') : 'fullstack'), courseId: String(q.courseId) };
        }
      }
      for (const a of quizAttempts.slice(0, 10)) {
        const meta = a.quizId && quizMap[a.quizId];
        if (meta && a.completedAt) {
          recentActivity.push({
            id: `quiz-${a.id}`,
            type: 'quiz_completed',
            title: meta.title,
            subtitle: meta.courseTitle,
            timestamp: a.completedAt,
            pathSlug: meta.pathSlug,
            courseId: meta.courseId,
          });
        }
      }
      recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const recentActivitySlice = recentActivity.slice(0, 5);

      return res.status(200).json({
        overview: {
          overallCompletion,
          readinessStatus: readinessScore >= 70 ? 'On Track' : readinessScore >= 50 ? 'Needs Attention' : 'At Risk',
          targetRole: targetRole || pathTitle,
          learningPathProgress,
          totalEnrolledCourses: totalEnrolled,
          completedCourses,
          totalAssignments: 0,
          completedAssignments: 0,
          totalQuizzes: 0,
          passedQuizzes: quizzesCompleted,
          averageQuizScore: avgQuizScore,
          totalLearningHours: Math.round(totalHoursThisMonth * 10) / 10,
          weeklyTarget: 10,
          currentWeekHours: totalHoursThisWeek,
          currentStreak: 0,
        },
        learningPath: {
          pathId: recommendedPathSlug,
          pathTitle,
          description: `Track progress toward ${pathTitle}`,
          totalDuration: '6–8 months',
          overallProgress: learningPathProgress,
          enrolledDate: firstEnrollment ? new Date(firstEnrollment).toISOString().slice(0, 10) : null,
          expectedCompletion: null,
          phases: [],
        },
        skillProgress: [
          ...knownSkills.map((name, i) => ({
            id: `known-${i}`,
            name,
            category: 'Skills',
            currentLevel: 80,
            targetLevel: 80,
            proficiency: 'advanced',
            relatedCourses: [],
            hasGap: false,
          })),
          ...skillGaps.map((name, i) => ({
            id: `gap-${i}`,
            name,
            category: 'To Develop',
            currentLevel: 30,
            targetLevel: 80,
            proficiency: 'beginner',
            relatedCourses: [],
            hasGap: true,
          })),
        ],
        timeActivity: {
          totalHoursThisWeek,
          totalHoursThisMonth,
          averageDailyHours,
          weeklyTrend: last4Weeks,
          dailyActivity: last7Days.map((d) => ({ ...d, hours: d.hours })),
          activitySummary: {
            videosWatched: lessonProgress.length,
            assignmentsSubmitted: 0,
            quizzesCompleted: quizzesCompleted,
            resourcesDownloaded: 0,
          },
        },
        enrollments: enrollmentsWithProgress,
        recentActivity: recentActivitySlice,
      });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
