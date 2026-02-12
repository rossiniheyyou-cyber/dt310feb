const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const authMiddleware = require('../middleware/auth');
const { signAccessToken } = require('../utils/jwt');
const { getDataSource } = require('../config/db');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and identity endpoints
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required: [email, password, name]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           minLength: 8
 *           example: StrongPassword123!
 *         name:
 *           type: string
 *           example: Jane Doe
 *         role:
 *           type: string
 *           enum: [admin, instructor, learner]
 *           example: learner
 *     LoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           example: StrongPassword123!
 *     AuthUser:
 *       type: object
 *       description: Authenticated user profile (public fields only)
 *       properties:
 *         id:
 *           type: integer
 *           format: int32
 *           description: Relational primary key (auto-increment integer)
 *           example: 123
 *         email:
 *           type: string
 *           format: email
 *         name:
 *           type: string
 *         role:
 *           type: string
 *           enum: [admin, instructor, learner]
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT access token
 *         user:
 *           $ref: '#/components/schemas/AuthUser'
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a user, hashing their password with bcrypt. Role defaults to learner.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error or email already in use
 */
const ALLOWED_ROLES = ['admin', 'instructor', 'learner', 'manager'];

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, professionalTitle, age, country, phoneNumber } = req.body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid email is required' });
    }
    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // All new users default to 'learner' role with 'pending' status - admin will assign role upon approval
    const normalizedRole = 'learner';

    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const userRepo = ds.getRepository('User');
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await userRepo.findOne({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // bcrypt default 10 salt rounds is OK; use 12 for a bit stronger without being excessive.
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with pending status - requires admin approval
    // Handle case where status/professionalTitle columns don't exist yet (backward compatibility)
    const { PROFESSIONAL_TITLES } = require('../entities/User');
    const normalizedTitle = professionalTitle && PROFESSIONAL_TITLES.includes(professionalTitle) ? professionalTitle : 'Fullstack Developer';
    const userData = {
      email: normalizedEmail,
      passwordHash,
      name: name.trim(),
      role: normalizedRole,
      professionalTitle: normalizedTitle,
      authProvider: 'LOCAL',
      isInternal: false,
    };

    // Add optional profile fields if provided
    if (age !== undefined && age !== null && typeof age === 'number' && age > 0 && age < 150) {
      userData.age = Math.floor(age);
    }
    if (country && typeof country === 'string' && country.trim().length > 0) {
      userData.country = country.trim();
    }
    if (phoneNumber && typeof phoneNumber === 'string' && phoneNumber.trim().length > 0) {
      userData.phoneNumber = phoneNumber.trim();
    }
    
    // Try to add status field, but don't fail if column doesn't exist
    try {
      userData.status = 'pending';
    } catch (e) {
      // Status column doesn't exist - will be added via migration
    }
    
    const created = userRepo.create(userData);
    let user;
    try {
      user = await userRepo.save(created);
    } catch (saveErr) {
      // If status or professionalTitle column doesn't exist, try saving without it
      const msg = saveErr && saveErr.message ? String(saveErr.message) : '';
      if (msg.includes('Unknown column') || msg.includes('status') || msg.includes('professionalTitle') || msg.includes('authProvider') || msg.includes('isInternal') || saveErr.code === 'ER_BAD_FIELD_ERROR') {
        delete userData.status;
        delete userData.professionalTitle;
        delete userData.authProvider;
        delete userData.isInternal;
        const createdWithout = userRepo.create(userData);
        user = await userRepo.save(createdWithout);
        // Set these on the object for response, even if DB columns don't exist
        if (user) {
          user.status = 'pending';
          user.professionalTitle = normalizedTitle;
        }
      } else {
        throw saveErr;
      }
    }

    // Validate user was created successfully
    if (!user || !user.id) {
      console.error('Register failed: User save returned invalid user object');
      return res.status(500).json({
        message: 'Failed to create user account. Please try again.',
      });
    }

    // Don't return token for pending accounts - they need admin approval first
    // Ensure status and professionalTitle are always set, even if columns don't exist
    const userStatus = user.status || 'pending';
    const userProfessionalTitle = user.professionalTitle ?? normalizedTitle;
    
    return res.status(201).json({
      message: 'Account created successfully. Please wait for admin approval.',
      user: { 
        id: String(user.id), 
        email: user.email || normalizedEmail, 
        name: user.name || name.trim(), 
        role: user.role || normalizedRole, 
        status: userStatus, 
        professionalTitle: userProfessionalTitle 
      },
      requiresApproval: true,
    });
  } catch (err) {
    // Handle MySQL unique constraint errors (e.g., ER_DUP_ENTRY)
    if (err && (err.code === 'ER_DUP_ENTRY' || err.errno === 1062)) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    // JWT not configured - return 503 so frontend can show a clear message
    if (err && err.code === 'JWT_SECRET_MISSING') {
      console.error('Register failed: JWT_SECRET is not set in .env');
      return res.status(503).json({
        message: 'Server configuration error. Please try again later or contact support.',
      });
    }
    const msg = err && err.message ? String(err.message) : '';
    const code = err && err.code;

    // Connection errors (MySQL not running or unreachable)
    if (code === 'ETIMEDOUT' || code === 'ECONNREFUSED' || code === 'ER_NET_READ_INTERRUPTED') {
      console.error('Register failed: Database connection error.', err.message);
      return res.status(503).json({
        message:
          'Database not available. Start MySQL and check .env (DB_HOST=localhost, DB_SSL=false for local). Then run: npm run db:migrate',
      });
    }

    // Database schema mismatch (e.g. migrations not run, table/columns missing)
    if (
      err &&
      (msg.includes('Unknown column') ||
        msg.includes('ER_NO_SUCH_TABLE') ||
        code === 'ER_BAD_FIELD_ERROR')
    ) {
      console.error('Register failed: Database schema error. Run: npm run db:migrate', err.message);
      return res.status(503).json({
        message:
          'Database setup is incomplete. Run migrations from the backend folder: cd version_1/lms_backend && npm run db:migrate. If that times out, start MySQL and set DB_HOST=localhost and DB_SSL=false in .env.',
      });
    }

    console.error('Register error:', {
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage,
      stack: err.stack,
    });
    return next(err);
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid email is required' });
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Password is required' });
    }

    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const userRepo = ds.getRepository('User');
    const normalizedEmail = email.trim().toLowerCase();

    // Need passwordHash, status, authProvider for verification
    // Try to get status, professionalTitle, authProvider; handle missing columns (backward compatibility)
    let user;
    try {
      user = await userRepo.findOne({
        where: { email: normalizedEmail },
        select: { id: true, email: true, name: true, role: true, passwordHash: true, status: true, professionalTitle: true, authProvider: true },
      });
    } catch (dbErr) {
      const msg = dbErr && dbErr.message ? String(dbErr.message) : '';
      if (msg.includes('Unknown column') || msg.includes('status') || msg.includes('professionalTitle') || msg.includes('authProvider') || dbErr.code === 'ER_BAD_FIELD_ERROR') {
        user = await userRepo.findOne({
          where: { email: normalizedEmail },
          select: { id: true, email: true, name: true, role: true, passwordHash: true },
        });
        if (user) {
          user.status = 'active';
          user.professionalTitle = null;
          user.authProvider = 'LOCAL';
        }
      } else {
        throw dbErr;
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Azure users must sign in with Microsoft, not password
    const authProvider = user.authProvider || 'LOCAL';
    if (authProvider === 'AZURE') {
      return res.status(403).json({ message: 'Please sign in with Microsoft.' });
    }

    // Check account status (default to 'active' if status field doesn't exist)
    const userStatus = user.status || 'active';

    // Check if account is revoked
    if (userStatus === 'revoked') {
      return res.status(403).json({ message: 'Your account has been revoked. Please contact an administrator.' });
    }

    // Check if account is pending approval
    if (userStatus === 'pending') {
      return res.status(403).json({ message: 'Your account is pending admin approval. Please wait for approval before logging in.' });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update user's updatedAt to track login activity
    await userRepo.update({ id: user.id }, { updatedAt: new Date() });

    const token = signAccessToken({
      sub: String(user.id),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const professionalTitle = user.professionalTitle ?? 'Fullstack Developer';
    return res.status(200).json({
      token,
      user: { id: String(user.id), email: user.email, name: user.name, role: user.role, professionalTitle },
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * @swagger
 * /auth/profile:
 *   patch:
 *     summary: Update current user profile (name, professional title)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               professionalTitle: { type: string, enum: [Associate Fullstack Developer, Fullstack Developer, Senior Fullstack Developer] }
 *     responses:
 *       200: { description: Updated user }
 *       400: { description: Invalid input }
 *       401: { description: Unauthorized }
 */
const { PROFESSIONAL_TITLES } = require('../entities/User');
router.patch('/profile', authMiddleware, async (req, res, next) => {
  try {
    const { name, professionalTitle } = req.body || {};
    const updates = {};
    if (typeof name === 'string' && name.trim().length > 0) {
      updates.name = name.trim();
    }
    if (professionalTitle && PROFESSIONAL_TITLES.includes(professionalTitle)) {
      updates.professionalTitle = professionalTitle;
    }
    if (Object.keys(updates).length === 0) {
      return res.status(200).json({ user: req.user });
    }
    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }
    const userRepo = ds.getRepository('User');
    const userId = Number(req.user.id);
    try {
      await userRepo.update({ id: userId }, updates);
    } catch (upErr) {
      const msg = upErr && upErr.message ? String(upErr.message) : '';
      if (msg.includes('Unknown column') || msg.includes('professionalTitle') || upErr.code === 'ER_BAD_FIELD_ERROR') {
        if (updates.professionalTitle) delete updates.professionalTitle;
        if (Object.keys(updates).length > 0) await userRepo.update({ id: userId }, updates);
      } else {
        throw upErr;
      }
    }
    const user = await userRepo.findOne({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, professionalTitle: true },
    }).catch(() => ({ ...req.user, professionalTitle: updates.professionalTitle ?? req.user.professionalTitle }));
    const out = user || req.user;
    return res.status(200).json({
      user: {
        id: String(out.id),
        email: out.email,
        name: out.name,
        role: out.role,
        professionalTitle: out.professionalTitle ?? 'Fullstack Developer',
      },
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/AuthUser'
 *       401:
 *         description: Missing or invalid token
 */
router.get('/me', authMiddleware, async (req, res) => {
  return res.status(200).json({ user: req.user });
});

/**
 * Find or create user for Azure AD sign-in (called by NextAuth signIn callback).
 * Body: { email, name, azureId }.
 * If user exists by email, returns them (and optionally updates azureId/name if provided).
 * If not, creates with auth_provider AZURE, is_internal true, role PENDING.
 */
router.post('/azure/find-or-create', async (req, res, next) => {
  try {
    const { email, name, azureId } = req.body || {};
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const userRepo = ds.getRepository('User');
    const normalizedEmail = email.trim().toLowerCase();
    const displayName = (name && typeof name === 'string' && name.trim()) ? name.trim() : normalizedEmail;

    let user = await userRepo.findOne({
      where: { email: normalizedEmail },
      select: { id: true, email: true, name: true, role: true, isInternal: true, authProvider: true, azureId: true, status: true },
    });

    if (user) {
      // Existing LMS user: return so they can go straight to their dashboard
      const updates = {};
      if (azureId && typeof azureId === 'string' && azureId.trim() && !user.azureId) {
        updates.azureId = azureId.trim();
      }
      if (displayName && displayName !== user.name) {
        updates.name = displayName;
      }
      if (Object.keys(updates).length > 0) {
        try {
          await userRepo.update({ id: user.id }, updates);
          user = await userRepo.findOne({
            where: { id: user.id },
            select: { id: true, email: true, name: true, role: true, isInternal: true, authProvider: true, azureId: true, status: true },
          }) || user;
        } catch (e) {
          // Non-fatal
        }
      }
      const role = user.role || 'PENDING';
      const isInternal = user.isInternal != null ? !!user.isInternal : true;
      const status = user.status || 'active';

      // Track login activity (best-effort)
      try {
        await userRepo.update({ id: user.id }, { updatedAt: new Date() });
      } catch (_) {
        // ignore
      }

      // Issue backend JWT only for active, approved accounts.
      // Pending/revoked accounts can still sign into NextAuth to see the pending/revoked page,
      // but should not receive an API token.
      const roleUpper = String(role).toUpperCase();
      const shouldIssueToken = status === 'active' && roleUpper !== 'PENDING';
      const token = shouldIssueToken
        ? signAccessToken({
            sub: String(user.id),
            email: user.email,
            role: user.role,
            name: user.name,
          })
        : undefined;

      return res.status(200).json({
        token,
        user: {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role,
          isInternal,
          status,
        },
      });
    }

    // New account: create with status pending so admin can assign role and grant access
    const newUserData = {
      email: normalizedEmail,
      name: displayName,
      authProvider: 'AZURE',
      isInternal: true,
      role: 'PENDING',
      passwordHash: null,
      status: 'pending',
      azureId: (azureId && typeof azureId === 'string' && azureId.trim()) ? azureId.trim() : null,
    };
    const created = userRepo.create(newUserData);
    const saved = await userRepo.save(created);
    return res.status(201).json({
      user: {
        id: String(saved.id),
        email: saved.email,
        name: saved.name,
        role: 'PENDING',
        isInternal: true,
        status: 'pending',
      },
    });
  } catch (err) {
    if (err && (err.code === 'ER_DUP_ENTRY' || err.errno === 1062)) {
      // Race: another request created the user; fetch and return
      const { email } = req.body || {};
      if (email) {
        const ds = getDataSource();
        const userRepo = ds.getRepository('User');
        const u = await userRepo.findOne({
          where: { email: email.trim().toLowerCase() },
          select: { id: true, email: true, name: true, role: true, isInternal: true, status: true },
        });
        if (u) {
          const roleUpper = String(u.role || 'PENDING').toUpperCase();
          const status = u.status || 'active';
          const shouldIssueToken = status === 'active' && roleUpper !== 'PENDING';
          const token = shouldIssueToken
            ? signAccessToken({
                sub: String(u.id),
                email: u.email,
                role: u.role,
                name: u.name,
              })
            : undefined;
          return res.status(200).json({
            token,
            user: {
              id: String(u.id),
              email: u.email,
              name: u.name,
              role: u.role || 'PENDING',
              isInternal: u.isInternal != null ? !!u.isInternal : true,
              status,
            },
          });
        }
      }
    }
    return next(err);
  }
});

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Generates a password reset token for the user's email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset token generated (in production, this would be sent via email)
 *       404:
 *         description: User not found
 */
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const userRepo = ds.getRepository('User');
    const normalizedEmail = email.trim().toLowerCase();

    const user = await userRepo.findOne({
      where: { email: normalizedEmail },
      select: { id: true, email: true },
    });

    // Don't reveal if email exists or not (security best practice)
    // Always return success message
    if (!user) {
      return res.status(200).json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    
    // Token expires in 1 hour
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);

    // Update user with reset token
    try {
      await userRepo.update(
        { id: user.id },
        {
          passwordResetToken: resetTokenHash,
          passwordResetExpires: resetExpires,
        }
      );
    } catch (updateErr) {
      const msg = updateErr && updateErr.message ? String(updateErr.message) : '';
      if (msg.includes('Unknown column') || msg.includes('passwordResetToken') || updateErr.code === 'ER_BAD_FIELD_ERROR') {
        // Migration not run yet - return helpful error
        return res.status(503).json({
          message: 'Password reset feature not available. Please run migrations: npm run db:migrate',
        });
      }
      throw updateErr;
    }

    // In production, send email with reset link containing the token
    // For now, return token in response (development only)
    // TODO: Replace with email sending service
    return res.status(200).json({
      message: 'If an account with that email exists, a password reset link has been sent.',
      // Development only - remove in production
      resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
      resetExpires: process.env.NODE_ENV !== 'production' ? resetExpires : undefined,
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     description: Resets user password using the reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token or password
 *       404:
 *         description: Invalid or expired token
 */
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body || {};

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Reset token is required' });
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const userRepo = ds.getRepository('User');

    // Find user with matching reset token
    let users;
    try {
      users = await userRepo.find({
        select: { id: true, email: true, passwordResetToken: true, passwordResetExpires: true },
      });
    } catch (findErr) {
      const msg = findErr && findErr.message ? String(findErr.message) : '';
      if (msg.includes('Unknown column') || msg.includes('passwordResetToken') || findErr.code === 'ER_BAD_FIELD_ERROR') {
        return res.status(503).json({
          message: 'Password reset feature not available. Please run migrations: npm run db:migrate',
        });
      }
      throw findErr;
    }

    // Find user with matching token (compare hashed)
    let user = null;
    for (const u of users) {
      if (u.passwordResetToken && u.passwordResetExpires) {
        const isValid = await bcrypt.compare(token, u.passwordResetToken);
        if (isValid && new Date(u.passwordResetExpires) > new Date()) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update password and clear reset token
    await userRepo.update(
      { id: user.id },
      {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      }
    );

    return res.status(200).json({
      message: 'Password reset successful. You can now log in with your new password.',
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
