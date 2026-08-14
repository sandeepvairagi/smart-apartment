/**
 * Loads environment variables and exports typed config.
 * Why: keeps secrets out of code and centralizes settings.
 */
import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  // Frontend URL — used later for CORS in production
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  // MongoDB Atlas / local connection string
  mongoUri: process.env.MONGODB_URI,
  // JWT settings
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  // Email (Nodemailer) — optional in development (falls back to Ethereal)
  email: {
    host: process.env.EMAIL_HOST || '',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from:
      process.env.EMAIL_FROM ||
      '"Smart Apartment VMS" <noreply@smart-apartment.local>',
  },
};

if (!config.jwtSecret) {
  console.warn(
    'WARNING: JWT_SECRET is not set in .env — authentication will fail.'
  );
}

export default config;
