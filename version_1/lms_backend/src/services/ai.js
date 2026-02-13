const Anthropic = require('@anthropic-ai/sdk');

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
const DEFAULT_MAX_TOKENS = Number(process.env.ANTHROPIC_MAX_TOKENS || 1024);
const DEFAULT_ANTHROPIC_VERSION = process.env.ANTHROPIC_VERSION || '2023-06-01';

/**
 * Normalize and validate the quiz schema mandated by product requirements:
 * - JSON array of exactly 5 questions
 * - each question has: questionText (string), options (array of 4 strings), correctAnswerIndex (0..3)
 *
 * @param {any} quiz
 * @returns {Array<{questionText: string, options: string[], correctAnswerIndex: number}>|null}
 */
function normalizeQuiz(quiz) {
  if (!Array.isArray(quiz)) {
    return null;
  }

  const normalized = [];
  for (const item of quiz) {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const questionText = typeof item.questionText === 'string' ? item.questionText.trim() : '';
    const options = Array.isArray(item.options)
      ? item.options.map((o) => (typeof o === 'string' ? o.trim() : '')).filter(Boolean)
      : [];

    const idxRaw = item.correctAnswerIndex;
    const correctAnswerIndex = Number.isFinite(Number(idxRaw)) ? Number(idxRaw) : NaN;

    if (!questionText) {
      return null;
    }
    if (options.length !== 4) {
      return null;
    }
    if (!Number.isInteger(correctAnswerIndex) || correctAnswerIndex < 0 || correctAnswerIndex > 3) {
      return null;
    }

    normalized.push({ questionText, options, correctAnswerIndex });
  }

  return normalized;
}

/**
 * Normalize learner AI quiz: exactly 10 MCQs, 4 options each, correctAnswerIndex 0-3.
 * @param {any} quiz
 * @returns {Array<{questionText: string, options: string[], correctAnswerIndex: number}>|null}
 */
function normalizeLearnerQuiz(quiz) {
  const normalized = normalizeQuiz(quiz);
  return normalized && normalized.length === 10 ? normalized : null;
}

