import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  MONTH_NAMES_SHORT,
  type ResumeContent,
  type ResumeCustomization,
  type ResumeEntry,
  type ResumeSection,
} from '@penfolio/shared';

const PAGE_W: Record<string, number> = { A4: 794, Letter: 816 };
const PHOTO_SIZE: Record<string, number> = { sm: 64, md: 92, lg: 120 };

interface VmEntry {
  e: ResumeEntry;
  date: string;
  desc: SafeHtml;
  chips: string[];
}
interface VmSection {
  s: ResumeSection;
  entries: VmEntry[];
}
interface VmContact {
  label: string;
  text: string;
  url: string;
}

/**
 * Renders the résumé "paper". Inputs are mutated in place by the editor, so the
 * view-model is recomputed only when `rev` (a change counter bumped on every
 * edit) changes — NOT on every change-detection pass. Returning fresh arrays /
 * SafeHtml from template-bound getters would thrash `@for` and `[innerHTML]`
 * and peg the CPU, so all derived data is precomputed into stable fields here.
 */
@Component({
  selector: 'app-resume-paper',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './resume-paper.html',
  styleUrl: './resume-paper.scss',
})
export class ResumePaper implements OnChanges, AfterViewInit, OnDestroy {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly zone = inject(NgZone);

  @Input({ required: true }) content!: ResumeContent;
  @Input({ required: true }) customization!: ResumeCustomization;
  @Input() rev = 0;
  @ViewChild('frame') frameRef?: ElementRef<HTMLElement>;
  @ViewChild('paper') paperRef?: ElementRef<HTMLElement>;

  readonly dots = [1, 2, 3, 4, 5];

  vmSections: VmSection[] = [];
  vmContacts: VmContact[] = [];

  private availWidth = 640;
  private onResize = () => this.measure();

  private get scale(): number {
    return Math.min(1, this.availWidth / this.pageW);
  }
  private get frameHeight(): number {
    return Math.round(this.pageH * this.scale);
  }
  get c(): ResumeCustomization {
    return this.customization;
  }
  get pageW(): number {
    return PAGE_W[this.c.pageFormat] ?? PAGE_W['A4'];
  }
  get pageH(): number {
    return Math.round(this.pageW * (this.c.pageFormat === 'Letter' ? 11 / 8.5 : 297 / 210));
  }
  get photoPx(): number {
    return PHOTO_SIZE[this.c.photo.size] ?? PHOTO_SIZE['md'];
  }
  get isSide(): boolean {
    return this.c.headerPosition === 'left' || this.c.headerPosition === 'right';
  }
  get fontStack(): string {
    const f = this.c.fontFamily;
    const serif = f === 'Lora' || f === 'Georgia';
    return `'${f}', ${serif ? 'Georgia, serif' : 'system-ui, sans-serif'}`;
  }
  get accentTint(): string {
    return this.c.accentColor + '12';
  }
  get initials(): string {
    return (this.content.personalDetails.fullName || 'You')
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  ngOnChanges(): void {
    this.rebuild();
    // page format may have changed → re-apply scale imperatively (not via a
    // binding, to avoid NG0100 from the async-measured width).
    this.applyStyles();
  }

  private rebuild(): void {
    const p = this.content.personalDetails;
    const contacts: VmContact[] = [];
    if (p.email) contacts.push({ label: 'email', text: p.email, url: 'mailto:' + p.email });
    if (p.phone) contacts.push({ label: 'phone', text: p.phone, url: '' });
    if (p.location) contacts.push({ label: 'location', text: p.location, url: '' });
    for (const l of p.links) if (l.label || l.url) contacts.push({ label: l.label, text: l.label, url: l.url });
    for (const f of p.customFields) if (f.label || f.value) contacts.push({ label: f.label, text: `${f.label}: ${f.value}`, url: '' });
    this.vmContacts = contacts;

    this.vmSections = (this.content.sections || [])
      .filter((s) => s.visible)
      .map((s) => ({
        s,
        entries: s.entries
          .filter((e) => e.visible && (e.title || e.subtitle || e.description || e.tags.length))
          .map((e) => ({
            e,
            date: this.dateRange(e),
            desc: this.descHtml(e.description),
            chips: e.tags.length ? e.tags : e.title ? [e.title] : [],
          })),
      }))
      .filter((vs) => vs.entries.length > 0);
  }

  private fmt(d: string): string {
    if (!d) return '';
    const m = /^(\d{4})-(\d{2})/.exec(d);
    if (m) return `${MONTH_NAMES_SHORT[Number(m[2]) - 1]} ${m[1]}`;
    const y = /^(\d{4})$/.exec(d);
    if (y) return y[1];
    return d;
  }
  private dateRange(e: ResumeEntry): string {
    const start = this.fmt(e.startDate);
    const end = e.current ? 'Present' : this.fmt(e.endDate);
    if (start && end) return `${start} – ${end}`;
    return start || end || '';
  }
  private descHtml(text: string): SafeHtml {
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const bold = (s: string) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    const lines = (text || '').split('\n');
    let html = '';
    let inList = false;
    for (const raw of lines) {
      const line = raw.trim();
      if (line.startsWith('- ') || line.startsWith('• ')) {
        if (!inList) {
          html += '<ul>';
          inList = true;
        }
        html += `<li>${bold(line.slice(2))}</li>`;
      } else {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        if (line) html += `<p>${bold(line)}</p>`;
      }
    }
    if (inList) html += '</ul>';
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      window.addEventListener('resize', this.onResize);
      this.measure();
      setTimeout(() => this.measure(), 0);
      setTimeout(() => this.measure(), 300);
    });
  }
  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
  }
  private measure(): void {
    const el = this.frameRef?.nativeElement;
    if (!el) return;
    const w = el.clientWidth;
    if (w) this.availWidth = w;
    this.applyStyles();
  }
  /** Apply the scale + frame height directly to the DOM (no Angular bindings,
   * so change detection never sees a mid-cycle value change). */
  private applyStyles(): void {
    const frame = this.frameRef?.nativeElement;
    const paper = this.paperRef?.nativeElement;
    if (!frame || !paper) return;
    paper.style.transform = `scale(${this.scale})`;
    frame.style.height = `${this.frameHeight}px`;
  }
}
