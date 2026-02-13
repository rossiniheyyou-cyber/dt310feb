const express = require('express');
const auth = require('../middleware/auth');
const { getDataSource } = require('../config/db');

const router = express.Router();

/**
 * Get user's notifications
 * GET /notifications?unreadOnly=true
 */
router.get('/', auth, async (req, res, next) => {
  try {
    const unreadOnly = req.query.unreadOnly === 'true';
    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const notificationRepo = ds.getRepository('Notification');
    const where = { userId: Number(req.user.id) };
    if (unreadOnly) {
      where.isRead = false;
    }

    const notifications = await notificationRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: 100,
    });

    return res.status(200).json({
      notifications: notifications.map(n => ({
        id: String(n.id),
        type: n.type,
        title: n.title,
        message: n.message,
        reason: n.reason,
        metadata: n.metadata,
        isRead: n.isRead,
        createdAt: n.createdAt,
        readAt: n.readAt,
      })),
      unreadCount: notifications.filter(n => !n.isRead).length,
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * Mark notification as read
 * PATCH /notifications/:notificationId/read
 */
router.patch('/:notificationId/read', auth, async (req, res, next) => {
  try {
    const notificationId = Number.parseInt(String(req.params.notificationId || ''), 10);
    if (!Number.isFinite(notificationId)) {
      return res.status(400).json({ message: 'Invalid notification ID' });
    }

    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const notificationRepo = ds.getRepository('Notification');
    const notification = await notificationRepo.findOne({
      where: { id: notificationId, userId: Number(req.user.id) },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notificationRepo.update(
      { id: notificationId },
      { isRead: true, readAt: new Date() }
    );

    return res.status(200).json({ message: 'Notification marked as read' });
  } catch (err) {
    return next(err);
  }
});

/**
 * Mark all notifications as read
 * PATCH /notifications/read-all
 */
router.patch('/read-all', auth, async (req, res, next) => {
  try {
    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const notificationRepo = ds.getRepository('Notification');
    await notificationRepo.update(
      { userId: Number(req.user.id), isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return res.status(200).json({ message: 'All notifications marked as read' });
  } catch (err) {
    return next(err);
  }
});

/**
 * Create notification (admin only, or system)
 * POST /notifications
 */
router.post('/', auth, async (req, res, next) => {
  try {
    const { userId, type, title, message, reason, metadata } = req.body || {};

    // Only admins can create notifications for other users, or users can create for themselves
    const targetUserId = Number(userId);
    const isAdmin = req.user.role === 'admin';
    const isSelf = targetUserId === Number(req.user.id);

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    if (!targetUserId || !type || !title || !message) {
      return res.status(400).json({ message: 'userId, type, title, and message are required' });
    }

    const ds = getDataSource();
    if (!ds || !ds.isInitialized) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const notificationRepo = ds.getRepository('Notification');
    const notification = notificationRepo.create({
      userId: targetUserId,
      type,
      title,
      message,
      reason: reason || null,
      metadata: metadata || null,
      isRead: false,
    });

    await notificationRepo.save(notification);

    return res.status(201).json({
      notification: {
        id: String(notification.id),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        reason: notification.reason,
        createdAt: notification.createdAt,
      },
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