class AIService {
  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      const err = new Error('ANTHROPIC_API_KEY is not configured');
      err.code = 'ANTHROPIC_API_KEY_MISSING';
      throw err;
    }

    /**
     * We configure the official SDK with required defaults:
     * - anthropic-version header via SDK option `defaultHeaders`
     */
    this.client = new Anthropic({
      apiKey,
      defaultHeaders: {
        'anthropic-version': DEFAULT_ANTHROPIC_VERSION,
      },
    });
  }

  // PUBLIC_INTERFACE
  async generateSummary(content) {
    /** Returns a concise 3-paragraph summary for the provided lesson content. */
    const input = typeof content === 'string' ? content.trim() : '';
    if (!input) {
      const err = new Error('content is required');
      err.code = 'AI_INPUT_INVALID';
      throw err;
    }

    const prompt = [
      'You are an assistant helping create learning content for an enterprise LMS.',
      'Write a concise summary of the lesson content below in exactly 3 paragraphs.',
      'Do not add a title. Do not use bullet points. Keep it clear and professional.',
      '',
      'LESSON CONTENT:',
      input,
    ].join('\n');

    const msg = await this.client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: DEFAULT_MAX_TOKENS,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = Array.isArray(msg.content)
      ? msg.content
          .filter((c) => c && c.type === 'text')
          .map((c) => c.text)
          .join('\n')
      : '';

    return text.trim();
  }

  // PUBLIC_INTERFACE
  async generateQuiz(content) {
    /** Returns an array of 5 multiple choice questions in the mandated JSON schema. */
    const input = typeof content === 'string' ? content.trim() : '';
    if (!input) {
      const err = new Error('content is required');
      err.code = 'AI_INPUT_INVALID';
      throw err;
    }

    // Mandated: use a system prompt that requires the JSON schema.
    const systemPrompt = [
      'You are an enterprise LMS quiz generator.',
      'You MUST respond with ONLY a valid JSON array (no markdown, no code fences, no commentary).',
      'The JSON array MUST contain exactly 5 objects.',
      'Each object MUST have exactly these fields:',
      '- questionText: string',
      '- options: array of exactly 4 strings',
      '- correctAnswerIndex: integer 0-3 (index into options)',
      'Do not include any other keys.',
      'Questions MUST be based strictly on the lesson content.',
      'Options MUST be plausible and non-overlapping.',
    ].join('\n');

    const userPrompt = ['LESSON CONTENT:', input].join('\n');

    const msg = await this.client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: DEFAULT_MAX_TOKENS,
      temperature: 0.2,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = Array.isArray(msg.content)
      ? msg.content
          .filter((c) => c && c.type === 'text')
          .map((c) => c.text)
          .join('\n')
      : '';

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Sometimes models wrap JSON in text. Try to extract the first JSON array.
      const start = text.indexOf('[');
      const end = text.lastIndexOf(']');
      if (start >= 0 && end > start) {
        try {
          parsed = JSON.parse(text.slice(start, end + 1));
        } catch (err) {
          const e = new Error('AI quiz response was not valid JSON');
          e.code = 'AI_OUTPUT_INVALID_JSON';
          throw e;
        }
      } else {
        const err = new Error('AI quiz response was not valid JSON');
        err.code = 'AI_OUTPUT_INVALID_JSON';
        throw err;
      }
    }

    const normalized = normalizeQuiz(parsed);
    if (!normalized || normalized.length !== 5) {
      const err = new Error('AI quiz response did not match required schema (expected 5 questions)');
      err.code = 'AI_OUTPUT_INVALID_SCHEMA';
      throw err;
    }

    return normalized;
  }

  /**
   * Generate 10 MCQs for learner AI quiz based on course/lesson topic and difficulty.
   * @param {string} topic - e.g. course title + lesson title
   * @param {string} difficulty - 'easy' | 'medium' | 'hard'
   * @returns {Promise<Array<{questionText: string, options: string[], correctAnswerIndex: number}>>}
   */
  async generateLearnerQuiz(topic, difficulty = 'medium') {
    const input = typeof topic === 'string' ? topic.trim() : '';
    if (!input) {
      const err = new Error('topic is required');
      err.code = 'AI_INPUT_INVALID';
      throw err;
    }
    const diff = ['easy', 'medium', 'hard'].includes(String(difficulty).toLowerCase())
      ? String(difficulty).toLowerCase()
      : 'medium';

    const systemPrompt = [
      'You are an enterprise LMS quiz generator for learner self-assessment.',
      'You MUST respond with ONLY a valid JSON array (no markdown, no code fences, no commentary).',
      'The JSON array MUST contain exactly 10 objects.',
      'Each object MUST have exactly these fields:',
      '- questionText: string',
      '- options: array of exactly 4 strings',
      '- correctAnswerIndex: integer 0-3 (index into options)',
      'Do not include any other keys.',
      `Difficulty: ${diff}. Easy = recall/facts; Medium = application; Hard = analysis/synthesis.`,
      'Questions MUST be based on the topic provided. Options MUST be plausible and non-overlapping.',
    ].join('\n');

    const userPrompt = ['TOPIC:', input].join('\n');

    const msg = await this.client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 4096,
      temperature: 0.3,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = Array.isArray(msg.content)
      ? msg.content
          .filter((c) => c && c.type === 'text')
          .map((c) => c.text)
          .join('\n')
      : '';

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const start = text.indexOf('[');
      const end = text.lastIndexOf(']');
      if (start >= 0 && end > start) {
        try {
          parsed = JSON.parse(text.slice(start, end + 1));
        } catch (err) {
          const e = new Error('AI quiz response was not valid JSON');
          e.code = 'AI_OUTPUT_INVALID_JSON';
          throw e;
        }
      } else {
        const err = new Error('AI quiz response was not valid JSON');
        err.code = 'AI_OUTPUT_INVALID_JSON';
        throw err;
      }
    }

    const normalized = normalizeLearnerQuiz(parsed);
    if (!normalized || normalized.length !== 10) {
      const err = new Error('AI quiz response did not match required schema (expected 10 questions)');
      err.code = 'AI_OUTPUT_INVALID_SCHEMA';
      throw err;
    }
    return normalized;
  }

  /**
   * Generate feedback text: where the learner should improve, based on wrong answers and topic.
   * @param {Array<{questionText: string, options: string[], correctAnswerIndex: number}>} questions
   * @param {number[]} userAnswers - selected index per question (0-3)
   * @param {string} topic
   * @returns {Promise<string>}
   */
  async generateQuizFeedback(questions, userAnswers, topic) {
    if (!Array.isArray(questions) || !Array.isArray(userAnswers)) {
      const err = new Error('questions and userAnswers are required');
      err.code = 'AI_INPUT_INVALID';
      throw err;
    }
    const wrongIndices = [];
    for (let i = 0; i < Math.min(questions.length, userAnswers.length); i++) {
      if (questions[i].correctAnswerIndex !== userAnswers[i]) {
        wrongIndices.push(i);
      }
    }
    const topicStr = typeof topic === 'string' ? topic.trim() : 'the course';
    const prompt = [
      'You are the DigitalT3 AI Mentor. After a learner completes a quiz, give short, actionable feedback.',
      'Write 2–4 sentences only. Tell the learner:',
      '1) What they did well (if any).',
      '2) Which areas to improve (based on the questions they got wrong).',
      'Do not list question numbers. Be encouraging and specific to the topic.',
      '',
      'Topic: ' + topicStr,
      '',
      'Wrong answers (question index, their choice, correct index):',
      wrongIndices
        .map((i) => {
          const q = questions[i];
          const chosen = userAnswers[i];
          return `Q${i + 1}: chose ${chosen}, correct is ${q.correctAnswerIndex} (${(q.options[q.correctAnswerIndex] || '').slice(0, 50)}...)`;
        })
        .join('\n') || 'None (all correct).',
    ].join('\n');

    const msg = await this.client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 512,
      temperature: 0.5,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = Array.isArray(msg.content)
      ? msg.content
          .filter((c) => c && c.type === 'text')
          .map((c) => c.text)
          .join('\n')
      : '';
    return text.trim() || 'Review the topics you missed and try the quiz again when ready.';
  }

  /**
   * Generate feedback for an intern's assignment submission (instructor review).
   * @param {string} assignmentTitle - Title of the assignment
   * @param {string} assignmentDescription - Assignment description / rubric
   * @param {string} submissionContent - What the learner submitted (text, link, or summary)
   * @returns {Promise<string>} AI-generated feedback text
   */
  async generateAssignmentFeedback(assignmentTitle, assignmentDescription, submissionContent) {
    const title = typeof assignmentTitle === 'string' ? assignmentTitle.trim() : 'Assignment';
    const desc = typeof assignmentDescription === 'string' ? assignmentDescription.trim() : '';
    const submission = typeof submissionContent === 'string' ? submissionContent.trim() : '(No submission content provided)';

    const prompt = [
      'You are the DigitalT3 AI assistant helping an instructor give feedback on an intern\'s assignment submission.',
      'Write constructive, professional feedback in 3–5 sentences. Include:',
      '1) What the intern did well.',
      '2) Specific areas to improve (technical or clarity).',
      '3) One or two actionable next steps.',
      'Be encouraging but clear. Do not use bullet points in the final text; write in short paragraphs or a single block.',
      '',
      'Assignment title: ' + title,
      desc ? '\nAssignment description / rubric:\n' + desc.slice(0, 1500) : '',
      '\nSubmission content (or summary):\n' + submission.slice(0, 2000),
    ].join('\n');

    const msg = await this.client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 600,
      temperature: 0.4,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = Array.isArray(msg.content)
      ? msg.content
          .filter((c) => c && c.type === 'text')
          .map((c) => c.text)
          .join('\n')
      : '';

    return text.trim() || 'Provide specific praise and one or two concrete improvements when you review this submission.';
  }

  // PUBLIC_INTERFACE
  async chat(message, context = {}) {
    /**
     * Chat with role-specific AI bots: Instructor Co-Teacher, Manager Performance Strategist, Admin System Architect, or Learner Mentor.
     * @param {string} message - User's message/question
     * @param {object} context - Context object with:
     *   - type: 'mentor' | 'chatbot' | 'instructor' | 'manager' | 'admin'
     *   - userRole: 'instructor' | 'manager' | 'admin' | 'learner' (from req.user.role)
     *   - courseId: number (optional)
     *   - lessonId: number (optional)
     *   - courseTitle: string (optional)
     *   - courseDescription: string (optional)
     *   - lessonTitle: string (optional)
     *   - lessonContent: string (optional)
     *   - aiSummary: string (optional)
     *   - instructorContext: object (optional) - courses, studentStats, atRiskStudents
     *   - managerContext: object (optional) - teamProgress, skillGaps, complianceStatus
     *   - adminContext: object (optional) - systemStats, userCounts, courseCounts
     * @returns {Promise<string>} AI response text
     */
    const userMessage = typeof message === 'string' ? message.trim() : '';
    if (!userMessage) {
      const err = new Error('message is required');
      err.code = 'AI_INPUT_INVALID';
      throw err;
    }

    const {
      type = 'chatbot',
      userRole = 'learner',
      courseId,
      lessonId,
      courseTitle,
      courseDescription,
      lessonTitle,
      lessonContent,
      aiSummary,
      instructorContext = {},
      managerContext = {},
      adminContext = {},
    } = context;

    // Build system prompt based on user role and type
    let systemPrompt;

    // Role-based prompts (override type if userRole is set)
    if (userRole === 'instructor') {
      systemPrompt = [
        'You are the "DigitalT3 Co-Teacher," an AI assistant designed to reduce administrative friction for instructors.',
        '',
        'PRIMARY CAPABILITIES:',
        '1. Content Generation: Quickly create course summaries, quizzes, or full modules from simple prompts.',
        '2. Grading & Feedback: Assist in grading assessments and provide instant, personalized feedback to students.',
        '3. Predictive Support: Flag "at-risk" students who are falling behind or struggling with specific modules.',
        '4. Communication: Automate responses to routine student queries about deadlines, syllabus details, and course policies.',
        '',
        'GUARDRAILS:',
        '- Focus ONLY on course management, student engagement, grading, and educational content.',
        '- If asked about unrelated topics, politely redirect to course-related matters.',
        '- Provide actionable, specific advice based on student performance data when available.',
        '',
        'TONE: Professional, supportive, and efficient.',
        '',
      ].join('\n');

      // Add instructor-specific context
      if (instructorContext.courses && instructorContext.courses.length > 0) {
        systemPrompt += '\nYOUR COURSES:\n';
        instructorContext.courses.slice(0, 5).forEach((c) => {
          systemPrompt += `- ${c.title} (${c.status}) - ${c.studentCount || 0} students\n`;
        });
      }

      if (instructorContext.atRiskStudents && instructorContext.atRiskStudents.length > 0) {
        systemPrompt += '\nAT-RISK STUDENTS (need attention):\n';
        instructorContext.atRiskStudents.slice(0, 5).forEach((s) => {
          systemPrompt += `- ${s.name} (${s.email}): ${s.issue || 'Low quiz scores'}\n`;
        });
      }

      if (instructorContext.studentStats) {
        systemPrompt += `\nOVERALL STATS: ${instructorContext.studentStats.totalStudents || 0} total students, `;
        systemPrompt += `Average quiz score: ${instructorContext.studentStats.avgScore || 'N/A'}%\n`;
      }
    } else if (userRole === 'manager' || userRole === 'admin') {
      // Manager and Admin share similar capabilities but different focus
      const botName = userRole === 'manager' ? 'Performance Strategist' : 'System Architect';
      const primaryGoal = userRole === 'manager' ? 'Team Performance & Skill Gap Analysis' : 'System Efficiency & Automation';

      systemPrompt = [
        `You are the "DigitalT3 ${botName}," an AI assistant focused on ${primaryGoal}.`,
        '',
      ].join('\n');

      if (userRole === 'manager') {
        systemPrompt += [
          'PRIMARY CAPABILITIES:',
          '1. Team Progress Tracking: Provide at-a-glance status of team compliance training and course completion.',
          '2. Skill Gap Analysis: Identify high-potential employees and suggest specific upskilling modules based on performance.',
          '3. Automated Nudges: Suggest intelligent nudges for employees who haven\'t started assigned training.',
          '4. Resource Allocation: Analyze engagement data to show where training budgets are most effective.',
          '',
          'GUARDRAILS:',
          '- Focus on team-wide metrics, compliance, skill development, and resource optimization.',
          '- Provide data-driven insights and actionable recommendations.',
          '- Keep answers concise and focused on performance metrics.',
          '',
          'TONE: Strategic, data-focused, and actionable.',
          '',
        ].join('\n');

        // Add manager-specific context
        if (managerContext.teamProgress) {
          systemPrompt += '\nTEAM PROGRESS:\n';
          systemPrompt += `- Total Team Members: ${managerContext.teamProgress.totalMembers || 0}\n`;
          systemPrompt += `- Completion Rate: ${managerContext.teamProgress.completionRate || 0}%\n`;
          systemPrompt += `- Average Readiness Score: ${managerContext.teamProgress.avgReadiness || 0}\n`;
        }

        if (managerContext.skillGaps && managerContext.skillGaps.length > 0) {
          systemPrompt += '\nIDENTIFIED SKILL GAPS:\n';
          managerContext.skillGaps.slice(0, 5).forEach((gap) => {
            systemPrompt += `- ${gap.area}: ${gap.affectedCount || 0} team members need improvement\n`;
          });
        }
      } else {
        // Admin
        systemPrompt += [
          'PRIMARY CAPABILITIES:',
          '1. User Management: Automate enrollments, manage user roles, and set up permissions.',
          '2. Compliance Monitoring: Track regulatory standards and generate audit reports.',
          '3. Troubleshooting: Act as a technical FAQ for the LMS, helping solve integration issues or data migration questions.',
          '4. System Optimization: Suggest improvements based on system-wide analytics, such as identifying underused content libraries.',
          '',
          'GUARDRAILS:',
          '- Focus on system administration, user management, compliance, and technical operations.',
          '- Provide technical, precise answers about system configuration and data.',
          '- Keep answers focused on system efficiency and automation.',
          '',
          'TONE: Technical, precise, and solution-oriented.',
          '',
        ].join('\n');

        // Add admin-specific context
        if (adminContext.systemStats) {
          systemPrompt += '\nSYSTEM STATISTICS:\n';
          systemPrompt += `- Total Users: ${adminContext.systemStats.totalUsers || 0}\n`;
          systemPrompt += `- Total Courses: ${adminContext.systemStats.totalCourses || 0}\n`;
          systemPrompt += `- Total Lessons: ${adminContext.systemStats.totalLessons || 0}\n`;
          systemPrompt += `- Active Learners: ${adminContext.systemStats.activeLearners || 0}\n`;
        }
      }
    } else if (type === 'mentor') {
      // Learner AI Mentor (existing functionality)
      systemPrompt = [
        'You are the "DigitalT3 AI Mentor," an expert learning assistant for the DigitalT3 LMS.',
        'Your role is to help learners understand course content, clarify concepts, and guide them through their learning journey.',
        '',
        'GUARDRAILS:',
        '- ONLY answer questions related to the courses, professional development, or the DigitalT3 platform.',
        '- If a user asks about unrelated topics (e.g., "how to cook pizza"), politely redirect them to their learning path.',
        '- Stay focused on educational content and learning objectives.',
        '',
        'TONE: Professional, encouraging, and academic.',
        '',
      ].join('\n');

      // Add course/lesson context if available
      if (courseTitle || courseDescription || lessonTitle || lessonContent || aiSummary) {
        systemPrompt += '\nCURRENT CONTEXT:\n';
        if (courseTitle) {
          systemPrompt += `- Course: ${courseTitle}\n`;
        }
        if (courseDescription) {
          systemPrompt += `- Course Description: ${courseDescription}\n`;
        }
        if (lessonTitle) {
          systemPrompt += `- Current Lesson: ${lessonTitle}\n`;
        }
        if (aiSummary) {
          systemPrompt += `- Lesson Summary: ${aiSummary}\n`;
        }
        if (lessonContent) {
          systemPrompt += `- Lesson Content: ${lessonContent.substring(0, 1000)}${lessonContent.length > 1000 ? '...' : ''}\n`;
        }
        systemPrompt += '\nUse this context to provide relevant, specific answers about the course content.\n';
      }
    } else {
      // Global chatbot (fallback)
      systemPrompt = [
        'You are the "DigitalT3 AI Assistant," a helpful guide for the DigitalT3 LMS platform.',
        'Your role is to help users navigate the platform, understand features, and answer general questions about the LMS.',
        '',
        'GUARDRAILS:',
        '- Focus on platform navigation, course completion, assignments, quizzes, certificates, and progress tracking.',
        '- If a user asks about unrelated topics (e.g., "how to cook pizza"), politely redirect them to their learning path.',
        '- Keep answers concise and actionable.',
        '',
        'TONE: Professional, friendly, and helpful.',
      ].join('\n');
    }

    const msg = await this.client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: DEFAULT_MAX_TOKENS * 2, // Allow longer responses for chat
      temperature: 0.7, // More conversational for chat
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const text = Array.isArray(msg.content)
      ? msg.content
          .filter((c) => c && c.type === 'text')
          .map((c) => c.text)
          .join('\n')
      : '';

    return text.trim();
  }

  /**
   * Generate a single, highly effective YouTube search string from course and lesson context.
   * Used for AI-Powered Supplemental Learning (no Google Cloud API).
   * @param {string} courseTitle - Current course title
   * @param {string} lessonName - Current lesson/module name
   * @returns {Promise<string>} One search string, e.g. "React Context API vs Redux tutorial"
   */
  async generateYoutubeSearchKeyword(courseTitle, lessonName) {
    const course = typeof courseTitle === 'string' ? courseTitle.trim() : '';
    const lesson = typeof lessonName === 'string' ? lessonName.trim() : '';
    const context = [course, lesson].filter(Boolean).join(' / ') || 'general learning';

    const prompt = [
      'You are helping learners find supplemental YouTube videos for an LMS.',
      'Given the current course and lesson, output exactly ONE YouTube search query string.',
      'The query should be concise, effective, and likely to return high-quality tutorial or explanation videos.',
      'Do not add quotes, explanation, or any other text. Only output the search string.',
      '',
      'Course / Lesson context:',
      context,
    ].join('\n');

    const msg = await this.client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 128,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = Array.isArray(msg.content)
      ? msg.content
          .filter((c) => c && c.type === 'text')
          .map((c) => c.text)
          .join('\n')
      : '';

    const searchString = text.trim().replace(/^["']|["']$/g, '');
    return searchString || `${course} ${lesson} tutorial`.trim() || 'educational tutorial';
  }

  /**
   * Skill Gap Analysis: Compare user goal + known skills against domain outcomes.
   * Returns recommended path slug and skill gaps.
   */
  async analyzeSkillGap(goal, knownSkills = [], domainPaths = []) {
    const goalStr = typeof goal === 'string' ? goal.trim() : '';
    const skillsArr = Array.isArray(knownSkills) ? knownSkills : [];
    const pathsArr = Array.isArray(domainPaths) ? domainPaths : [];

    const prompt = [
      'You are an LMS skill gap analyst. Given a user goal and their known skills, recommend the best matching learning path and identify skill gaps.',
      '',
      'USER GOAL: ' + (goalStr || 'Not specified'),
      'KNOWN SKILLS: ' + (skillsArr.length > 0 ? skillsArr.join(', ') : 'None'),
      '',
      'AVAILABLE DOMAIN PATHS (slug: title):',
      ...pathsArr.map((p) => `- ${p.slug}: ${p.title}`),
      '',
      'Role-based mapping rules:',
      '- Pentester, cybersecurity, security → cloud-devops (or fullstack if cyber path not available)',
      '- Build apps, web apps, full stack → fullstack',
      '- UI/UX, design → uiux',
      '- Data, analytics → data-analyst',
      '- DevOps, cloud, infrastructure → cloud-devops',
      '- QA, testing → qa',
      '- Marketing → digital-marketing',
      '',
      'Respond with ONLY a valid JSON object, no markdown, no extra text:',
      '{ "recommendedPathSlug": "fullstack", "skillGaps": ["skill1","skill2"], "suggestedStartPhase": "Phase 1: Foundations", "personalizedMessage": "One line of encouragement" }',
    ].join('\n');

    const msg = await this.client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 512,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = Array.isArray(msg.content)
      ? msg.content
          .filter((c) => c && c.type === 'text')
          .map((c) => c.text)
          .join('\n')
      : '';

    try {
      const json = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
      return {
        recommendedPathSlug: json.recommendedPathSlug || 'fullstack',
        skillGaps: Array.isArray(json.skillGaps) ? json.skillGaps : [],
        suggestedStartPhase: json.suggestedStartPhase || '',
        personalizedMessage: json.personalizedMessage || '',
      };
    } catch {
      return {
        recommendedPathSlug: 'fullstack',
        skillGaps: [],
        suggestedStartPhase: 'Phase 1: Foundations',
        personalizedMessage: 'Start with the foundations and build up your skills.',
      };
    }
  }

  /**
   * Generate personalized learning path based on goal, skills, and optional quiz performance.
   * If quizScore 100% on beginner: suggest skipping intermediate. If fail: suggest remedial.
   */
  async generateLearningPath(goal, knownSkills = [], pathStructure = {}, quizPerformance = {}) {
    const quizInfo =
      quizPerformance.lessonTitle && quizPerformance.percentage != null
        ? `Last quiz: ${quizPerformance.lessonTitle} - ${quizPerformance.percentage}%`
        : 'No recent quiz data';
    const prompt = [
      'You are an LMS path generator. Generate a personalized learning path.',
      '',
      'USER GOAL: ' + (typeof goal === 'string' ? goal.trim() : ''),
      'KNOWN SKILLS: ' + (Array.isArray(knownSkills) ? knownSkills.join(', ') : ''),
      'QUIZ PERFORMANCE: ' + quizInfo,
      '',
      'PATH STRUCTURE (phases and courses):',
      JSON.stringify(pathStructure, null, 2).slice(0, 2000),
      '',
      'Rules:',
      '- If quiz 100% on Beginner: suggest skipIntermediate: true for that topic',
      '- If quiz < 60%: suggest remedialVideo or repeatModule',
      '- Otherwise: follow standard path',
      '',
      'Respond with ONLY valid JSON:',
      '{ "phases": [ { "id": "phase1", "name": "...", "courses": [ { "id": "...", "title": "...", "status": "required|skip|remedial", "reason": "..." } ] } ], "dynamicSuggestions": [ { "type": "skip|remedial", "courseId": "...", "message": "..." } ] }',
    ].join('\n');

    const msg = await this.client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 2048,
      temperature: 0.4,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = Array.isArray(msg.content)
      ? msg.content
          .filter((c) => c && c.type === 'text')
          .map((c) => c.text)
          .join('\n')
      : '';

    try {
      const json = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
      return {
        phases: Array.isArray(json.phases) ? json.phases : [],
        dynamicSuggestions: Array.isArray(json.dynamicSuggestions) ? json.dynamicSuggestions : [],
      };
    } catch {
      return { phases: [], dynamicSuggestions: [] };
    }
  }
}

// PUBLIC_INTERFACE
function createAIService() {
  /** Factory to create AIService; isolates env validation for easier call sites. */
  return new AIService();
}

module.exports = { createAIService };
