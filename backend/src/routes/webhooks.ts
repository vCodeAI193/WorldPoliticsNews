import { Router, Request, Response } from 'express';
import { handleStripeWebhook } from '../services/stripeService';

export const webhooksRouter = Router();

webhooksRouter.post('/stripe', async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    return res.status(400).json({ error: 'Keine Stripe-Signatur' });
  }

  try {
    await handleStripeWebhook(req.body as Buffer, signature);
    res.json({ received: true });
  } catch (err: any) {
    console.error('Stripe webhook error:', err.message);
    res.status(400).json({ error: err.message });
  }
});
