import 'reflect-metadata';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import env from './core/config/env.js';
import { initializeDatabase } from './core/config/database.js';
import { registerControllers } from './core/router/controller-loader.js';
import { errorHandler, notFoundHandler } from './core/middleware/error-handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function bootstrap() {
  await initializeDatabase();

  const app = express();

  // Parse JSON bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  
  // Trust proxy for accurate IP detection (if behind reverse proxy)
  app.set('trust proxy', true);
  
  // CORS Configuration - Allow frontend to send cookies
  app.use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true, // Allow cookies to be sent
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['Set-Cookie'],
      maxAge: 86400, // 24 hours preflight cache
    })
  );

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', version: env.APP_VERSION || '1.0.0' });
  });

  const registeredRoutes = await registerControllers(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  const port = env.PORT;
  const host = env.HOST || '0.0.0.0';

  app.listen(port, host, () => {
    console.log(`🚀 Server listening at http://${host}:${port}`);
    console.log(`📁 Controllers auto-loaded from ${resolve(__dirname, 'modules')}`);
    console.log(`🛣️  Registered routes: ${registeredRoutes}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
