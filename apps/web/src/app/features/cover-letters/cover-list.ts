import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import type { CoverLetterDocument } from '@penfolio/shared';
import { ApiService } from '../../core/api.service';
import { Icon } from '../../shared/icon';
import { ToastService } from '../../shared/toast';
import { ConfirmService } from '../../shared/confirm';
import { TPipe } from '../../shared/t.pipe';
import { COVER_TEMPLATES, coverCustomizationFor, sampleCoverContent } from './cover-data';

@Component({
  selector: 'app-cover-list',
  standalone: true,
  imports: [FormsModule, Icon, TPipe],
  templateUrl: './cover-list.html',
  styleUrl: './cover-list.scss',
})
export class CoverList implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  readonly letters = signal<CoverLetterDocument[]>([]);
  readonly q = signal('');
  readonly loading = signal(true);
  readonly modalOpen = signal(false);
  readonly templates = COVER_TEMPLATES;

  readonly filtered = computed(() => {
    const ql = this.q().trim().toLowerCase();
    return this.letters().filter((l) => !ql || l.title.toLowerCase().includes(ql));
  });

  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.api.listCoverLetters().subscribe({
      next: (l) => {
        this.letters.set(l);
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
    return `${Math.round(days / 30)} months ago`;
  }
  preview(l: CoverLetterDocument): string {
    return (l.content?.body || '').slice(0, 120);
  }
  open(l: CoverLetterDocument): void {
    void this.router.navigate(['/cover-letters', l.id]);
  }
  create(templateId: string): void {
    this.api
      .createCoverLetter({ title: 'Untitled letter', content: sampleCoverContent(), customization: coverCustomizationFor(templateId) })
      .subscribe({
        next: (l) => {
          this.modalOpen.set(false);
          void this.router.navigate(['/cover-letters', l.id]);
        },
        error: () => this.toast.error('Could not create letter'),
      });
  }
  duplicate(l: CoverLetterDocument, ev: Event): void {
    ev.stopPropagation();
    this.api.duplicateCoverLetter(l.id).subscribe({ next: () => { this.toast.success('Duplicated'); this.load(); } });
  }
  async remove(l: CoverLetterDocument, ev: Event): Promise<void> {
    ev.stopPropagation();
    const ok = await this.confirm.ask({ title: 'Delete cover letter', message: `Delete “${l.title}”?`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    this.api.deleteCoverLetter(l.id).subscribe({ next: () => this.load() });
  }
}
