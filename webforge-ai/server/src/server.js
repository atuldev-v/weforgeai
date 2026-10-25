import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';

import { env, assertRequiredEnv } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimit.js';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import githubRoutes from './routes/githubRoutes.js';
import versionRoutes from './routes/versionRoutes.js';
import userRoutes from './routes/userRoutes.js';

assertRequiredEnv();

const app = express();

app.set('trust proxy', 1);

// --- Security middleware ---
app.use(helmet());
app.use(
  cors({
    // CLIENT_URL may include a path such as /weforgeai for GitHub Pages, while
    // the browser's Origin header never includes a path.
    origin: new URL(env.CLIENT_URL).origin,
    credentials: true,
  })
);
app.use(mongoSanitize()); // strips $ / . operators from user input to prevent NoSQL injection
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

app.use('/api', apiLimiter);

// --- Health check ---
app.get('/api/health', (_req, res) => res.json({ success: true, status: 'ok', time: new Date().toISOString() }));

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/versions', versionRoutes);
app.use('/api/users', userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  try {
    await connectDB();
    app.listen(env.PORT, () => {
      logger.info(`WebForge AI server listening on port ${env.PORT} (${env.NODE_ENV})`);
      if (env.AI_PROVIDER === 'mock') {
        logger.info('AI_PROVIDER=mock — running with the offline mock generator. Set AI_PROVIDER=openai/anthropic + an API key for real AI generations.');
      }
    });
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
}

start();

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', reason instanceof Error ? reason : new Error(String(reason)));
});
