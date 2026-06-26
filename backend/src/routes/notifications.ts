import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export const notificationsRouter = Router();

// GET /api/notifications - Get user notifications with unread count
notificationsRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Latest 50 notifications
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user!.id, read: false },
    });

    res.json({
      success: true,
      data: {
        notifications,
        unread: unreadCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read - Mark notification as read
notificationsRouter.patch('/:id/read', requireAuth, async (req: AuthRequest, res) => {
  try {
    const updated = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { read: true },
    });

    if (updated.count === 0) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update notification' });
  }
});

// DELETE /api/notifications/:id - Delete notification
notificationsRouter.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const deleted = await prisma.notification.deleteMany({
      where: { id: req.params.id, userId: req.user!.id },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete notification' });
  }
});
