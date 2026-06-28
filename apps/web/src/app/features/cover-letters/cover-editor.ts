import { Component, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import type { CoverLetterCustomization, CoverLetterDocument, ResumeDocument } from '@penfolio/shared';
import { ApiService } from '../../core/api.service';
import { Icon } from '../../shared/icon';
import { ToastService } from '../../shared/toast';
import { downloadElementAsPdf } from '../../shared/pdf';
import { CoverPaper } from './cover-paper';
import {
  COVER_ACCENTS,
  COVER_FONTS,
  COVER_TEMPLATES,
  coverCustomizationFor,
  normalizeCoverCustomization,
} from './cover-data';

type Tab = 'overview' | 'write' | 'customize';

@Component({
  selector: 'app-cover-editor',
  standalone: true,
  imports: [FormsModule, Icon, CoverPaper],
  templateUrl: './cover-editor.html',
  styleUrl: './cover-editor.scss',
})
export class CoverEditor implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  @ViewChild(CoverPaper) paperCmp?: CoverPaper;

  readonly doc = signal<CoverLetterDocument | null>(null);
  readonly rev = signal(0);
  readonly tab = signal<Tab>('write');
  readonly saveState = signal<'idle' | 'saving' | 'saved'>('idle');
  readonly downloading = signal(false);
  readonly fullscreen = signal(false);
  readonly resumes = signal<ResumeDocument[]>([]);

  readonly fonts = COVER_FONTS;
  readonly swatches = COVER_ACCENTS;
  readonly templates = COVER_TEMPLATES;
  readonly aligns: ('left' | 'center')[] = ['left', 'center'];
  readonly photoShapes: ('circle' | 'squircle' | 'rounded' | 'soft' | 'square')[] = ['circle', 'squircle', 'rounded', 'soft', 'square'];
  readonly photoSizes: ('xs' | 'sm' | 'md' | 'lg' | 'xl')[] = ['xs', 'sm', 'md', 'lg', 'xl'];

  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private printAfterLoad = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.printAfterLoad = this.route.snapshot.queryParamMap.get('print') === '1';
    this.api.listResumes().subscribe({ next: (r) => this.resumes.set(r) });
    this.api.getCoverLetter(id).subscribe({
      next: (d) => {
        d.customization = normalizeCoverCustomization(d.customization);
        this.doc.set(d);
        if (this.printAfterLoad) setTimeout(() => this.download(), 700);
      },
      error: () => {
        this.toast.error('Cover letter not found');
        void this.router.navigate(['/cover-letters']);
      },
    });
  }
  ngOnDestroy(): void {
    if (this.saveTimer) clearTimeout(this.saveTimer);
  }

  touch(): void {
    this.rev.update((v) => v + 1);
    this.saveState.set('saving');
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.save(), 800);
  }
  save(): void {
    const d = this.doc();
    if (!d) return;
    this.api
      .updateCoverLetter(d.id, { title: d.title, tag: d.tag, content: d.content, customization: d.customization })
      .subscribe({ next: () => this.saveState.set('saved'), error: () => this.toast.error('Save failed') });
  }
  async download(): Promise<void> {
    const d = this.doc();
    const el = this.paperCmp?.getElement();
    if (!d || !el || this.downloading()) return;
    this.downloading.set(true);
    try {
      const name = (d.title || 'cover-letter').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      await downloadElementAsPdf(el, `${name}.pdf`, d.customization.pageFormat);
    } catch {
      this.toast.error('Could not generate the PDF');
    } finally {
      this.downloading.set(false);
    }
  }
  back(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.save();
    }
    void this.router.navigate(['/cover-letters']);
  }

  applyTemplate(id: string): void {
    const d = this.doc();
    if (!d) return;
    d.customization = { ...coverCustomizationFor(id) };
    this.doc.set({ ...d });
    this.touch();
  }
  set<K extends keyof CoverLetterCustomization>(key: K, val: CoverLetterCustomization[K]): void {
    const d = this.doc();
    if (!d) return;
    (d.customization[key] as CoverLetterCustomization[K]) = val;
    this.doc.set({ ...d });
    this.touch();
  }

  syncResume(resumeId: number | null): void {
    const d = this.doc();
    if (!d) return;
    d.content.syncedResumeId = resumeId;
    if (resumeId) {
      const r = this.resumes().find((x) => x.id === resumeId);
      if (r?.content?.personalDetails) {
        d.content.personalDetails = JSON.parse(JSON.stringify(r.content.personalDetails));
        d.content.signature.fullName = r.content.personalDetails.fullName;
      }
    }
    this.doc.set({ ...d });
    this.touch();
    this.toast.success(resumeId ? 'Synced with résumé' : 'Sync removed');
  }
  syncedResumeTitle(): string {
    const id = this.doc()?.content.syncedResumeId;
    return this.resumes().find((r) => r.id === id)?.title ?? '';
  }

  onPhoto(ev: Event): void {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const d = this.doc()!;
      d.content.personalDetails.photo = reader.result as string;
      d.customization.photo.show = true;
      this.doc.set({ ...d });
      this.touch();
    };
    reader.readAsDataURL(file);
  }
}
