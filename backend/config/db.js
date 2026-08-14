/**
 * config/db.js — MongoDB connection using Mongoose
 *
 * Mongoose is an ODM (Object Data Modeling) library.
 * It lets us define schemas and talk to MongoDB with JavaScript objects.
 */
import mongoose from 'mongoose';
import config from './env.js';

const connectDB = async () => {
  if (!config.mongoUri) {
    throw new Error(
      'MONGODB_URI is missing. Add it to backend/.env (see .env.example).'
    );
  }

  // Reuse open connection (important for test suites)
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const conn = await mongoose.connect(config.mongoUri);

  if (config.nodeEnv !== 'test') {
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  }
  return conn;
};

export default connectDB;
