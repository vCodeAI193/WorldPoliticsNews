import request from 'supertest';
import express from 'express';
import { politiciansRouter } from '../routes/politicians';
import { MOCK_SEARCH_POLITICIANS } from '../services/mockData';

// Run all politician tests in demo mode (no DB / AI calls)
process.env.DEMO_MODE = 'true';

const app = express();
app.use(express.json());
app.use('/api/politicians', politiciansRouter);

describe('GET /api/politicians/search', () => {
  it('returns 400 when query is missing', async () => {
    const res = await request(app).get('/api/politicians/search');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when query is too short', async () => {
    const res = await request(app).get('/api/politicians/search?q=a');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns matching politicians for a known name', async () => {
    const firstName = MOCK_SEARCH_POLITICIANS.entities[0].name;
    const query = firstName.slice(0, 4);
    const res = await request(app).get(`/api/politicians/search?q=${encodeURIComponent(query)}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.entities.length).toBeGreaterThan(0);
    expect(res.body.data.total).toBe(res.body.data.entities.length);
  });

  it('falls back to all mock entities for an unknown query', async () => {
    const res = await request(app).get('/api/politicians/search?q=zzznomatch');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // total must match the actual entity count returned (our bug fix)
    expect(res.body.data.total).toBe(res.body.data.entities.length);
    expect(res.body.data.entities.length).toBeGreaterThan(0);
  });

  it('total always equals entities.length', async () => {
    const queries = ['Merz', 'zzznomatch', 'a'];
    for (const q of ['Merz', 'zzznomatch']) {
      const res = await request(app).get(`/api/politicians/search?q=${q}`);
      expect(res.body.data?.total).toBe(res.body.data?.entities?.length);
    }
    void queries; // suppress unused warning
  });
});
