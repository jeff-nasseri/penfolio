import {
  genId,
  type ResumeContent,
  type ResumeCustomization,
  type ResumeSection,
  type SectionType,
} from '@penfolio/shared';

/* ------------------------------------------------------------------ */
/* Fonts & accent swatches                                            */
/* ------------------------------------------------------------------ */

export const FONT_OPTIONS = [
  { label: 'Inter (sans)', value: 'Inter' },
  { label: 'Manrope (sans)', value: 'Manrope' },
  { label: 'Lora (serif)', value: 'Lora' },
  { label: 'Georgia (serif)', value: 'Georgia' },
];

export const ACCENT_SWATCHES = [
  '#2563B8', '#6557E8', '#1D4ED8', '#0F766E', '#0E7490',
  '#B45309', '#B91C1C', '#BE185D', '#7C3AED', '#15803D',
  '#14532D', '#1E3A5F', '#334155', '#475569', '#111827',
];

/* ------------------------------------------------------------------ */
/* Section metadata (icons + labels for the editor / add-content)     */
/* ------------------------------------------------------------------ */

export interface SectionMeta {
  type: SectionType;
  label: string;
  icon: string;
  desc: string;
}

export const SECTION_META: Record<SectionType, { label: string; icon: string; desc: string }> = {
  profile: { label: 'Profile', icon: 'profile', desc: 'A short professional summary.' },
  experience: { label: 'Professional Experience', icon: 'briefcase', desc: 'Your roles and employment history.' },
  education: { label: 'Education', icon: 'cap', desc: 'Degrees, schools and study focus.' },
  skills: { label: 'Skills', icon: 'puzzle', desc: 'Hard and soft skills, with levels.' },
  languages: { label: 'Languages', icon: 'globe', desc: 'Languages and proficiency.' },
  certificates: { label: 'Certificates', icon: 'badge', desc: 'Industry certificates and licenses.' },
  courses: { label: 'Courses', icon: 'book', desc: 'Online or in-person courses.' },
  projects: { label: 'Projects', icon: 'folder', desc: 'Side projects and case studies.' },
  awards: { label: 'Awards', icon: 'trophy', desc: 'Awards and recognitions.' },
  publications: { label: 'Publications', icon: 'book-open', desc: 'Articles, papers and books.' },
  organizations: { label: 'Organizations', icon: 'building', desc: 'Memberships and volunteering.' },
  references: { label: 'References', icon: 'people', desc: 'References from managers or peers.' },
  interests: { label: 'Interests', icon: 'heart', desc: 'Hobbies and personal interests.' },
  declaration: { label: 'Declaration', icon: 'signature', desc: 'A declaration or signature line.' },
  custom: { label: 'Custom', icon: 'star', desc: 'Anything else — a custom section.' },
};

/** Order shown in the "Add content" modal. */
export const ADD_SECTION_ORDER: SectionType[] = [
  'education', 'experience', 'skills', 'languages', 'certificates', 'interests',
  'projects', 'courses', 'awards', 'organizations', 'publications', 'references',
  'profile', 'declaration', 'custom',
];

/* ------------------------------------------------------------------ */
/* Templates                                                          */
/* ------------------------------------------------------------------ */

export type TemplateCategory = 'Popular' | 'Simple' | 'Modern' | 'Creative';

export interface ResumeTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  /** small visual hints for the picker tile. */
  headerColor: string;
  customization: Partial<Omit<ResumeCustomization, 'photo' | 'accent' | 'link' | 'footer'>> & {
    photo?: Partial<ResumeCustomization['photo']>;
    accent?: Partial<ResumeCustomization['accent']>;
    link?: Partial<ResumeCustomization['link']>;
    footer?: Partial<ResumeCustomization['footer']>;
  };
}

export function defaultCustomization(): ResumeCustomization {
  return {
    template: 'classic-clear',
    accentColor: '#2563B8',
    fontFamily: 'Inter',
    nameFont: 'inherit',
    fontScale: 1,
    lineSpacing: 1.4,
    sectionSpacing: 18,
    headerPosition: 'top',
    headerAlignment: 'left',
    headerDetailsLayout: 'inline',
    columns: 1,
    headingUppercase: true,
    photo: { show: false, shape: 'circle', size: 'md', position: 'left', grayscale: false },
    accent: {
      name: true,
      jobTitle: false,
      headings: true,
      headingLine: true,
      headerIcons: true,
      dates: false,
      links: true,
      dotsBarsBubbles: true,
      entrySubtitle: true,
    },
    link: { underline: false, coloured: true, showIcon: true, iconStyle: 'external' },
    footer: { pageNumbers: false, email: false, name: false },
    pageFormat: 'A4',
    dateFormat: 'MMM YYYY',
  };
}

