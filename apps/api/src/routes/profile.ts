import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db/connection';
import { mapUser } from '../db/mappers';
import { requireAuth } from '../auth/middleware';
import { asyncHandler, notFound } from '../util/http';

const updateSchema = z.object({
  username: z.string().min(1).max(80).optional(),
  profilePicture: z.string().nullable().optional(),
  about: z.string().max(20000).optional(),
});

function getUserRow(): any {
  const row = getDb().prepare('SELECT * FROM app_user WHERE id = 1').get();
  if (!row) throw notFound('User');
  return row;
}

export function profileRouter(): Router {
  const router = Router();
  router.use(requireAuth);

  router.get(
    '/',
    asyncHandler((_req, res) => {
      res.json(mapUser(getUserRow()));
    }),
  );

  router.put(
    '/',
    asyncHandler((req, res) => {
      const body = updateSchema.parse(req.body);
      const row = getUserRow();
      getDb()
        .prepare('UPDATE app_user SET username = ?, profile_picture = ?, about = ? WHERE id = 1')
        .run(
          body.username ?? row.username,
          body.profilePicture !== undefined ? body.profilePicture : row.profile_picture,
          body.about ?? row.about,
        );
      res.json(mapUser(getUserRow()));
    }),
  );

  return router;
}
