import { genId, type CoverLetterContent, type CoverLetterCustomization } from '@penfolio/shared';

export const COVER_FONTS = [
  { label: 'Inter (sans)', value: 'Inter' },
  { label: 'Manrope (sans)', value: 'Manrope' },
  { label: 'Lora (serif)', value: 'Lora' },
  { label: 'Georgia (serif)', value: 'Georgia' },
];

export const COVER_ACCENTS = [
  '#2563B8', '#6557E8', '#1D4ED8', '#0F766E', '#0E7490',
  '#B45309', '#B91C1C', '#BE185D', '#7C3AED', '#15803D',
  '#14532D', '#1E3A5F', '#334155', '#475569', '#111827',
];

export interface CoverTemplate {
  id: string;
  name: string;
  headerColor: string;
  customization: Partial<CoverLetterCustomization>;
}

function defaults(): CoverLetterCustomization {
  return {
    template: 'classic',
    accentColor: '#2563B8',
    fontFamily: 'Inter',
    fontScale: 1,
    lineSpacing: 1.5,
    headerPosition: 'top',
    headerAlignment: 'left',
    photo: { show: false, shape: 'circle', size: 'md', position: 'left', grayscale: false },
    pageFormat: 'A4',
  };
}

/** Backfill missing fields on a stored cover-letter customization. */
export function normalizeCoverCustomization(
  c: Partial<CoverLetterCustomization> | null | undefined,
): CoverLetterCustomization {
  const d = defaults();
  const cz = c ?? {};
  return { ...d, ...cz, photo: { ...d.photo, ...(cz.photo ?? {}) } };
}

export const COVER_TEMPLATES: CoverTemplate[] = [
  { id: 'classic', name: 'Classic', headerColor: '#2563B8', customization: { accentColor: '#2563B8', fontFamily: 'Inter', headerAlignment: 'left' } },
  { id: 'centered', name: 'Centered', headerColor: '#6557E8', customization: { accentColor: '#6557E8', fontFamily: 'Inter', headerAlignment: 'center' } },
  { id: 'serif', name: 'Editorial', headerColor: '#111827', customization: { accentColor: '#111827', fontFamily: 'Lora', headerAlignment: 'left' } },
  { id: 'teal', name: 'Modern Teal', headerColor: '#0F766E', customization: { accentColor: '#0F766E', fontFamily: 'Inter', headerAlignment: 'left' } },
  { id: 'amber', name: 'Warm', headerColor: '#B45309', customization: { accentColor: '#B45309', fontFamily: 'Lora', headerAlignment: 'left' } },
  { id: 'slate', name: 'Slate', headerColor: '#475569', customization: { accentColor: '#475569', fontFamily: 'Inter', headerAlignment: 'left' } },
];

export function coverCustomizationFor(id: string): CoverLetterCustomization {
  const tpl = COVER_TEMPLATES.find((t) => t.id === id) ?? COVER_TEMPLATES[0];
  const base = defaults();
  return { ...base, ...tpl.customization, template: tpl.id, photo: { ...base.photo, ...(tpl.customization.photo ?? {}) } };
}

export function sampleCoverContent(): CoverLetterContent {
  return {
    personalDetails: {
      fullName: 'Your Name',
      jobTitle: 'Your Title',
      email: 'you@example.com',
      phone: '+1 555 0100',
      location: 'City, Country',
      photo: null,
      links: [{ id: genId('l'), label: 'LinkedIn', url: 'https://linkedin.com/in/you' }],
      customFields: [],
    },
    recipientName: 'Hiring Team',
    recipientCompany: 'Company Name',
    recipientAddress: 'City',
    date: '',
    subject: 'Application for the Role',
    greeting: 'Dear Hiring Team,',
    body:
      "I'm writing to express my strong interest in the role at your company. With a background in my field and a track record of delivering results, I believe I would be a great fit for your team.\n\n" +
      'In my previous roles I have consistently improved outcomes, collaborated across teams, and taken ownership of important initiatives. I am especially drawn to your company because of its mission and the opportunity to make a real impact.\n\n' +
      'I would welcome the chance to discuss how my experience aligns with your needs. Thank you for considering my application.',
    closing: 'Kind regards,',
    signature: { fullName: 'Your Name', place: 'City', date: '' },
    syncedResumeId: null,
  };
}