/**
 * Fill any fields missing from a stored customization (older résumés) with the
 * current defaults, so the editor and preview never read undefined.
 */
export function normalizeCustomization(c: Partial<ResumeCustomization> | null | undefined): ResumeCustomization {
  const d = defaultCustomization();
  const cz = c ?? {};
  return {
    ...d,
    ...cz,
    photo: { ...d.photo, ...(cz.photo ?? {}) },
    accent: { ...d.accent, ...(cz.accent ?? {}) },
    link: { ...d.link, ...(cz.link ?? {}) },
    footer: { ...d.footer, ...(cz.footer ?? {}) },
  };
}

/** Icons offered in the per-section icon picker (must be valid Icon names). */
export const SECTION_ICONS = [
  'profile', 'briefcase', 'cap', 'badge', 'flame', 'puzzle', 'globe', 'people',
  'heart', 'folder', 'book', 'book-open', 'trophy', 'building', 'pen', 'code',
  'signature', 'star', 'sparkle', 'database', 'site', 'link',
];

const defaults = defaultCustomization;

export const TEMPLATES: ResumeTemplate[] = [
  { id: 'classic-clear', name: 'Classic Clear', category: 'Popular', headerColor: '#2563B8', customization: { accentColor: '#2563B8', fontFamily: 'Inter', headerPosition: 'top', columns: 1 } },
  { id: 'atlantic-blue', name: 'Atlantic Blue', category: 'Modern', headerColor: '#1E3A5F', customization: { accentColor: '#1E3A5F', fontFamily: 'Lora', headerPosition: 'left', photo: { show: true, shape: 'rounded', size: 'md', grayscale: false } } },
  { id: 'mercury-flow', name: 'Mercury Flow', category: 'Modern', headerColor: '#6557E8', customization: { accentColor: '#6557E8', fontFamily: 'Inter', headerPosition: 'top', headerAlignment: 'center', photo: { show: true, shape: 'circle', size: 'md', grayscale: false } } },
  { id: 'steady-form', name: 'Steady Form', category: 'Simple', headerColor: '#0F766E', customization: { accentColor: '#0F766E', fontFamily: 'Inter', headerPosition: 'top', columns: 2 } },
  { id: 'editorial-rule', name: 'Editorial Rule', category: 'Creative', headerColor: '#111827', customization: { accentColor: '#111827', fontFamily: 'Lora', headerPosition: 'top', columns: 1 } },
  { id: 'precision-line', name: 'Precision Line', category: 'Simple', headerColor: '#2563B8', customization: { accentColor: '#2563B8', fontFamily: 'Inter', headerPosition: 'top', columns: 2 } },
  { id: 'true-blue', name: 'True Blue', category: 'Popular', headerColor: '#1D4ED8', customization: { accentColor: '#1D4ED8', fontFamily: 'Inter', headerPosition: 'left', photo: { show: true, shape: 'circle', size: 'md', grayscale: false } } },
  { id: 'saffron-line', name: 'Saffron Line', category: 'Creative', headerColor: '#B45309', customization: { accentColor: '#B45309', fontFamily: 'Lora', headerPosition: 'top', columns: 1 } },
  { id: 'quicksilver', name: 'Quicksilver', category: 'Modern', headerColor: '#475569', customization: { accentColor: '#475569', fontFamily: 'Inter', headerPosition: 'top', columns: 2, photo: { show: true, shape: 'rounded', size: 'md', grayscale: false } } },
  { id: 'hunter-green', name: 'Hunter Green', category: 'Creative', headerColor: '#14532D', customization: { accentColor: '#14532D', fontFamily: 'Lora', headerPosition: 'left', photo: { show: true, shape: 'rounded', size: 'md', grayscale: false } } },
];

