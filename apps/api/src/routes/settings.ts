import { Router } from 'express';
import { z } from 'zod';
import { ABOUT, EXPORT_VERSION, type DatabaseExport, type ImportResult } from '@penfolio/shared';
import { env } from '../env';
import { getDb } from '../db/connection';
import { DATA_TABLES, EXPORT_TABLES, IMPORT_TABLES } from '../db/migrate';
import { requireAuth } from '../auth/middleware';
import { nowIso } from '../util/time';
import { asyncHandler, badRequest } from '../util/http';

const importSchema = z.object({
  app: z.literal('penfolio'),
  version: z.number(),
  exportedAt: z.string().optional(),
  tables: z.record(z.string(), z.array(z.record(z.string(), z.unknown()))),
});

function columnsOf(table: string): string[] {
  return (getDb().prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>).map((c) => c.name);
}

export function settingsRouter(): Router {
  const router = Router();
  router.use(requireAuth);

  router.get(
    '/about',
    asyncHandler((_req, res) => {
      res.json({ ...ABOUT, version: env.version });
    }),
  );

  // Full export — all data plus the user account (treat the file as sensitive,
  // it contains the password hash).
  router.get(
    '/export',
    asyncHandler((_req, res) => {
      const db = getDb();
      const tables: Record<string, Array<Record<string, unknown>>> = {};
      for (const t of EXPORT_TABLES) {
        tables[t] = db.prepare(`SELECT * FROM ${t}`).all() as Array<Record<string, unknown>>;
      }
      const payload: DatabaseExport = {
        app: 'penfolio',
        version: EXPORT_VERSION,
        exportedAt: nowIso(),
        tables,
      };
      res.setHeader('Content-Disposition', 'attachment; filename="penfolio-export.json"');
      res.json(payload);
    }),
  );

  // Replace ALL data with the contents of an export file (keeps the account).
  router.post(
    '/import',
    asyncHandler((req, res) => {
      const parsed = importSchema.safeParse(req.body);
      if (!parsed.success) throw badRequest('Invalid export file', parsed.error.flatten());
      const data = parsed.data;
      const db = getDb();
      const imported: Record<string, number> = {};

      db.pragma('foreign_keys = OFF');
      try {
        db.transaction(() => {
          for (const t of [...IMPORT_TABLES].reverse()) db.prepare(`DELETE FROM ${t}`).run();
          for (const t of IMPORT_TABLES) {
            imported[t] = 0;
            const cols = columnsOf(t);
            const rows = data.tables[t] ?? [];
            for (const row of rows) {
              const useCols = cols.filter((c) => Object.prototype.hasOwnProperty.call(row, c));
              if (useCols.length === 0) continue;
              const placeholders = useCols.map(() => '?').join(', ');
              db.prepare(`INSERT INTO ${t} (${useCols.join(', ')}) VALUES (${placeholders})`).run(
                ...useCols.map((c) => (row as Record<string, unknown>)[c] as never),
              );
              imported[t]++;
            }
          }
        })();
      } finally {
        db.pragma('foreign_keys = ON');
      }
      res.json({ imported } satisfies ImportResult);
    }),
  );

  // Danger zone: delete all data (keeps the user account).
  router.post(
    '/purge',
    asyncHandler((_req, res) => {
      const db = getDb();
      db.pragma('foreign_keys = OFF');
      try {
        db.transaction(() => {
          for (const t of [...DATA_TABLES].reverse()) db.prepare(`DELETE FROM ${t}`).run();
        })();
      } finally {
        db.pragma('foreign_keys = ON');
      }
      res.json({ purged: true });
    }),
  );

  return router;
}
