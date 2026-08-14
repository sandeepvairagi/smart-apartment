/**
 * Seed a published notice so residents can see something in Notices.
 * Run: node scripts/seedNotice.js
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Notice from '../models/Notice.js';

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    throw new Error('No admin user found. Run seedUsers.js first.');
  }

  const existing = await Notice.findOne({ title: 'Welcome to Smart Apartment VMS' });
  if (existing) {
    console.log('Welcome notice already exists');
  } else {
    await Notice.create({
      title: 'Welcome to Smart Apartment VMS',
      body: 'This is your community notice board. Admins will publish updates about maintenance, events, and security here.',
      priority: 'normal',
      isPublished: true,
      publishedAt: new Date(),
      createdBy: admin._id,
    });
    console.log('Created welcome notice');
  }

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
