import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  app,
  request,
  connectTestDB,
  clearCollections,
  closeTestDB,
  seedUsers,
  loginAs,
} from '../helpers.js';

describe('Auth API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearCollections();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  it('GET /api/health returns API status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('registers a new resident', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'New Resident',
      email: 'new-resident@example.com',
      password: 'password123',
      phone: '1112223333',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('resident');
    expect(res.body.data.token).toBeTruthy();
  });

  it('rejects duplicate email registration', async () => {
    await seedUsers();
    const res = await request(app).post('/api/auth/register').send({
      name: 'Dup',
      email: 'test-resident@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(400);
  });

  it('logs in with valid credentials', async () => {
    await seedUsers();
    const res = await request(app).post('/api/auth/login').send({
      email: 'test-resident@example.com',
      password: 'resident123',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.user.email).toBe('test-resident@example.com');
  });

  it('rejects invalid login', async () => {
    await seedUsers();
    const res = await request(app).post('/api/auth/login').send({
      email: 'test-resident@example.com',
      password: 'wrong-password',
    });
    expect(res.status).toBe(401);
  });

  it('returns current user with /api/auth/me', async () => {
    await seedUsers();
    const token = await loginAs('test-resident@example.com', 'resident123');
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('test-resident@example.com');
  });

  it('blocks /api/auth/me without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
