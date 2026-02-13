const express = require('express');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const { getDataSource } = require('../config/db');

const router = express.Router();

/**
 * GET /learning-profile
 * Get current user's learning target/profile (goal, targetRole, knownSkills).
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
      let user;
      try {
        user = await userRepo.findOne({
          where: { id: userId },
          select: { id: true, learningProfile: true },
        });
      } catch (err) {
        const msg = err && err.message ? String(err.message) : '';
        if (msg.includes('Unknown column') || msg.includes('learningProfile') || err.code === 'ER_BAD_FIELD_ERROR') {
          return res.status(200).json({
            goal: '',
            targetRole: '',
            knownSkills: [],
            completedOnboarding: false,
          });
        }
        throw err;
      }

      const profile = user?.learningProfile || {};
      const goal = typeof profile.goal === 'string' ? profile.goal : '';
      const targetRole = typeof profile.targetRole === 'string' ? profile.targetRole : '';
      const knownSkills = Array.isArray(profile.knownSkills) ? profile.knownSkills : [];
      const completedOnboarding = Boolean(profile.completedOnboarding);

      return res.status(200).json({
        goal,
        targetRole,
        knownSkills,
        completedOnboarding,
        recommendedPathSlug: profile.recommendedPathSlug || 'fullstack',
        skillGaps: Array.isArray(profile.skillGaps) ? profile.skillGaps : [],
        personalizedMessage: typeof profile.personalizedMessage === 'string' ? profile.personalizedMessage : '',
      });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * PATCH /learning-profile
 * Update learning target (goal, targetRole, knownSkills). Used by onboarding and settings.
 */
router.patch(
  '/',
  auth,
  rbac(['learner', 'admin', 'instructor', 'manager']),
  async (req, res, next) => {
    try {
      const userId = Number(req.user?.id);
      if (!Number.isFinite(userId)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { goal, targetRole, knownSkills, completedOnboarding, recommendedPathSlug, skillGaps, personalizedMessage } =
        req.body || {};

      const ds = getDataSource();
      if (!ds || !ds.isInitialized) {
        return res.status(503).json({ message: 'Database not available' });
      }

      const userRepo = ds.getRepository('User');
      let current;
      try {
        current = await userRepo.findOne({
          where: { id: userId },
          select: { id: true, learningProfile: true },
        });
      } catch (err) {
        const msg = err && err.message ? String(err.message) : '';
        if (msg.includes('Unknown column') || msg.includes('learningProfile') || err.code === 'ER_BAD_FIELD_ERROR') {
          return res.status(503).json({
            message: 'Learning profile not yet available. Run migration: npm run db:migrate',
          });
        }
        throw err;
      }

      const existing = current?.learningProfile && typeof current.learningProfile === 'object' ? current.learningProfile : {};
      const updates = { ...existing };

      if (typeof goal === 'string') updates.goal = String(goal).trim();
      if (typeof targetRole === 'string') updates.targetRole = String(targetRole).trim();
      if (Array.isArray(knownSkills)) updates.knownSkills = knownSkills.map((s) => String(s).trim()).filter(Boolean);
      if (typeof completedOnboarding === 'boolean') updates.completedOnboarding = completedOnboarding;
      if (typeof recommendedPathSlug === 'string') updates.recommendedPathSlug = String(recommendedPathSlug).trim();
      if (Array.isArray(skillGaps)) updates.skillGaps = skillGaps.map((s) => String(s).trim()).filter(Boolean);
      if (typeof personalizedMessage === 'string') updates.personalizedMessage = String(personalizedMessage).trim();

      const payload = JSON.parse(JSON.stringify(updates));
      await userRepo.update({ id: userId }, { learningProfile: payload });

      return res.status(200).json({
        goal: updates.goal || '',
        targetRole: updates.targetRole || '',
        knownSkills: updates.knownSkills || [],
        completedOnboarding: Boolean(updates.completedOnboarding),
        recommendedPathSlug: updates.recommendedPathSlug || 'fullstack',
        skillGaps: updates.skillGaps || [],
        personalizedMessage: updates.personalizedMessage || '',
      });
    } catch (err) {
      console.error('[learning-profile PATCH]', err?.message || err);
      return next(err);
    }
  }
);

module.exports = router;
