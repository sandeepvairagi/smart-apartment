/**
 * Shared helpers for API integration tests
 */
import mongoose from 'mongoose';
import request from 'supertest';
import createApp from '../app.js';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Visitor from '../models/Visitor.js';
import Parcel from '../models/Parcel.js';
import Complaint from '../models/Complaint.js';
import Notice from '../models/Notice.js';
import Notification from '../models/Notification.js';
import Apartment from '../models/Apartment.js';

export const app = createApp();

export const connectTestDB = async () => {
  await connectDB();
};

export const clearCollections = async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
};

export const closeTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

export const seedUsers = async () => {
  await User.deleteMany({});
  const admin = await User.create({
    name: 'Test Admin',
    email: 'test-admin@example.com',
    password: 'admin123',
    role: 'admin',
  });
  const guard = await User.create({
    name: 'Test Guard',
    email: 'test-guard@example.com',
    password: 'guard123',
    role: 'guard',
  });
  const resident = await User.create({
    name: 'Test Resident',
    email: 'test-resident@example.com',
    password: 'resident123',
    role: 'resident',
    phone: '9999999999',
    unitLabel: 'A-101',
  });
  return { admin, guard, resident };
};

export const loginAs = async (email, password) => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  return res.body.data.token;
};

export {
  request,
  User,
  Visitor,
  Parcel,
  Complaint,
  Notice,
  Notification,
  Apartment,
};
