/**
 * Creates a signed JWT for the given user id.
 * The client sends this token on protected requests.
 */
import jwt from 'jsonwebtoken';
import config from '../config/env.js';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });
};

export default generateToken;
