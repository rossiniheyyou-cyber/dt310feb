const express = require('express');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const { getDataSource } = require('../config/db');

const router = express.Router();

/**
 * Get all users (admin only)
 * GET /users?status=pending&role=learner&search=email
 */
router.get('/', auth, rbac(['admin']), async (req, res, next) => {
  try {
    const { status, role, search } = req.query;
    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const userRepo = ds.getRepository('User');
    const qb = userRepo.createQueryBuilder('user');

    // Only filter by status if column exists (will be handled by try-catch below)
    if (status) {
      qb.andWhere('user.status = :status', { status });
    }
    if (role) {
      qb.andWhere('user.role = :role', { role });
    }
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchTerm = `%${search.trim()}%`;
      qb.andWhere('(user.email LIKE :search OR user.name LIKE :search)', { search: searchTerm });
    }

    let users;
    try {
      users = await qb
        .select(['user.id', 'user.email', 'user.name', 'user.role', 'user.status', 'user.createdAt'])
        .orderBy('user.createdAt', 'DESC')
        .getMany();
    } catch (err) {
      // If status column doesn't exist, fetch without it
      const msg = err && err.message ? String(err.message) : '';
      if (msg.includes('Unknown column') || msg.includes('status') || err.code === 'ER_BAD_FIELD_ERROR') {
        users = await qb
          .select(['user.id', 'user.email', 'user.name', 'user.role', 'user.createdAt'])
          .orderBy('user.createdAt', 'DESC')
          .getMany();
        // Set default status for existing users
        users = users.map(u => ({ ...u, status: 'active' }));
      } else {
        throw err;
      }
    }

    return res.status(200).json({ users: users.map(u => ({ id: String(u.id), email: u.email, name: u.name, role: u.role, status: u.status || 'active', createdAt: u.createdAt })) });
  } catch (err) {
    return next(err);
  }
});

/**
 * Get pending account requests (admin only)
 * GET /users/requests
 */
router.get('/requests', auth, rbac(['admin']), async (req, res, next) => {
  try {
    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const userRepo = ds.getRepository('User');
    let pendingUsers;
    try {
      pendingUsers = await userRepo
        .createQueryBuilder('user')
        .select(['user.id', 'user.email', 'user.name', 'user.role', 'user.createdAt'])
        .where('user.status = :status', { status: 'pending' })
        .orderBy('user.createdAt', 'DESC')
        .getMany();
    } catch (err) {
      const msg = err && err.message ? String(err.message) : '';
      const code = err && err.code;
      if (msg.includes('Unknown column') || msg.includes('status') || code === 'ER_BAD_FIELD_ERROR') {
        pendingUsers = [];
      } else if (code === 'ETIMEDOUT' || code === 'ECONNREFUSED' || code === 'ER_NET_READ_INTERRUPTED') {
        return res.status(503).json({ message: 'Database not available. Check MySQL connection and try again.' });
      } else {
        throw err;
      }
    }

    const requests = pendingUsers.map((u) => ({
      id: String(u.id),
      email: u.email || '',
      name: u.name || '',
      role: u.role || 'learner',
      createdAt: u.createdAt,
    }));
    return res.status(200).json({ requests });
  } catch (err) {
    return next(err);
  }
});

/**
 * Approve account request (admin only)
 * POST /users/:userId/approve
 * Body: { role: 'learner' | 'instructor' | 'manager' | 'admin' }
 */
