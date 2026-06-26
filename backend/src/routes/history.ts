import { Router } from 'express';

// History routes are registered via entityRoutes.ts on /api/politicians and /api/parties.
// This router is a placeholder for future global history endpoints.
export const historyRouter = Router();

historyRouter.get('/health', (_req, res) => res.json({ ok: true }));
