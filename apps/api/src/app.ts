import express, { type NextFunction, type Request, type Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { ZodError } from 'zod';
import { authRouter } from './routes/auth';
import { profileRouter } from './routes/profile';
import { resumesRouter } from './routes/resumes';
import { coverLettersRouter } from './routes/coverLetters';
import { trackerRouter } from './routes/tracker';
import { analyticsRouter } from './routes/analytics';
import { settingsRouter } from './routes/settings';
import { buildOpenApiDocument } from './openapi';
import { serveStatic } from './static';
import { HttpError } from './util/http';

export function createApp() {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '50mb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  // OpenAPI document + Swagger UI (linked from Settings → "Open Swagger API").
  const openApiDoc = buildOpenApiDocument();
  app.get('/api/openapi.json', (_req, res) => res.json(openApiDoc));
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiDoc, { customSiteTitle: 'PenFolio API', swaggerOptions: { persistAuthorization: true } }),
  );

  app.use('/api/auth', authRouter());
  app.use('/api/profile', profileRouter());
  app.use('/api/resumes', resumesRouter());
  app.use('/api/cover-letters', coverLettersRouter());
  app.use('/api/tracker', trackerRouter());
  app.use('/api/analytics', analyticsRouter());
  app.use('/api/settings', settingsRouter());

  // Unknown API route → JSON 404 (never fall through to the SPA).
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

  // Production static hosting of the Angular app + SPA fallback.
  serveStatic(app);

  // Central error handler.
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) return next(err);
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: err.message, details: err.details });
    }
    if (err instanceof ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.flatten() });
    }
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
