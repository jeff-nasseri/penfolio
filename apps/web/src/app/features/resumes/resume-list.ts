import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import type { ResumeDocument } from '@penfolio/shared';
import { ApiService } from '../../core/api.service';
import { Icon } from '../../shared/icon';
import { ToastService } from '../../shared/toast';
import { ConfirmService } from '../../shared/confirm';
import {
  TEMPLATES,
  type TemplateCategory,
  customizationFor,
  sampleContent,
} from './resume-data';

const CATEGORIES: ('All' | TemplateCategory)[] = ['All', 'Popular', 'Simple', 'Modern', 'Creative'];

@Component({
  selector: 'app-resume-list',
  standalone: true,
  imports: [FormsModule, Icon],
  templateUrl: './resume-list.html',
  styleUrl: './resume-list.scss',
})
export class ResumeList implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  readonly resumes = signal<ResumeDocument[]>([]);
  readonly q = signal('');
  readonly loading = signal(true);
  readonly modalOpen = signal(false);
  readonly category = signal<'All' | TemplateCategory>('All');

  readonly categories = CATEGORIES;
  readonly allTemplates = TEMPLATES;

  readonly templates = computed(() => {
    const cat = this.category();
    return cat === 'All' ? TEMPLATES : TEMPLATES.filter((t) => t.category === cat);
  });

  readonly filtered = computed(() => {
    const ql = this.q().trim().toLowerCase();
    return this.resumes().filter((r) => !ql || r.title.toLowerCase().includes(ql));
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.listResumes().subscribe({
      next: (r) => {
        this.resumes.set(r);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  ago(iso: string): string {
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    if (days < 1) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 30) return `${days} days ago`;
    if (days < 60) return 'a month ago';
    return `${Math.round(days / 30)} months ago`;
  }
  dateLabel(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  open(r: ResumeDocument): void {
    void this.router.navigate(['/resumes', r.id]);
  }

  create(templateId: string): void {
    this.api
      .createResume({
        title: 'Untitled résumé',
        content: sampleContent(),
        customization: customizationFor(templateId),
      })
      .subscribe({
        next: (r) => {
          this.modalOpen.set(false);
          void this.router.navigate(['/resumes', r.id]);
        },
        error: () => this.toast.error('Could not create résumé'),
      });
  }

  duplicate(r: ResumeDocument, ev: Event): void {
    ev.stopPropagation();
    this.api.duplicateResume(r.id).subscribe({
      next: () => {
        this.toast.success('Duplicated');
        this.load();
      },
    });
  }

  download(r: ResumeDocument, ev: Event): void {
    ev.stopPropagation();
    void this.router.navigate(['/resumes', r.id], { queryParams: { print: 1 } });
  }

  async remove(r: ResumeDocument, ev: Event): Promise<void> {
    ev.stopPropagation();
    const ok = await this.confirm.ask({
      title: 'Delete résumé',
      message: `Delete “${r.title}”? This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    this.api.deleteResume(r.id).subscribe({ next: () => this.load() });
  }
}
