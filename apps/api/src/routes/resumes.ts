import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db/connection';
import { mapResume } from '../db/mappers';
import { requireAuth } from '../auth/middleware';
import { asyncHandler, intParam, notFound } from '../util/http';
import { nowIso } from '../util/time';

// Content / customization are rich nested objects validated by the shared types
// on the client; the API stores them verbatim as JSON.
const upsertSchema = z.object({
  title: z.string().min(1).max(200),
  tag: z.string().max(80).nullable().optional(),
  content: z.unknown(),
  customization: z.unknown(),
});

function findRow(id: number): any {
  const row = getDb().prepare('SELECT * FROM resume WHERE id = ?').get(id);
  if (!row) throw notFound('Resume');
  return row;
}

export function resumesRouter(): Router {
  const router = Router();
  router.use(requireAuth);

  router.get(
    '/',
    asyncHandler((_req, res) => {
      const rows = getDb().prepare('SELECT * FROM resume ORDER BY updated_at DESC, id DESC').all();
      res.json(rows.map(mapResume));
    }),
  );

  router.get(
    '/:id',
    asyncHandler((req, res) => {
      res.json(mapResume(findRow(intParam(req.params.id))));
    }),
  );

  router.post(
    '/',
    asyncHandler((req, res) => {
      const body = upsertSchema.parse(req.body);
      const now = nowIso();
      const info = getDb()
        .prepare(
          `INSERT INTO resume (title, tag, content, customization, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .run(
          body.title,
          body.tag ?? null,
          JSON.stringify(body.content ?? {}),
          JSON.stringify(body.customization ?? {}),
          now,
          now,
        );
      res.status(201).json(mapResume(findRow(Number(info.lastInsertRowid))));
    }),
  );

  router.put(
    '/:id',
    asyncHandler((req, res) => {
      const id = intParam(req.params.id);
      findRow(id);
      const body = upsertSchema.parse(req.body);
      getDb()
        .prepare(
          `UPDATE resume SET title = ?, tag = ?, content = ?, customization = ?, updated_at = ?
           WHERE id = ?`,
        )
        .run(
          body.title,
          body.tag ?? null,
          JSON.stringify(body.content ?? {}),
          JSON.stringify(body.customization ?? {}),
          nowIso(),
          id,
        );
      res.json(mapResume(findRow(id)));
    }),
  );

  router.post(
    '/:id/duplicate',
    asyncHandler((req, res) => {
      const src = findRow(intParam(req.params.id));
      const now = nowIso();
      const info = getDb()
        .prepare(
          `INSERT INTO resume (title, tag, content, customization, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .run(`${src.title} (copy)`, src.tag, src.content, src.customization, now, now);
      res.status(201).json(mapResume(findRow(Number(info.lastInsertRowid))));
    }),
  );

  router.delete(
    '/:id',
    asyncHandler((req, res) => {
      const info = getDb().prepare('DELETE FROM resume WHERE id = ?').run(intParam(req.params.id));
      if (info.changes === 0) throw notFound('Resume');
      res.status(204).end();
    }),
  );

  return router;
}
