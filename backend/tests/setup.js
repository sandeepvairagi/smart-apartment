/**
 * Test setup — force test env before modules load.
 * Uses a separate MongoDB database so we never wipe production/dev data.
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test-jwt-secret-smart-apartment-vms';
process.env.JWT_EXPIRE = '1h';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.MONGODB_URI =
  process.env.MONGODB_URI_TEST ||
  'mongodb://localhost:27017/smart-apartment-vms-test';
