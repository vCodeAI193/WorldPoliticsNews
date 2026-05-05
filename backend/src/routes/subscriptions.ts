import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { createCheckoutSession, createPortalSession } from '../services/stripeService';

export const subscriptionsRouter = Router();

subscriptionsRouter.post('/create-checkout', requireAuth, async (req: AuthRequest, res) => {
  try {
    const url = await createCheckoutSession(req.user!.id, req.user!.email);
    res.json({ success: true, data: { url } });
  } catch (err) {
    console.error('Checkout-Fehler:', err);
    res.status(500).json({ success: false, error: 'Checkout-Sitzung konnte nicht erstellt werden' });
  }
});

subscriptionsRouter.post('/portal', requireAuth, async (req: AuthRequest, res) => {
  try {
    const url = await createPortalSession(req.user!.id);
    res.json({ success: true, data: { url } });
  } catch (err) {
    console.error('Portal-Fehler:', err);
    res.status(500).json({ success: false, error: 'Kundenportal konnte nicht geöffnet werden' });
  }
});
