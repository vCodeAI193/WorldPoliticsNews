import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock Prisma before importing the router
jest.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

import { authRouter } from '../routes/auth';
import { prisma } from '../lib/prisma';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  passwordHash: bcrypt.hashSync('password123', 1),
  subscriptionTier: 'free',
  createdAt: new Date('2024-01-01'),
};

const mockRefreshToken = {
  id: 'rt-1',
  token: 'valid-refresh-token',
  userId: mockUser.id,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
};

beforeEach(() => {
  (prisma.refreshToken.create as jest.Mock).mockResolvedValue(mockRefreshToken);
});

describe('POST /api/auth/register', () => {
  it('returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'password123' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@test.com', password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 409 when email is already registered', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: mockUser.email, password: 'password123' });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('creates user and returns tokens on success', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'new@test.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user.email).toBe(mockUser.email);
  });
});

describe('POST /api/auth/login', () => {
  it('returns 401 for unknown email', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'password123' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 401 for wrong password', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: mockUser.email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('returns tokens on successful login', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: mockUser.email, password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('refreshToken');
  });
});

describe('POST /api/auth/refresh', () => {
  it('returns 401 when no refresh token provided', async () => {
    const res = await request(app).post('/api/auth/refresh').send({});
    expect(res.status).toBe(401);
  });

  it('returns 401 for expired refresh token', async () => {
    const expired = { ...mockRefreshToken, expiresAt: new Date(Date.now() - 1000) };
    const rt = jwt.sign({ sub: mockUser.id }, process.env.JWT_REFRESH_SECRET!);
    (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(expired);

    const res = await request(app).post('/api/auth/refresh').send({ refreshToken: rt });
    expect(res.status).toBe(401);
  });

  it('returns new access token for valid refresh token', async () => {
    const rt = jwt.sign({ sub: mockUser.id }, process.env.JWT_REFRESH_SECRET!);
    (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({ ...mockRefreshToken, token: rt });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const res = await request(app).post('/api/auth/refresh').send({ refreshToken: rt });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
  });
});

describe('POST /api/auth/logout', () => {
  it('returns 200 and deletes the refresh token', async () => {
    (prisma.refreshToken.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
    const res = await request(app).post('/api/auth/logout').send({ refreshToken: 'some-token' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { token: 'some-token' } });
  });

  it('returns 200 even without a refresh token', async () => {
    const res = await request(app).post('/api/auth/logout').send({});
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
