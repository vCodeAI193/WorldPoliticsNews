import { Router, Request, Response } from 'express';
import { handleStripeWebhook } from '../services/stripeService';

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
