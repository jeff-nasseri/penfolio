import { Component, OnDestroy, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  genId,
  type PhotoShape,
  type PhotoSize,
  type ResumeContent,
  type ResumeCustomization,
  type ResumeDocument,
  type ResumeEntry,
  type ResumeSection,
  type SectionType,
} from '@penfolio/shared';
import { ApiService } from '../../core/api.service';
import { Icon } from '../../shared/icon';
import { ToastService } from '../../shared/toast';
import { ConfirmService } from '../../shared/confirm';
import { downloadElementAsPdf } from '../../shared/pdf';
import { ResumePaper } from './resume-paper';
import {
  ACCENT_SWATCHES,
  ADD_SECTION_ORDER,
  FONT_OPTIONS,
  SECTION_ICONS,
  SECTION_META,
  TEMPLATES,
  customizationFor,
  makeEntry,
  normalizeCustomization,
} from './resume-data';

type Tab = 'overview' | 'content' | 'customize';

@Component({
  selector: 'app-resume-editor',
  standalone: true,
  imports: [FormsModule, Icon, ResumePaper, CdkDropList, CdkDrag],
  templateUrl: './resume-editor.html',
  styleUrl: './resume-editor.scss',
})
export class ResumeEditor implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  @ViewChild(ResumePaper) paperCmp?: ResumePaper;

  readonly doc = signal<ResumeDocument | null>(null);
  readonly rev = signal(0);
  readonly tab = signal<Tab>('content');
  readonly open = signal<Set<string>>(new Set());
  readonly addOpen = signal(false);
  readonly fullscreen = signal(false);
  readonly iconPickerFor = signal<string | null>(null);
  readonly saveState = signal<'idle' | 'saving' | 'saved'>('idle');

  readonly fonts = FONT_OPTIONS;
  readonly nameFonts = [{ label: 'Same as body font', value: 'inherit' }, ...FONT_OPTIONS];
  readonly swatches = ACCENT_SWATCHES;
  readonly templates = TEMPLATES;
  readonly sectionMeta = SECTION_META;
  readonly sectionIcons = SECTION_ICONS;
  readonly addItems = ADD_SECTION_ORDER.map((t) => ({ type: t, ...SECTION_META[t] }));

  // Stable references for template @for loops (never inline array literals in a
  // template — they are re-created every change-detection pass).
  readonly levels = [1, 2, 3, 4, 5];
  readonly headerPositions: ('top' | 'left' | 'right')[] = ['top', 'left', 'right'];
  readonly headerAligns: ('left' | 'center')[] = ['left', 'center'];
  readonly detailsLayouts: ('stack' | 'inline' | 'grid')[] = ['stack', 'inline', 'grid'];
  readonly photoPositions: ('left' | 'top' | 'right')[] = ['left', 'top', 'right'];
  readonly photoShapes: PhotoShape[] = ['circle', 'squircle', 'rounded', 'soft', 'square'];
  readonly photoSizes: PhotoSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  readonly accentKeys: [keyof ResumeCustomization['accent'], string][] = [
    ['name', 'Name'],
    ['jobTitle', 'Job title'],
    ['headings', 'Headings'],
    ['headingLine', 'Headings line'],
    ['headerIcons', 'Header icons'],
    ['dates', 'Dates'],
    ['links', 'Link icons'],
    ['dotsBarsBubbles', 'Dots/bars/bubbles'],
    ['entrySubtitle', 'Entry subtitle'],
  ];

  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private printAfterLoad = false;

  readonly content = computed<ResumeContent | null>(() => this.doc()?.content ?? null);
  readonly cz = computed<ResumeCustomization | null>(() => this.doc()?.customization ?? null);

  // Overview health metrics
  readonly health = computed(() => {
    const d = this.doc();
    if (!d) return [];
    const p = d.content.personalDetails;
    const filled = [p.fullName, p.jobTitle, p.email, p.phone, p.location].filter(Boolean).length;
    const contactPct = Math.round((filled / 5) * 100);
    const sections = d.content.sections.filter((s) => s.visible).length;
    const sectionPct = Math.min(100, Math.round((sections / 6) * 100));
    const entries = d.content.sections.reduce((n, s) => n + s.entries.length, 0);
    const wordCount = d.content.sections
      .flatMap((s) => s.entries.map((e) => e.description))
      .join(' ')
      .split(/\s+/)
      .filter(Boolean).length;
    const contentPct = Math.min(100, Math.round((wordCount / 250) * 100));
    return [
      { label: 'Header completeness', val: `${filled}/5`, pct: contactPct },
      { label: 'Sections', val: String(sections), pct: sectionPct },
      { label: 'Detail (≈250 words)', val: `${wordCount} words`, pct: contentPct },
      { label: 'Total entries', val: String(entries), pct: Math.min(100, entries * 10) },
    ];
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.printAfterLoad = this.route.snapshot.queryParamMap.get('print') === '1';
    this.api.getResume(id).subscribe({
      next: (d) => {
        d.customization = normalizeCustomization(d.customization); // backfill new fields
        this.doc.set(d);
        if (d.content.sections.length) this.open.set(new Set([d.content.sections[0].id]));
        if (this.printAfterLoad) setTimeout(() => this.download(), 700);
      },
      error: () => {
        this.toast.error('Résumé not found');
        void this.router.navigate(['/resumes']);
      },
    });
  }
  ngOnDestroy(): void {
    if (this.saveTimer) clearTimeout(this.saveTimer);
  }

  // ---- Persistence ----
  touch(): void {
    this.rev.update((v) => v + 1); // tells the preview to recompute its view-model
    this.saveState.set('saving');
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.save(), 800);
  }
  save(): void {
    const d = this.doc();
    if (!d) return;
    this.api
      .updateResume(d.id, { title: d.title, tag: d.tag, content: d.content, customization: d.customization })
      .subscribe({
        next: () => this.saveState.set('saved'),
        error: () => this.toast.error('Save failed'),
      });
  }

  readonly downloading = signal(false);
  async download(): Promise<void> {
    const d = this.doc();
    const el = this.paperCmp?.getElement();
    if (!d || !el || this.downloading()) return;
    this.downloading.set(true);
    try {
      const name = (d.title || 'resume').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      await downloadElementAsPdf(el, `${name}.pdf`, d.customization.pageFormat);
    } catch {
      this.toast.error('Could not generate the PDF');
    } finally {
      this.downloading.set(false);
    }
  }

  // ---- Section icon picker ----
  openIconPicker(sectionId: string): void {
    this.iconPickerFor.set(this.iconPickerFor() === sectionId ? null : sectionId);
  }
  setSectionIcon(s: ResumeSection, icon: string): void {
    s.icon = icon;
    this.doc.set({ ...this.doc()! });
    this.touch();
  }
  iconOf(s: ResumeSection): string {
    return s.icon || this.sectionMeta[s.type].icon;
  }

  back(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.save();
    }
    void this.router.navigate(['/resumes']);
  }

  // ---- Accordion ----
  isOpen(id: string): boolean {
    return this.open().has(id);
  }
  toggleOpen(id: string): void {
    const s = new Set(this.open());
    s.has(id) ? s.delete(id) : s.add(id);
    this.open.set(s);
  }

  // ---- Sections ----
  addSection(type: SectionType): void {
    const d = this.doc();
    if (!d) return;
    const sec: ResumeSection = {
      id: genId('s'),
      type,
      name: SECTION_META[type].label,
      visible: true,
      entries: [makeEntry({ title: type === 'profile' ? 'Summary' : 'New entry' })],
    };
    d.content.sections.push(sec);
    this.open.update((s) => new Set(s).add(sec.id));
    this.addOpen.set(false);
    this.touch();
  }
  async removeSection(s: ResumeSection): Promise<void> {
    const d = this.doc();
    if (!d) return;
    const ok = await this.confirm.ask({
      title: 'Remove section',
      message: `Remove the “${s.name}” section and its entries?`,
      confirmLabel: 'Remove',
      danger: true,
    });
    if (!ok) return;
    d.content.sections = d.content.sections.filter((x) => x.id !== s.id);
    this.doc.set({ ...d });
    this.touch();
  }
  dropSection(ev: CdkDragDrop<ResumeSection[]>): void {
    const d = this.doc();
    if (!d) return;
    moveItemInArray(d.content.sections, ev.previousIndex, ev.currentIndex);
    this.doc.set({ ...d });
    this.touch();
  }

  // ---- Entries ----
  addEntry(s: ResumeSection): void {
    s.entries.push(makeEntry({ title: 'New entry' }));
    this.doc.set({ ...this.doc()! });
    this.touch();
  }
  removeEntry(s: ResumeSection, e: ResumeEntry): void {
    s.entries = s.entries.filter((x) => x.id !== e.id);
    this.doc.set({ ...this.doc()! });
    this.touch();
  }
  toggleEntry(e: ResumeEntry): void {
    e.visible = !e.visible;
    this.doc.set({ ...this.doc()! });
    this.touch();
  }
  dropEntry(ev: CdkDragDrop<ResumeEntry[]>, s: ResumeSection): void {
    moveItemInArray(s.entries, ev.previousIndex, ev.currentIndex);
    this.doc.set({ ...this.doc()! });
    this.touch();
  }

  // tags <-> comma string
  tagsOf(e: ResumeEntry): string {
    return e.tags.join(', ');
  }
  setTags(e: ResumeEntry, val: string): void {
    e.tags = val
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    this.touch();
  }
  setLevel(e: ResumeEntry, lvl: number): void {
    e.level = e.level === lvl ? lvl - 1 : lvl;
    this.doc.set({ ...this.doc()! });
    this.touch();
  }

  // ---- Personal details ----
  addLink(): void {
    this.doc()!.content.personalDetails.links.push({ id: genId('l'), label: 'Website', url: '' });
    this.doc.set({ ...this.doc()! });
    this.touch();
  }
  removeLink(id: string): void {
    const p = this.doc()!.content.personalDetails;
    p.links = p.links.filter((l) => l.id !== id);
    this.doc.set({ ...this.doc()! });
    this.touch();
  }
  addField(): void {
    this.doc()!.content.personalDetails.customFields.push({ id: genId('f'), label: 'Label', value: '' });
    this.doc.set({ ...this.doc()! });
    this.touch();
  }
  removeField(id: string): void {
    const p = this.doc()!.content.personalDetails;
    p.customFields = p.customFields.filter((f) => f.id !== id);
    this.doc.set({ ...this.doc()! });
    this.touch();
  }
  onPhoto(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.doc()!.content.personalDetails.photo = reader.result as string;
      if (!this.doc()!.customization.photo.show) this.doc()!.customization.photo.show = true;
      this.doc.set({ ...this.doc()! });
      this.touch();
    };
    reader.readAsDataURL(file);
  }
  clearPhoto(): void {
    this.doc()!.content.personalDetails.photo = null;
    this.doc.set({ ...this.doc()! });
    this.touch();
  }

  // ---- Customization ----
  applyTemplate(id: string): void {
    const d = this.doc();
    if (!d) return;
    // Keep the user's accent/colour preferences? FlowCV applies the whole look.
    d.customization = { ...customizationFor(id) };
    this.doc.set({ ...d });
    this.touch();
  }
  set<K extends keyof ResumeCustomization>(key: K, val: ResumeCustomization[K]): void {
    const d = this.doc();
    if (!d) return;
    (d.customization[key] as ResumeCustomization[K]) = val;
    this.doc.set({ ...d });
    this.touch();
  }
  toggleAccent(key: keyof ResumeCustomization['accent']): void {
    const d = this.doc();
    if (!d) return;
    d.customization.accent[key] = !d.customization.accent[key];
    this.doc.set({ ...d });
    this.touch();
  }
}
