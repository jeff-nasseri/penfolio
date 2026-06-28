import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { AnalyticsResponse } from '@penfolio/shared';
import { ApiService } from '../../core/api.service';
import { Icon } from '../../shared/icon';
import { TPipe } from '../../shared/t.pipe';

interface DonutSeg {
  color: string;
  dash: string;
  offset: number;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [RouterLink, Icon, TPipe],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss',
})
export class Analytics implements OnInit {
  private readonly api = inject(ApiService);

  readonly data = signal<AnalyticsResponse | null>(null);
  readonly loading = signal(true);

  // Precomputed view data (stable references → no per-CD churn).
  readonly C = 2 * Math.PI * 54;
  readonly cards = signal<{ label: string; value: string; sub: string; color: string }[]>([]);
  readonly donut = signal<DonutSeg[]>([]);
  readonly maxVol = signal(1);
  readonly maxSrc = signal(1);

  readonly hasApps = computed(() => (this.data()?.totals.applications ?? 0) > 0);

  ngOnInit(): void {
    this.api.getAnalytics().subscribe({
      next: (d) => {
        this.data.set(d);
        this.build(d);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private build(d: AnalyticsResponse): void {
    this.cards.set([
      { label: 'Total tracked', value: String(d.totals.applications), sub: 'across all stages', color: '#8B7BFF' },
      { label: 'Response rate', value: d.rates.responseRate + '%', sub: 'replies per application', color: '#E8B45A' },
      { label: 'Active pipeline', value: String(d.totals.activePipeline), sub: 'still in play', color: '#4ADE80' },
      { label: 'Offer rate', value: d.rates.offerRate + '%', sub: 'offers per interview', color: '#8AA0C2' },
    ]);

    const total = d.totals.applications || 1;
    let acc = 0;
    const segs: DonutSeg[] = [];
    for (const s of d.byColumn.filter((b) => b.count > 0)) {
      const len = (s.count / total) * this.C;
      segs.push({ color: s.color, dash: `${Math.max(len - 3, 1)} ${this.C - Math.max(len - 3, 1)}`, offset: -acc });
      acc += len;
    }
    this.donut.set(segs);
    this.maxVol.set(Math.max(1, ...d.overTime.map((v) => v.total)));
    this.maxSrc.set(Math.max(1, ...d.sources.map((s) => s.count)));
  }

  volH(total: number, rejected: number, active = true): number {
    const v = active ? total - rejected : rejected;
    return Math.round((v / this.maxVol()) * 150);
  }
  srcW(count: number): number {
    return Math.round((count / this.maxSrc()) * 100);
  }
}
