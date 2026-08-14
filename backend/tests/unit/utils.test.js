import { describe, it, expect } from 'vitest';
import generateToken from '../../utils/generateToken.js';
import { formatUser } from '../../utils/formatUser.js';
import jwt from 'jsonwebtoken';
import config from '../../config/env.js';

describe('generateToken', () => {
  it('creates a JWT containing the user id', () => {
    const token = generateToken('507f1f77bcf86cd799439011');
    const decoded = jwt.verify(token, config.jwtSecret);
    expect(decoded.id).toBe('507f1f77bcf86cd799439011');
  });
});

describe('formatUser', () => {
  it('returns safe public fields without password', () => {
    const formatted = formatUser({
      _id: 'u1',
      name: 'Ada',
      email: 'ada@example.com',
      role: 'resident',
      phone: '123',
      password: 'secret',
      isActive: true,
    });

    expect(formatted).toMatchObject({
      id: 'u1',
      name: 'Ada',
      email: 'ada@example.com',
      role: 'resident',
      phone: '123',
    });
    expect(formatted).not.toHaveProperty('password');
  });
});
