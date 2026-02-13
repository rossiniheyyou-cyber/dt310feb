const express = require('express');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const { createAIService } = require('../services/ai');

const router = express.Router();

// Domain paths for role-based mapping (matches learningPaths slugs)
// Pentester/security maps to cloud-devops; Apps maps to fullstack
const DOMAIN_PATHS = [
  { slug: 'fullstack', title: 'Full Stack Developer (build web apps)' },
  { slug: 'uiux', title: 'UI / UX Designer' },
  { slug: 'data-analyst', title: 'Data Analyst / Data Engineer' },
  { slug: 'cloud-devops', title: 'Cloud & DevOps / Cyber Security (Pentester)' },
  { slug: 'qa', title: 'Software Tester / QA Engineer' },
  { slug: 'digital-marketing', title: 'Digital Marketing / Tech Marketing' },
];

/**
 * POST /learning-path/skill-gap
 * Skill Gap Analysis: "What is your goal?" + "What do you know?"
 * Returns recommended path and skill gaps.
 */
router.post(
  '/skill-gap',
  auth,
  rbac(['learner', 'admin', 'instructor', 'manager']),
  async (req, res, next) => {
    try {
      const { goal = '', knownSkills = [] } = req.body || {};
      let aiService;
      try {
        aiService = createAIService();
      } catch (err) {
        return res.status(503).json({
          message: 'AI service not configured. Set ANTHROPIC_API_KEY in backend .env',
        });
      }

      let result;
      try {
        result = await aiService.analyzeSkillGap(
          goal,
          knownSkills,
          DOMAIN_PATHS
        );
      } catch (err) {
        const slug = (goal && String(goal).toLowerCase().includes('engineer')) ? 'fullstack' : 'fullstack';
        result = {
          recommendedPathSlug: slug,
          skillGaps: [],
          suggestedStartPhase: 'Phase 1: Foundations',
          personalizedMessage: 'Start with the foundations and build up your skills.',
        };
      }
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * POST /learning-path/generate
 * Generate AI learning path based on goal, skills, and optional quiz performance.
 */
router.post(
  '/generate',
  auth,
  rbac(['learner', 'admin', 'instructor', 'manager']),
  async (req, res, next) => {
    try {
      const {
        goal = '',
        knownSkills = [],
        pathSlug = 'fullstack',
        pathStructure = {},
        quizPerformance = {},
      } = req.body || {};

      let aiService;
      try {
        aiService = createAIService();
      } catch (err) {
        return res.status(503).json({
          message: 'AI service not configured. Set ANTHROPIC_API_KEY in backend .env',
        });
      }

      const result = await aiService.generateLearningPath(
        goal,
        knownSkills,
        pathStructure,
        quizPerformance
      );
      return res.status(200).json({
        pathSlug,
        ...result,
      });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
