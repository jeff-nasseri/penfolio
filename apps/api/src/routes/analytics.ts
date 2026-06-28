import { Router } from 'express';
import type { AnalyticsResponse, JobStage } from '@penfolio/shared';
import { MONTH_NAMES_SHORT } from '@penfolio/shared';
import { getDb } from '../db/connection';
import { mapApplication, mapColumn } from '../db/mappers';
import { requireAuth } from '../auth/middleware';
import { asyncHandler } from '../util/http';

/** How far each stage sits along the pipeline (rejected counts as "applied"). */
const STAGE_RANK: Record<JobStage, number> = {
  saved: 0,
  applied: 1,
  rejected: 1,
  other: 1,
  interview: 2,
  offer: 3,
};

function monthKey(d: string): string {
  // accepts YYYY-MM-DD or ISO timestamps; returns YYYY-MM.
  return (d || '').slice(0, 7);
}

export function analyticsRouter(): Router {
  const router = Router();
  router.use(requireAuth);

  router.get(
    '/',
    asyncHandler((_req, res) => {
      const db = getDb();
      const columns = db.prepare('SELECT * FROM job_column ORDER BY sort_order, id').all().map(mapColumn);
      const apps = db.prepare('SELECT * FROM job_application').all().map(mapApplication);
      const resumes = (db.prepare('SELECT COUNT(*) AS c FROM resume').get() as { c: number }).c;
      const coverLetters = (db.prepare('SELECT COUNT(*) AS c FROM cover_letter').get() as { c: number }).c;

      const total = apps.length;
      const stageOf = new Map(columns.map((c) => [c.id, c.stage]));
      const rankOf = (a: (typeof apps)[number]) => STAGE_RANK[stageOf.get(a.columnId) ?? 'other'];

      const reached = (lvl: number) => apps.filter((a) => rankOf(a) >= lvl).length;
      const applied = reached(1);
      const interviewed = reached(2);
      const offered = reached(3);
      const rejected = apps.filter((a) => stageOf.get(a.columnId) === 'rejected').length;
      const activePipeline = total - rejected;

      const byColumn = columns.map((c) => {
        const count = apps.filter((a) => a.columnId === c.id).length;
        return { columnId: c.id, name: c.name, color: c.color, count, pct: total ? Math.round((count / total) * 100) : 0 };
      });

      const funnelRaw: { stage: JobStage; label: string; value: number }[] = [
        { stage: 'saved', label: 'Tracked', value: total },
        { stage: 'applied', label: 'Applied', value: applied },
        { stage: 'interview', label: 'Interview', value: interviewed },
        { stage: 'offer', label: 'Offer', value: offered },
      ];
      const funnel = funnelRaw.map((r, i) => ({
        ...r,
        pct: total ? Math.round((r.value / total) * 100) : 0,
        conversion: i > 0 && funnelRaw[i - 1].value ? Math.round((r.value / funnelRaw[i - 1].value) * 100) : null,
      }));

      const rates = {
        responseRate: applied ? Math.round((interviewed / applied) * 100) : 0,
        interviewRate: applied ? Math.round((interviewed / applied) * 100) : 0,
        offerRate: interviewed ? Math.round((offered / interviewed) * 100) : 0,
        overallRate: applied ? Math.round((offered / applied) * 100) : 0,
      };

      // Applications over time (by month).
      const monthMap = new Map<string, { total: number; rejected: number }>();
      for (const a of apps) {
        const key = monthKey(a.appliedDate || a.createdAt);
        if (!key) continue;
        const slot = monthMap.get(key) ?? { total: 0, rejected: 0 };
        slot.total++;
        if (stageOf.get(a.columnId) === 'rejected') slot.rejected++;
        monthMap.set(key, slot);
      }
      const keys = [...monthMap.keys()].sort();
      const multiYear = new Set(keys.map((k) => k.slice(0, 4))).size > 1;
      const overTime = keys.map((k) => {
        const [y, m] = k.split('-');
        const label = MONTH_NAMES_SHORT[Number(m) - 1] + (multiYear ? ` '${y.slice(2)}` : '');
        const s = monthMap.get(k)!;
        return { month: label, total: s.total, rejected: s.rejected };
      });

      // Sources.
      const srcMap = new Map<string, number>();
      let withSource = 0;
      for (const a of apps) {
        const s = (a.source || '').trim();
        if (!s) continue;
        withSource++;
        srcMap.set(s, (srcMap.get(s) ?? 0) + 1);
      }
      const sources = [...srcMap.entries()]
        .map(([source, count]) => ({ source, count, pct: withSource ? Math.round((count / withSource) * 100) : 0 }))
        .sort((a, b) => b.count - a.count);

      const payload: AnalyticsResponse = {
        totals: { applications: total, resumes, coverLetters, columns: columns.length, activePipeline },
        byColumn,
        funnel,
        rates,
        overTime,
        sources,
      };
      res.json(payload);
    }),
  );

  return router;
}
