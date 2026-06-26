import { Router, Request, Response } from 'express';
import express from 'express';
import { handleStripeWebhook } from '../services/stripeService';
import { prisma } from '../lib/prisma';

export const webhooksRouter = Router();

webhooksRouter.post('/stripe', async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    return res.status(400).json({ success: false, error: 'Keine Stripe-Signatur' });
  }

  try {
    await handleStripeWebhook(req.body as Buffer, signature);
    res.json({ success: true, data: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook-Verarbeitung fehlgeschlagen';
    console.error('Stripe webhook error:', message);
    res.status(400).json({ success: false, error: message });
  }
});

webhooksRouter.post('/revenuecat', express.json(), async (req, res) => {
  const authHeader = req.headers.authorization;
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET;

  if (secret && authHeader !== `Bearer ${secret}`) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { event } = req.body as {
    event?: {
      type?: string;
      app_user_id?: string;
    };
  };

  if (!event?.type || !event?.app_user_id) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }

  const { type, app_user_id } = event;
  const user = await prisma.user.findFirst({ where: { revenueCatUserId: app_user_id } });

  if (!user) {
    return res.status(200).json({ success: true });
  }

  const activeEvents = ['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION', 'NON_RENEWING_PURCHASE'];
  const cancelEvents = ['CANCELLATION', 'EXPIRATION', 'BILLING_ISSUE'];

  if (activeEvents.includes(type)) {
    await prisma.user.update({ where: { id: user.id }, data: { subscriptionTier: 'plus' } });
  } else if (cancelEvents.includes(type)) {
    await prisma.user.update({ where: { id: user.id }, data: { subscriptionTier: 'free' } });
  }

  res.json({ success: true });
});
