import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export const newsletterRouter = Router();

const frequencySchema = z.enum(['weekly', 'daily', 'never']);

// GET /api/newsletter/preferences - Get user newsletter preferences
newsletterRouter.get('/preferences', requireAuth, async (req: AuthRequest, res) => {
  try {
    let subscription = await prisma.newsletterSubscription.findUnique({
      where: { userId: req.user!.id },
    });

    if (!subscription) {
      // Create default subscription for new users
      subscription = await prisma.newsletterSubscription.create({
        data: { userId: req.user!.id },
      });
    }

    res.json({
      success: true,
      data: {
        subscribed: subscription.subscribed,
        frequency: subscription.frequency,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch newsletter preferences' });
  }
});

// PUT /api/newsletter/preferences - Update user newsletter preferences
newsletterRouter.put('/preferences', requireAuth, async (req: AuthRequest, res) => {
  const schema = z.object({
    subscribed: z.boolean().optional(),
    frequency: frequencySchema.optional(),
  });

  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: 'Invalid input' });
  }

  try {
    const subscription = await prisma.newsletterSubscription.upsert({
      where: { userId: req.user!.id },
      create: {
        userId: req.user!.id,
        subscribed: result.data.subscribed ?? true,
        frequency: result.data.frequency ?? 'weekly',
      },
      update: {
        subscribed: result.data.subscribed,
        frequency: result.data.frequency,
      },
    });

    res.json({
      success: true,
      data: {
        subscribed: subscription.subscribed,
        frequency: subscription.frequency,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update newsletter preferences' });
  }
});
