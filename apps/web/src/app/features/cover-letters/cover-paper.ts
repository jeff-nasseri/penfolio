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
import type { CoverLetterContent, CoverLetterCustomization } from '@penfolio/shared';

const PAGE_W: Record<string, number> = { A4: 794, Letter: 816 };
const PHOTO_SIZE: Record<string, number> = { xs: 48, sm: 60, md: 76, lg: 92, xl: 112 };

interface VmContact {
  label: string;
  text: string;
}

@Component({
  selector: 'app-cover-paper',
  standalone: true,
  templateUrl: './cover-paper.html',
  styleUrl: './cover-paper.scss',
})
export class CoverPaper implements OnChanges, AfterViewInit, OnDestroy {
  private readonly zone = inject(NgZone);

  @Input({ required: true }) content!: CoverLetterContent;
  @Input({ required: true }) customization!: CoverLetterCustomization;
  @Input() rev = 0;
  @Input() fullSize = false;
  @ViewChild('frame') frameRef?: ElementRef<HTMLElement>;
  @ViewChild('paper') paperRef?: ElementRef<HTMLElement>;

  vmContacts: VmContact[] = [];
  vmParagraphs: string[] = [];

  private availWidth = 640;
  private onResize = () => this.measure();

  private get scale(): number {
    if (this.fullSize) return 1;
    return Math.min(1, this.availWidth / this.pageW);
  }
  private get frameHeight(): number {
    return Math.round(this.pageH * this.scale);
  }
  get c(): CoverLetterCustomization {
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
  get fontStack(): string {
    const f = this.c.fontFamily;
    const serif = f === 'Lora' || f === 'Georgia';
    return `'${f}', ${serif ? 'Georgia, serif' : 'system-ui, sans-serif'}`;
  }
  get initials(): string {
    return (this.content.personalDetails.fullName || 'You')
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
  get displayDate(): string {
    return this.content.date || new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  }

  getElement(): HTMLElement | undefined {
    return this.paperRef?.nativeElement;
  }

  ngOnChanges(): void {
    const p = this.content.personalDetails;
    const contacts: VmContact[] = [];
    if (p.email) contacts.push({ label: 'email', text: p.email });
    if (p.phone) contacts.push({ label: 'phone', text: p.phone });
    if (p.location) contacts.push({ label: 'location', text: p.location });
    for (const l of p.links) if (l.label || l.url) contacts.push({ label: l.label, text: l.url || l.label });
    this.vmContacts = contacts;
    this.vmParagraphs = (this.content.body || '')
      .split(/\n{2,}/)
      .map((s) => s.trim())
      .filter(Boolean);
    this.applyStyles();
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
  private applyStyles(): void {
    const frame = this.frameRef?.nativeElement;
    const paper = this.paperRef?.nativeElement;
    if (!frame || !paper) return;
    paper.style.transform = `scale(${this.scale})`;
    frame.style.height = `${this.frameHeight}px`;
  }
}
