import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

jest.mock('../lib/prisma', () => ({
  prisma: {
    watchlistItem: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

import { watchlistRouter } from '../routes/watchlist';
import { prisma } from '../lib/prisma';

const app = express();
app.use(express.json());
app.use('/api/watchlist', watchlistRouter);

function makeToken(userId: string, tier: 'free' | 'plus' = 'free') {
  return jwt.sign({ sub: userId, email: `${userId}@test.com`, tier }, process.env.JWT_SECRET!);
}

const tokenA = makeToken('user-a');
const tokenB = makeToken('user-b');

const mockItem = {
  id: 'item-1',
  userId: 'user-a',
  entityType: 'politician',
  entityId: 'Q567',
  entityName: 'Friedrich Merz',
  entityCountry: 'DE',
  createdAt: new Date(),
};

describe('GET /api/watchlist', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/watchlist');
    expect(res.status).toBe(401);
  });

  it('returns items for authenticated user', async () => {
    (prisma.watchlistItem.findMany as jest.Mock).mockResolvedValue([mockItem]);
    const res = await request(app)
      .get('/api/watchlist')
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('POST /api/watchlist', () => {
  it('returns 401 without token', async () => {
    const res = await request(app)
      .post('/api/watchlist')
      .send({ entityType: 'politician', entityId: 'Q567', entityName: 'Merz' });
    expect(res.status).toBe(401);
  });

  it('returns 400 with invalid entityType', async () => {
    const res = await request(app)
      .post('/api/watchlist')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ entityType: 'invalid', entityId: 'Q567', entityName: 'Merz' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when entityName exceeds 256 characters', async () => {
    const res = await request(app)
      .post('/api/watchlist')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ entityType: 'politician', entityId: 'Q567', entityName: 'A'.repeat(257) });
    expect(res.status).toBe(400);
  });

  it('returns 400 when entityId exceeds 64 characters', async () => {
    const res = await request(app)
      .post('/api/watchlist')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ entityType: 'politician', entityId: 'Q' + '1'.repeat(64), entityName: 'Merz' });
    expect(res.status).toBe(400);
  });

  it('returns 403 when free user hits 5-item limit', async () => {
    (prisma.watchlistItem.count as jest.Mock).mockResolvedValue(5);
    const res = await request(app)
      .post('/api/watchlist')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ entityType: 'politician', entityId: 'Q999', entityName: 'Sixth Item' });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('WATCHLIST_LIMIT');
  });

  it('allows plus user to exceed 5-item limit', async () => {
    const plusToken = makeToken('user-plus', 'plus');
    (prisma.watchlistItem.create as jest.Mock).mockResolvedValue({ ...mockItem, id: 'item-6' });
    const res = await request(app)
      .post('/api/watchlist')
      .set('Authorization', `Bearer ${plusToken}`)
      .send({ entityType: 'politician', entityId: 'Q999', entityName: 'Sixth Item' });
    expect(res.status).toBe(201);
  });

  it('returns 409 when item is already on the watchlist', async () => {
    (prisma.watchlistItem.count as jest.Mock).mockResolvedValue(1);
    (prisma.watchlistItem.create as jest.Mock).mockRejectedValue({ code: 'P2002' });
    const res = await request(app)
      .post('/api/watchlist')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ entityType: 'politician', entityId: 'Q567', entityName: 'Merz' });
    expect(res.status).toBe(409);
  });
});

describe('DELETE /api/watchlist/:id — IDOR prevention', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).delete('/api/watchlist/item-1');
    expect(res.status).toBe(401);
  });

  it('returns 404 when user tries to delete another user\'s item', async () => {
    // deleteMany with userId filter returns 0 when item belongs to another user
    (prisma.watchlistItem.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    const res = await request(app)
      .delete('/api/watchlist/item-1')
      .set('Authorization', `Bearer ${tokenB}`); // user-b trying to delete user-a's item
    expect(res.status).toBe(404);
  });

  it('succeeds when user deletes their own item', async () => {
    (prisma.watchlistItem.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
    const res = await request(app)
      .delete('/api/watchlist/item-1')
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
  });
});
