import request from 'supertest';
import express from 'express';
import { partiesRouter } from '../routes/parties';
import { MOCK_SEARCH_PARTIES } from '../services/mockData';

process.env.DEMO_MODE = 'true';

const app = express();
app.use(express.json());
app.use('/api/parties', partiesRouter);

describe('GET /api/parties/search', () => {
  it('returns 400 when query is missing', async () => {
    const res = await request(app).get('/api/parties/search');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when query is too short', async () => {
    const res = await request(app).get('/api/parties/search?q=x');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns matching parties for a known name', async () => {
    const firstName = MOCK_SEARCH_PARTIES.entities[0].name;
    const query = firstName.slice(0, 3);
    const res = await request(app).get(`/api/parties/search?q=${encodeURIComponent(query)}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.entities.length).toBeGreaterThan(0);
    expect(res.body.data.total).toBe(res.body.data.entities.length);
  });

  it('falls back to all mock entities for an unknown query and total is consistent', async () => {
    const res = await request(app).get('/api/parties/search?q=zzznomatch');
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(res.body.data.entities.length);
    expect(res.body.data.entities.length).toBeGreaterThan(0);
  });
});
