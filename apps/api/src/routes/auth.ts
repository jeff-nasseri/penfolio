import { Router } from 'express';
import { z } from 'zod';
import type { LoginResponse } from '@penfolio/shared';
import { getDb } from '../db/connection';
import { mapUser } from '../db/mappers';
import { signToken } from '../auth/jwt';
import { requireAuth } from '../auth/middleware';
import { hashPassword, verifyPassword } from '../auth/password';
import { asyncHandler, badRequest, notFound, unauthorized } from '../util/http';
import { nowIso } from '../util/time';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

function getUserRow(): any {
  const row = getDb().prepare('SELECT * FROM app_user WHERE id = 1').get();
  if (!row) throw notFound('User');
  return row;
}

export function authRouter(): Router {
  const router = Router();

  router.post(
    '/login',
    asyncHandler((req, res) => {
      const body = loginSchema.parse(req.body);
      const row = getUserRow();
      if (row.username !== body.username || !verifyPassword(body.password, row.password_hash)) {
        throw unauthorized('Invalid username or password');
      }
      const token = signToken(row.id);
      res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
      res.json({ token, user: mapUser(row) } satisfies LoginResponse);
    }),
  );

  router.post('/logout', (_req, res) => {
    res.clearCookie('token');
    res.json({ ok: true });
  });

  router.get(
    '/me',
    requireAuth,
    asyncHandler((_req, res) => {
      res.json(mapUser(getUserRow()));
    }),
  );

  router.post(
    '/change-password',
    requireAuth,
    asyncHandler((req, res) => {
      const body = changePasswordSchema.parse(req.body);
      const row = getUserRow();
      if (!verifyPassword(body.currentPassword, row.password_hash)) {
        throw badRequest('Current password is incorrect');
      }
      getDb()
        .prepare('UPDATE app_user SET password_hash = ? WHERE id = 1')
        .run(hashPassword(body.newPassword));
      res.json({ ok: true, changedAt: nowIso() });
    }),
  );

  return router;
}
