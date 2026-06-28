import 'dotenv/config';
import path from 'node:path';

function str(name: string, fallback: string): string {
  const v = process.env[name];
  return v === undefined || v === '' ? fallback : v;
}

export const env = {
  port: parseInt(str('PORT', '3000'), 10),
  nodeEnv: str('NODE_ENV', 'development'),
  databasePath: path.resolve(process.cwd(), str('DATABASE_PATH', './data/penfolio.sqlite')),
  jwtSecret: str('JWT_SECRET', 'penfolio-dev-secret-change-me'),
  jwtExpiresIn: str('JWT_EXPIRES_IN', '7d'),
  defaultUsername: str('DEFAULT_USERNAME', 'admin'),
  defaultPassword: str('DEFAULT_PASSWORD', 'admin123'),
  /** build version (GitVersion assemblySemVer), injected at image build time. */
  version: str('APP_VERSION', '0.0.0-dev'),
  /** directory holding the built Angular app (production static serving). */
  webDir: str('WEB_DIR', path.resolve(process.cwd(), 'public')),
};
