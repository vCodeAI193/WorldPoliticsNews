import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export const comparisonsRouter = Router();

const createComparisonSchema = z.object({
  entityIds: z.array(z.string().min(1).max(64).regex(/^[\w\-]+$/)).min(2).max(4),
  entityNames: z.array(z.string().min(1).max(256)).min(2).max(4),
  entityTypes: z.array(z.enum(['politician', 'party'])).min(2).max(4),
  title: z.string().max(256).optional(),
});

// GET /api/comparisons - List user's saved comparisons
comparisonsRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const comparisons = await prisma.comparisonHistory.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Parse JSON fields for response
    const formatted = comparisons.map((c) => ({
      id: c.id,
      entityIds: Array.isArray(c.entityIds) ? c.entityIds : JSON.parse(c.entityIds as any),
      entityNames: Array.isArray(c.entityNames) ? c.entityNames : JSON.parse(c.entityNames as any),
      entityTypes: Array.isArray(c.entityTypes) ? c.entityTypes : JSON.parse(c.entityTypes as any),
      title: c.title,
      createdAt: c.createdAt,
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch comparisons' });
  }
});

// POST /api/comparisons - Save new comparison
comparisonsRouter.post('/', requireAuth, async (req: AuthRequest, res) => {
  const result = createComparisonSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: 'Invalid input' });
  }

  try {
    // Check that arrays match in length
    const { entityIds, entityNames, entityTypes, title } = result.data;
    if (entityIds.length !== entityNames.length || entityIds.length !== entityTypes.length) {
      return res.status(400).json({ success: false, error: 'Array lengths must match' });
    }

    const comparison = await prisma.comparisonHistory.create({
      data: {
        userId: req.user!.id,
        entityIds,
        entityNames,
        entityTypes,
        title,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: comparison.id,
        entityIds: Array.isArray(comparison.entityIds) ? comparison.entityIds : JSON.parse(comparison.entityIds as any),
        entityNames: Array.isArray(comparison.entityNames) ? comparison.entityNames : JSON.parse(comparison.entityNames as any),
        entityTypes: Array.isArray(comparison.entityTypes) ? comparison.entityTypes : JSON.parse(comparison.entityTypes as any),
        title: comparison.title,
        createdAt: comparison.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save comparison' });
  }
});

// DELETE /api/comparisons/:id - Delete comparison
comparisonsRouter.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const deleted = await prisma.comparisonHistory.deleteMany({
      where: { id: req.params.id, userId: req.user!.id },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ success: false, error: 'Comparison not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete comparison' });
  }
});