router.post('/:userId/approve', auth, rbac(['admin']), async (req, res, next) => {
  try {
    const userId = Number.parseInt(String(req.params.userId || ''), 10);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const { role } = req.body || {};
    if (!role || !['admin', 'instructor', 'learner', 'manager'].includes(role)) {
      return res.status(400).json({ message: 'Valid role is required (learner, instructor, manager, or admin)' });
    }

    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const userRepo = ds.getRepository('User');
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check status (handle case where column doesn't exist)
    const userStatus = user.status || 'active';
    if (userStatus !== 'pending') {
      return res.status(400).json({ message: 'User is not pending approval' });
    }

    try {
      await userRepo.update({ id: userId }, { status: 'active', role });
    } catch (err) {
      // If status column doesn't exist, return error asking for migration
      const msg = err && err.message ? String(err.message) : '';
      if (msg.includes('Unknown column') || msg.includes('status') || err.code === 'ER_BAD_FIELD_ERROR') {
        return res.status(503).json({ 
          message: 'Database migration required. Please add status column to users table.' 
        });
      }
      throw err;
    }

    const updatedUser = await userRepo.findOne({ where: { id: userId } });
    return res.status(200).json({ 
      message: 'Account approved successfully', 
      user: { 
        id: String(updatedUser.id), 
        email: updatedUser.email, 
        name: updatedUser.name, 
        role: updatedUser.role 
      } 
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * Reject account request (admin only)
 * POST /users/:userId/reject
 */
router.post('/:userId/reject', auth, rbac(['admin']), async (req, res, next) => {
  try {
    const userId = Number.parseInt(String(req.params.userId || ''), 10);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const { reason } = req.body || {};

    if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
      return res.status(400).json({ message: 'Reason is required and must be at least 10 characters' });
    }

    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const userRepo = ds.getRepository('User');
    const notificationRepo = ds.getRepository('Notification');
    
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create notification before deleting (if user was active, they'll see it on next login attempt)
    if (user.status === 'active') {
      await notificationRepo.save(notificationRepo.create({
        userId: user.id,
        type: 'user_removed',
        title: 'Account Removed',
        message: 'Your account has been removed from the platform.',
        reason: reason.trim(),
        isRead: false,
      }));
    }

    // Delete the user (rejection means removing the account)
    await userRepo.remove(user);

    return res.status(200).json({ message: 'Account request rejected and removed' });
  } catch (err) {
    return next(err);
  }
});

/**
 * Revoke user account (admin only)
 * POST /users/:userId/revoke
 */
router.post('/:userId/revoke', auth, rbac(['admin']), async (req, res, next) => {
  try {
    const userId = Number.parseInt(String(req.params.userId || ''), 10);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const { reason } = req.body || {};

    if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
      return res.status(400).json({ message: 'Reason is required and must be at least 10 characters' });
    }

    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const userRepo = ds.getRepository('User');
    const notificationRepo = ds.getRepository('Notification');
    
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    try {
      await userRepo.update({ id: userId }, { status: 'revoked' });
    } catch (err) {
      // If status column doesn't exist, return error asking for migration
      const msg = err && err.message ? String(err.message) : '';
      if (msg.includes('Unknown column') || msg.includes('status') || err.code === 'ER_BAD_FIELD_ERROR') {
        return res.status(503).json({ 
          message: 'Database migration required. Please add status column to users table.' 
        });
      }
      throw err;
    }

    // Create notification for user
    await notificationRepo.save(notificationRepo.create({
      userId: user.id,
      type: 'user_revoked',
      title: 'Account Revoked',
      message: 'Your account has been revoked. Please contact an administrator for more information.',
      reason: reason.trim(),
      isRead: false,
    }));

    return res.status(200).json({ message: 'Account revoked successfully' });
  } catch (err) {
    return next(err);
  }
});

/**
 * Update user (admin only)
 * PATCH /users/:userId
 */
router.patch('/:userId', auth, rbac(['admin']), async (req, res, next) => {
  try {
    const userId = Number.parseInt(String(req.params.userId || ''), 10);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const { email, name, role, status, professionalTitle } = req.body || {};
    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const userRepo = ds.getRepository('User');
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateData = {};
    if (email && typeof email === 'string' && email.includes('@')) {
      const normalizedEmail = email.trim().toLowerCase();
      // Check if email is already taken by another user
      const existing = await userRepo.findOne({ where: { email: normalizedEmail } });
      if (existing && existing.id !== userId) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      updateData.email = normalizedEmail;
    }
    if (name && typeof name === 'string' && name.trim().length > 0) {
      updateData.name = name.trim();
    }
    if (role && ['admin', 'instructor', 'learner', 'manager'].includes(role)) {
      updateData.role = role;
    }
    if (status && ['pending', 'active', 'revoked'].includes(status)) {
      updateData.status = status;
    }
    const { PROFESSIONAL_TITLES } = require('../entities/User');
    if (professionalTitle && PROFESSIONAL_TITLES.includes(professionalTitle)) {
      updateData.professionalTitle = professionalTitle;
    }

    try {
      await userRepo.update({ id: userId }, updateData);
    } catch (err) {
      // If status or professionalTitle column doesn't exist, try without it
      const msg = err && err.message ? String(err.message) : '';
      if ((msg.includes('Unknown column') || msg.includes('status') || msg.includes('professionalTitle') || err.code === 'ER_BAD_FIELD_ERROR')) {
        if (updateData.status) delete updateData.status;
        if (updateData.professionalTitle) delete updateData.professionalTitle;
        if (Object.keys(updateData).length > 0) {
          await userRepo.update({ id: userId }, updateData);
        }
      } else {
        throw err;
      }
    }
    const updated = await userRepo.findOne({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, status: true, professionalTitle: true },
    }).catch(() => null);
    const u = updated || (await userRepo.findOne({ where: { id: userId } }));
    const out = {
      id: String(u.id),
      email: u.email,
      name: u.name,
      role: u.role,
      status: u.status,
      professionalTitle: u.professionalTitle ?? undefined,
    };

    return res.status(200).json({ message: 'User updated successfully', user: out });
  } catch (err) {
    return next(err);
  }
});

/**
 * Get user by ID (admin only, or own profile)
 * GET /users/:userId
 */
router.get('/:userId', auth, async (req, res, next) => {
  try {
    const userId = Number.parseInt(String(req.params.userId || ''), 10);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
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
        select: { id: true, email: true, name: true, role: true, status: true, createdAt: true },
      });
    } catch (err) {
      // If status column doesn't exist, fetch without it
      const msg = err && err.message ? String(err.message) : '';
      if (msg.includes('Unknown column') || msg.includes('status') || err.code === 'ER_BAD_FIELD_ERROR') {
        user = await userRepo.findOne({
          where: { id: userId },
          select: { id: true, email: true, name: true, role: true, createdAt: true },
        });
        if (user) {
          user.status = 'active'; // Default for existing users
        }
      } else {
        throw err;
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Allow access if admin or viewing own profile
    const isAdmin = req.user?.role === 'admin';
    const isOwnProfile = String(req.user?.id) === String(userId);

    // Special case: admin emails can access all accounts
    // Check if user's email contains '@digitalt3.com' and 'admin' (case-insensitive)
    const adminEmail = req.user?.email?.toLowerCase() || '';
    const isAdminEmail = adminEmail.includes('@digitalt3.com') && adminEmail.includes('admin');

    if (!isAdmin && !isOwnProfile && !isAdminEmail) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    return res.status(200).json({ user: { id: String(user.id), email: user.email, name: user.name, role: user.role, status: user.status, professionalTitle: user.professionalTitle ?? undefined, createdAt: user.createdAt } });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
