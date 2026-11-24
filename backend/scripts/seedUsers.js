/**
 * Dev seed script — creates one admin and one guard for testing RBAC.
 * Run: node scripts/seedUsers.js
 */
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const seed = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/smart-apartment-vms';
  await mongoose.connect(uri);

  const users = [
    {
      name: 'System Admin',
      email: 'admin@apartment.com',
      password: 'admin123',
      role: 'admin',
      phone: '9000000001',
    },
    {
      name: 'Gate Guard',
      email: 'guard@apartment.com',
      password: 'guard123',
      role: 'guard',
      phone: '9000000002',
    },
  ];

  for (const data of users) {
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      console.log(`Skipped (exists): ${data.email}`);
      continue;
    }
    await User.create(data);
    console.log(`Created ${data.role}: ${data.email} / ${data.password}`);
  }

  await mongoose.disconnect();
  console.log('Seed complete');
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
