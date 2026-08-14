/**
 * server.js — Application entry point
 * Connects DB, attaches Socket.IO, starts listening.
 */
import http from 'http';
import config from './config/env.js';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import createApp from './app.js';

const app = createApp();

const startServer = async () => {
  try {
    await connectDB();

    const httpServer = http.createServer(app);
    initSocket(httpServer);

    httpServer.listen(config.port, () => {
      console.log(
        `Server running in ${config.nodeEnv} mode on http://localhost:${config.port}`
      );
      console.log(`Socket.IO ready (JWT-authenticated rooms)`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

export default app;
