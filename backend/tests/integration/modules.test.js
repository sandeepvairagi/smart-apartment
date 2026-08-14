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

describe('Visitor / QR / Complaint / Parcel / Notice APIs', () => {
  let tokens;
  let users;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearCollections();
    users = await seedUsers();
    tokens = {
      admin: await loginAs('test-admin@example.com', 'admin123'),
      guard: await loginAs('test-guard@example.com', 'guard123'),
      resident: await loginAs('test-resident@example.com', 'resident123'),
    };
  });

  afterAll(async () => {
    await closeTestDB();
  });

  it('guard creates visitor with QR, then scans check-in', async () => {
    const create = await request(app)
      .post('/api/guard/visitors')
      .set('Authorization', `Bearer ${tokens.guard}`)
      .send({
        name: 'Guest One',
        phone: '8888777766',
        residentId: users.resident._id,
        purpose: 'Delivery',
        expectedDate: new Date().toISOString().slice(0, 10),
      });

    expect(create.status).toBe(201);
    expect(create.body.data.visitor.qrCode).toMatch(/^data:image\/png/);
    expect(create.body.data.qrPayload).toBeTruthy();

    const scan = await request(app)
      .post('/api/qr/scan')
      .set('Authorization', `Bearer ${tokens.guard}`)
      .send({ qrData: create.body.data.qrPayload });

    expect(scan.status).toBe(200);
    expect(scan.body.data.action).toBe('checked-in');
    expect(scan.body.data.visitor.status).toBe('checked-in');
  });

  it('public QR verify returns valid visitor summary', async () => {
    const created = await request(app)
      .post('/api/visitor/register')
      .send({
        name: 'Public Guest',
        phone: '7777666655',
        residentId: users.resident._id,
        purpose: 'Meetup',
      });

    expect(created.status).toBe(201);

    const verify = await request(app)
      .post('/api/qr/verify')
      .send({ qrData: created.body.data.qrPayload });

    expect(verify.status).toBe(200);
    expect(verify.body.data.valid).toBe(true);
    expect(verify.body.data.visitor.name).toBe('Public Guest');
  });

  it('resident raises complaint and admin lists it', async () => {
    const raise = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${tokens.resident}`)
      .send({
        title: 'Leaky tap',
        description: 'Kitchen sink dripping',
        category: 'maintenance',
      });

    expect(raise.status).toBe(201);

    const list = await request(app)
      .get('/api/complaints')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(list.status).toBe(200);
    expect(list.body.data.items.length).toBeGreaterThanOrEqual(1);
    expect(list.body.data.items[0].title).toBe('Leaky tap');
  });

  it('guard logs parcel for resident', async () => {
    const res = await request(app)
      .post('/api/parcels')
      .set('Authorization', `Bearer ${tokens.guard}`)
      .send({
        residentId: users.resident._id,
        courier: 'Amazon',
        trackingId: 'AMZ-TEST-1',
        description: 'Books',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.parcel.status).toBe('received');

    const mine = await request(app)
      .get('/api/parcels/mine')
      .set('Authorization', `Bearer ${tokens.resident}`);

    expect(mine.status).toBe(200);
    expect(mine.body.data.items[0].courier).toBe('Amazon');
  });

  it('admin publishes notice and resident can read it', async () => {
    const create = await request(app)
      .post('/api/notices')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        title: 'Water maintenance',
        body: 'Water off tomorrow 10am-2pm',
        priority: 'high',
        publish: true,
      });

    expect(create.status).toBe(201);
    expect(create.body.data.notice.isPublished).toBe(true);

    const published = await request(app)
      .get('/api/notices/published')
      .set('Authorization', `Bearer ${tokens.resident}`);

    expect(published.status).toBe(200);
    expect(published.body.data.items.some((n) => n.title === 'Water maintenance')).toBe(
      true
    );
  });

  it('rejects invalid QR verify payload', async () => {
    const res = await request(app)
      .post('/api/qr/verify')
      .send({
        qrData: JSON.stringify({
          type: 'visitor-pass',
          visitorId: '507f1f77bcf86cd799439011',
          qrToken: 'bad-token',
        }),
      });

    expect(res.status).toBe(404);
  });

  it('blocks resident from admin notices list', async () => {
    const res = await request(app)
      .get('/api/notices')
      .set('Authorization', `Bearer ${tokens.resident}`);

    expect(res.status).toBe(403);
  });

  it('resident confirms parcel collection', async () => {
    const logRes = await request(app)
      .post('/api/parcels')
      .set('Authorization', `Bearer ${tokens.guard}`)
      .send({
        residentId: users.resident._id,
        courier: 'Flipkart',
        trackingId: 'FLP-123',
      });

    const parcelId = logRes.body.data.parcel._id;

    const collectRes = await request(app)
      .patch(`/api/parcels/${parcelId}/collect`)
      .set('Authorization', `Bearer ${tokens.resident}`);

    expect(collectRes.status).toBe(200);
    expect(collectRes.body.data.parcel.status).toBe('delivered');
  });

  it('AI Chatbot answers query with resident courier context', async () => {
    const res = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${tokens.resident}`)
      .send({ message: 'Do I have any parcels or couriers?' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reply).toContain('Courier');
  });
});