export function customizationFor(templateId: string): ResumeCustomization {
  const tpl = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];
  const base = defaults();
  return {
    ...base,
    ...tpl.customization,
    template: tpl.id,
    photo: { ...base.photo, ...(tpl.customization.photo ?? {}) },
    accent: { ...base.accent, ...(tpl.customization.accent ?? {}) },
    link: { ...base.link, ...(tpl.customization.link ?? {}) },
    footer: { ...base.footer, ...(tpl.customization.footer ?? {}) },
  };
}

/* ------------------------------------------------------------------ */
/* Default / empty content                                            */
/* ------------------------------------------------------------------ */

function entry(over: Partial<ResumeSection['entries'][number]>): ResumeSection['entries'][number] {
  return {
    id: genId('e'),
    visible: true,
    title: '',
    subtitle: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    level: 0,
    tags: [],
    url: '',
    ...over,
  };
}

export function emptySection(type: SectionType): ResumeSection {
  return {
    id: genId('s'),
    type,
    name: SECTION_META[type].label,
    visible: true,
    entries: [entry({ title: type === 'profile' ? '' : 'New entry' })],
  };
}

export function emptyContent(): ResumeContent {
  return {
    personalDetails: {
      fullName: '',
      jobTitle: '',
      email: '',
      phone: '',
      location: '',
      photo: null,
      links: [],
      customFields: [],
    },
    sections: [
      { id: genId('s'), type: 'profile', name: 'Profile', visible: true, entries: [entry({ title: 'Summary' })] },
      { id: genId('s'), type: 'experience', name: 'Professional Experience', visible: true, entries: [entry({ title: 'Role', subtitle: 'Company' })] },
      { id: genId('s'), type: 'education', name: 'Education', visible: true, entries: [entry({ title: 'Degree', subtitle: 'Institution' })] },
      { id: genId('s'), type: 'skills', name: 'Skills', visible: true, entries: [entry({ title: 'Skill group', tags: [] })] },
    ],
  };
}

/** A pre-filled sample résumé, used for the "New blank" → starter content. */
export function sampleContent(): ResumeContent {
  return {
    personalDetails: {
      fullName: 'Your Name',
      jobTitle: 'Your Title',
      email: 'you@example.com',
      phone: '+1 555 0100',
      location: 'City, Country',
      photo: null,
      links: [
        { id: genId('l'), label: 'LinkedIn', url: 'https://linkedin.com/in/you' },
        { id: genId('l'), label: 'GitHub', url: 'https://github.com/you' },
      ],
      customFields: [],
    },
    sections: [
      {
        id: genId('s'),
        type: 'profile',
        name: 'Profile',
        visible: true,
        entries: [
          entry({
            title: 'Summary',
            description:
              'Experienced professional with a track record of delivering results. Replace this text with a short, punchy summary that highlights your strengths and what you are looking for.',
          }),
        ],
      },
      {
        id: genId('s'),
        type: 'experience',
        name: 'Professional Experience',
        visible: true,
        entries: [
          entry({
            title: 'Senior Role',
            subtitle: 'Company Name',
            location: 'City',
            startDate: '2022-01',
            current: true,
            description: '- Led a key initiative that improved X by Y%.\n- Collaborated across teams to ship Z.\n- Mentored junior team members.',
          }),
          entry({
            title: 'Earlier Role',
            subtitle: 'Previous Company',
            location: 'City',
            startDate: '2019-03',
            endDate: '2021-12',
            description: '- Delivered features end to end.\n- Improved performance and reliability.',
          }),
        ],
      },
      {
        id: genId('s'),
        type: 'education',
        name: 'Education',
        visible: true,
        entries: [
          entry({ title: 'B.Sc. in Your Field', subtitle: 'University Name', startDate: '2015-09', endDate: '2019-06' }),
        ],
      },
      {
        id: genId('s'),
        type: 'skills',
        name: 'Skills',
        visible: true,
        entries: [
          entry({ title: 'Core', tags: ['Skill one', 'Skill two', 'Skill three'], level: 5 }),
          entry({ title: 'Tools', tags: ['Tool A', 'Tool B'], level: 4 }),
        ],
      },
      {
        id: genId('s'),
        type: 'languages',
        name: 'Languages',
        visible: true,
        entries: [
          entry({ title: 'English', subtitle: 'Fluent', level: 5 }),
          entry({ title: 'Spanish', subtitle: 'Intermediate', level: 3 }),
        ],
      },
    ],
  };
}

export { entry as makeEntry };
