import { Router } from 'express';
import { z } from 'zod';
import type { JobBoard, JobStage } from '@penfolio/shared';
import { getDb } from '../db/connection';
import { mapApplication, mapColumn } from '../db/mappers';
import { requireAuth } from '../auth/middleware';
import { asyncHandler, badRequest, intParam, notFound } from '../util/http';
import { nowIso } from '../util/time';

const STAGES: JobStage[] = ['saved', 'applied', 'interview', 'offer', 'rejected', 'other'];

const columnSchema = z.object({
  name: z.string().min(1).max(80),
  color: z.string().max(40).optional(),
  stage: z.enum(STAGES as [JobStage, ...JobStage[]]).optional(),
  sortOrder: z.number().int().optional(),
});

const applicationSchema = z.object({
  columnId: z.number().int(),
  company: z.string().min(1).max(200),
  role: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  source: z.string().max(120).optional(),
  url: z.string().max(500).optional(),
  salary: z.string().max(120).optional(),
  notes: z.string().max(20000).optional(),
  appliedDate: z.string().max(40).optional(),
  sortOrder: z.number().int().optional(),
});

const applicationUpdateSchema = applicationSchema.partial();
const moveSchema = z.object({ columnId: z.number().int(), sortOrder: z.number().int() });
const reorderSchema = z.object({ ids: z.array(z.number().int()) });

function columnExists(id: number): void {
  if (!getDb().prepare('SELECT id FROM job_column WHERE id = ?').get(id)) {
    throw badRequest('columnId does not exist');
  }
}

function nextColumnOrder(): number {
  const row = getDb().prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM job_column').get() as {
    n: number;
  };
  return row.n;
}

function nextAppOrder(columnId: number): number {
  const row = getDb()
    .prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM job_application WHERE column_id = ?')
    .get(columnId) as { n: number };
  return row.n;
}

export function trackerRouter(): Router {
  const router = Router();
  router.use(requireAuth);

  // ---- Whole board ----
  router.get(
    '/',
    asyncHandler((_req, res) => {
      const db = getDb();
      const columns = db.prepare('SELECT * FROM job_column ORDER BY sort_order, id').all().map(mapColumn);
      const applications = db
        .prepare('SELECT * FROM job_application ORDER BY sort_order, id')
        .all()
        .map(mapApplication);
      res.json({ columns, applications } satisfies JobBoard);
    }),
  );

  // ---- Columns ----
  router.post(
    '/columns',
    asyncHandler((req, res) => {
      const body = columnSchema.parse(req.body);
      const info = getDb()
        .prepare('INSERT INTO job_column (name, color, stage, sort_order, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(body.name, body.color ?? '#8B7BFF', body.stage ?? 'other', body.sortOrder ?? nextColumnOrder(), nowIso());
      res.status(201).json(mapColumn(getDb().prepare('SELECT * FROM job_column WHERE id = ?').get(Number(info.lastInsertRowid))));
    }),
  );

  router.put(
    '/columns/reorder',
    asyncHandler((req, res) => {
      const { ids } = reorderSchema.parse(req.body);
      const db = getDb();
      const stmt = db.prepare('UPDATE job_column SET sort_order = ? WHERE id = ?');
      db.transaction(() => ids.forEach((id, i) => stmt.run(i, id)))();
      res.json(db.prepare('SELECT * FROM job_column ORDER BY sort_order, id').all().map(mapColumn));
    }),
  );

  router.put(
    '/columns/:id',
    asyncHandler((req, res) => {
      const id = intParam(req.params.id);
      const db = getDb();
      const row = db.prepare('SELECT * FROM job_column WHERE id = ?').get(id) as any;
      if (!row) throw notFound('Column');
      const body = columnSchema.partial().parse(req.body);
      db.prepare('UPDATE job_column SET name = ?, color = ?, stage = ?, sort_order = ? WHERE id = ?').run(
        body.name ?? row.name,
        body.color ?? row.color,
        body.stage ?? row.stage,
        body.sortOrder ?? row.sort_order,
        id,
      );
      res.json(mapColumn(db.prepare('SELECT * FROM job_column WHERE id = ?').get(id)));
    }),
  );

  router.delete(
    '/columns/:id',
    asyncHandler((req, res) => {
      const info = getDb().prepare('DELETE FROM job_column WHERE id = ?').run(intParam(req.params.id));
      if (info.changes === 0) throw notFound('Column');
      res.status(204).end();
    }),
  );

  // ---- Applications ----
  router.post(
    '/applications',
    asyncHandler((req, res) => {
      const body = applicationSchema.parse(req.body);
      columnExists(body.columnId);
      const now = nowIso();
      const info = getDb()
        .prepare(
          `INSERT INTO job_application
           (column_id, company, role, location, source, url, salary, notes, applied_date, sort_order, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          body.columnId,
          body.company,
          body.role ?? '',
          body.location ?? '',
          body.source ?? '',
          body.url ?? '',
          body.salary ?? '',
          body.notes ?? '',
          body.appliedDate ?? '',
          body.sortOrder ?? nextAppOrder(body.columnId),
          now,
          now,
        );
      res.status(201).json(mapApplication(getDb().prepare('SELECT * FROM job_application WHERE id = ?').get(Number(info.lastInsertRowid))));
    }),
  );

  router.put(
    '/applications/:id',
    asyncHandler((req, res) => {
      const id = intParam(req.params.id);
      const db = getDb();
      const row = db.prepare('SELECT * FROM job_application WHERE id = ?').get(id) as any;
      if (!row) throw notFound('Application');
      const body = applicationUpdateSchema.parse(req.body);
      if (body.columnId !== undefined) columnExists(body.columnId);
      db.prepare(
        `UPDATE job_application SET column_id = ?, company = ?, role = ?, location = ?, source = ?,
         url = ?, salary = ?, notes = ?, applied_date = ?, sort_order = ?, updated_at = ? WHERE id = ?`,
      ).run(
        body.columnId ?? row.column_id,
        body.company ?? row.company,
        body.role ?? row.role,
        body.location ?? row.location,
        body.source ?? row.source,
        body.url ?? row.url,
        body.salary ?? row.salary,
        body.notes ?? row.notes,
        body.appliedDate ?? row.applied_date,
        body.sortOrder ?? row.sort_order,
        nowIso(),
        id,
      );
      res.json(mapApplication(db.prepare('SELECT * FROM job_application WHERE id = ?').get(id)));
    }),
  );

  router.put(
    '/applications/:id/move',
    asyncHandler((req, res) => {
      const id = intParam(req.params.id);
      const db = getDb();
      const row = db.prepare('SELECT * FROM job_application WHERE id = ?').get(id) as any;
      if (!row) throw notFound('Application');
      const body = moveSchema.parse(req.body);
      columnExists(body.columnId);
      db.prepare('UPDATE job_application SET column_id = ?, sort_order = ?, updated_at = ? WHERE id = ?').run(
        body.columnId,
        body.sortOrder,
        nowIso(),
        id,
      );
      res.json(mapApplication(db.prepare('SELECT * FROM job_application WHERE id = ?').get(id)));
    }),
  );

  router.delete(
    '/applications/:id',
    asyncHandler((req, res) => {
      const info = getDb().prepare('DELETE FROM job_application WHERE id = ?').run(intParam(req.params.id));
      if (info.changes === 0) throw notFound('Application');
      res.status(204).end();
    }),
  );

  return router;
}
