import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { usersRouter } from '../routes/users';
import { prisma } from '../lib/prisma';

const app = express();
app.use(express.json());
app.use('/api/users', usersRouter);

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  passwordHash: bcrypt.hashSync('correct-password', 1),
  subscriptionTier: 'free',
  createdAt: new Date('2024-01-01'),
};

function makeToken(userId = mockUser.id) {
  return jwt.sign({ sub: userId, email: mockUser.email, tier: 'free' }, process.env.JWT_SECRET!);
}

describe('GET /api/users/me', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with a tampered token', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer forged.token.value');
    expect(res.status).toBe(401);
  });

  it('returns 401 with a token signed by a wrong secret', async () => {
    const forged = jwt.sign({ sub: mockUser.id }, 'wrong-secret');
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${forged}`);
    expect(res.status).toBe(401);
  });

  it('returns user data with a valid token', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${makeToken()}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(mockUser.email);
  });
});

describe('PUT /api/users/me/password', () => {
  it('returns 401 without token', async () => {
    const res = await request(app)
      .put('/api/users/me/password')
      .send({ currentPassword: 'correct-password', newPassword: 'newpassword123' });
    expect(res.status).toBe(401);
  });

  it('returns 401 with wrong current password', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    const res = await request(app)
      .put('/api/users/me/password')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ currentPassword: 'wrong-password', newPassword: 'newpassword123' });
    expect(res.status).toBe(401);
  });

  it('returns 400 when new password is too short', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    const res = await request(app)
      .put('/api/users/me/password')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ currentPassword: 'correct-password', newPassword: 'short' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when new password exceeds 128 characters', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    const res = await request(app)
      .put('/api/users/me/password')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ currentPassword: 'correct-password', newPassword: 'a'.repeat(129) });
    expect(res.status).toBe(400);
  });

  it('returns 400 when fields are missing', async () => {
    const res = await request(app)
      .put('/api/users/me/password')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('succeeds with correct current password and valid new password', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);
    const res = await request(app)
      .put('/api/users/me/password')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ currentPassword: 'correct-password', newPassword: 'ValidNewPass123' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('DELETE /api/users/me', () => {
  it('returns 401 without token', async () => {
    const res = await request(app)
      .delete('/api/users/me')
      .send({ password: 'correct-password' });
    expect(res.status).toBe(401);
  });

  it('returns 400 without password', async () => {
    const res = await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('returns 400 when password exceeds 128 characters', async () => {
    const res = await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ password: 'a'.repeat(129) });
    expect(res.status).toBe(400);
  });

  it('returns 401 with wrong password', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    const res = await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('deletes account with correct password', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.user.delete as jest.Mock).mockResolvedValue(mockUser);
    const res = await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ password: 'correct-password' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
