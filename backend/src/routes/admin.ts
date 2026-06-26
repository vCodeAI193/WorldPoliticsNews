import express from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logger } from '../lib/logger';

export const adminRouter = express.Router();

// Middleware: Check if user is admin
async function checkAdmin(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const adminProfile = await prisma.admin.findUnique({
    where: { userId: req.user.id },
  });

  if (!adminProfile) {
    return res.status(403).json({ success: false, error: 'Forbidden: Admin access required' });
  }

  req.admin = adminProfile;
  next();
}

// Apply auth middleware to all routes
adminRouter.use(authMiddleware);
adminRouter.use(checkAdmin);

// GET /api/admin/stats - Analytics
adminRouter.get('/stats', async (_req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalAnalyses = await prisma.analysis.count();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const analysesToday = await prisma.analysisHistory.count({
      where: {
        generatedAt: {
          gte: today,
        },
      },
    });

    const blockedCount = await prisma.blockedEntity.count();

    res.json({
      success: true,
      data: {
        totalUsers,
        totalAnalyses,
        analysesToday,
        blockedCount,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching admin stats');
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// GET /api/admin/blocked - List blocked entities
adminRouter.get('/blocked', async (_req, res) => {
  try {
    const blocked = await prisma.blockedEntity.findMany({
      orderBy: { blockedAt: 'desc' },
      take: 50,
    });

    res.json({
      success: true,
      data: blocked,
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching blocked entities');
    res.status(500).json({ success: false, error: 'Failed to fetch blocked entities' });
  }
});

// GET /api/admin/entities - List flagged/blocked entities
adminRouter.get('/entities', async (_req, res) => {
  try {
    // Return trending entities with high engagement
    const entities = await prisma.analysis.findMany({
      orderBy: { generatedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        entityId: true,
        entityName: true,
        entityType: true,
        entityCountry: true,
        sentiment: true,
        sentimentLabel: true,
      },
    });

    res.json({
      success: true,
      data: entities,
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching entities');
    res.status(500).json({ success: false, error: 'Failed to fetch entities' });
  }
});

// POST /api/admin/entities/:id/block - Block an entity
adminRouter.post('/entities/:id/block', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { reason, entityType } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Check if entity is already blocked
    const existing = await prisma.blockedEntity.findFirst({
      where: {
        entityId: id,
        entityType: entityType || 'politician',
      },
    });

    if (existing) {
      return res.status(400).json({ success: false, error: 'Entity already blocked' });
    }

    // Create blocked entity
    const blocked = await prisma.blockedEntity.create({
      data: {
        entityId: id,
        entityType: entityType || 'politician',
        reason: reason || 'No reason provided',
        blockedBy: req.user.id,
      },
    });

    logger.info({ entityId: id, blockedBy: req.user.id, reason }, 'Entity blocked');

    res.json({
      success: true,
      message: 'Entity blocked successfully',
      data: blocked,
    });
  } catch (error) {
    logger.error({ error }, 'Error blocking entity');
    res.status(500).json({ success: false, error: 'Failed to block entity' });
  }
});

// DELETE /api/admin/entities/:id/block - Unblock an entity
adminRouter.delete('/entities/:id/block', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { entityType } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Delete blocked entity
    await prisma.blockedEntity.delete({
      where: {
        entityId_entityType: {
          entityId: id,
          entityType: entityType || 'politician',
        },
      },
    });

    logger.info({ entityId: id, unblockedBy: req.user.id }, 'Entity unblocked');

    res.json({
      success: true,
      message: 'Entity unblocked successfully',
    });
  } catch (error) {
    logger.error({ error }, 'Error unblocking entity');
    res.status(500).json({ success: false, error: 'Failed to unblock entity' });
  }
});

// GET /api/admin/errors - Recent errors from logs
adminRouter.get('/errors', async (_req, res) => {
  try {
    // Future: Implement centralized error logging
    // For now, return mock data
    const recentErrors = [
      {
        id: '1',
        message: 'Rate limit exceeded',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        count: 3,
      },
      {
        id: '2',
        message: 'Database connection timeout',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        count: 1,
      },
    ];

    res.json({
      success: true,
      data: recentErrors,
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching errors');
    res.status(500).json({ success: false, error: 'Failed to fetch errors' });
  }
});
