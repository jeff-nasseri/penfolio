import express, { type Express } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { env } from './env';

/**
 * In production the API also serves the compiled Angular app from WEB_DIR and
 * falls back to index.html for client-side routes. In development this is a
 * no-op (the Angular dev server serves the UI and proxies /api).
 */
export function serveStatic(app: Express): void {
  const dir = env.webDir;
  if (!fs.existsSync(path.join(dir, 'index.html'))) return;

  app.use(express.static(dir));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(dir, 'index.html'));
  });
}
