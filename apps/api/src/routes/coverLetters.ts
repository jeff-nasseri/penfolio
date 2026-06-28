import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db/connection';
import { mapCoverLetter } from '../db/mappers';
import { requireAuth } from '../auth/middleware';
import { asyncHandler, intParam, notFound } from '../util/http';
import { nowIso } from '../util/time';

const upsertSchema = z.object({
  title: z.string().min(1).max(200),
  tag: z.string().max(80).nullable().optional(),
  content: z.unknown(),
  customization: z.unknown(),
});

function findRow(id: number): any {
  const row = getDb().prepare('SELECT * FROM cover_letter WHERE id = ?').get(id);
  if (!row) throw notFound('Cover letter');
  return row;
}

export function coverLettersRouter(): Router {
  const router = Router();
  router.use(requireAuth);

  router.get(
    '/',
    asyncHandler((_req, res) => {
      const rows = getDb()
        .prepare('SELECT * FROM cover_letter ORDER BY updated_at DESC, id DESC')
        .all();
      res.json(rows.map(mapCoverLetter));
    }),
  );

  router.get(
    '/:id',
    asyncHandler((req, res) => {
      res.json(mapCoverLetter(findRow(intParam(req.params.id))));
    }),
  );

  router.post(
    '/',
    asyncHandler((req, res) => {
      const body = upsertSchema.parse(req.body);
      const now = nowIso();
      const info = getDb()
        .prepare(
          `INSERT INTO cover_letter (title, tag, content, customization, created_at, updated_at)
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
      res.status(201).json(mapCoverLetter(findRow(Number(info.lastInsertRowid))));
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
          `UPDATE cover_letter SET title = ?, tag = ?, content = ?, customization = ?, updated_at = ?
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
      res.json(mapCoverLetter(findRow(id)));
    }),
  );

  router.post(
    '/:id/duplicate',
    asyncHandler((req, res) => {
      const src = findRow(intParam(req.params.id));
      const now = nowIso();
      const info = getDb()
        .prepare(
          `INSERT INTO cover_letter (title, tag, content, customization, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .run(`${src.title} (copy)`, src.tag, src.content, src.customization, now, now);
      res.status(201).json(mapCoverLetter(findRow(Number(info.lastInsertRowid))));
    }),
  );

  router.delete(
    '/:id',
    asyncHandler((req, res) => {
      const info = getDb()
        .prepare('DELETE FROM cover_letter WHERE id = ?')
        .run(intParam(req.params.id));
      if (info.changes === 0) throw notFound('Cover letter');
      res.status(204).end();
    }),
  );

  return router;
}
