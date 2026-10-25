import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let memoryServer = null;

/**
 * Connects to MongoDB.
 * - If MONGODB_URI is set, connects to that real MongoDB (local, Docker, or Atlas).
 * - If not set (and not production), spins up an in-process mongodb-memory-server
 *   so the app runs with zero external setup. Data does not persist across restarts
 *   in this mode — it's meant for local development/demoing only.
 */
export async function connectDB() {
  let uri = env.MONGODB_URI;

  if (!uri) {
    if (env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI must be set in production.');
    }
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
    logger.warn('MONGODB_URI not set — using an in-memory MongoDB instance for local dev. Data will NOT persist restarts.');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    autoIndex: env.NODE_ENV !== 'production',
  });

  logger.info(`MongoDB connected (${memoryServer ? 'in-memory dev instance' : 'external'})`);

  mongoose.connection.on('error', (err) => logger.error('MongoDB connection error', err));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
