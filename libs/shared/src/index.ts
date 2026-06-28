/**
 * PenFolio shared contract.
 *
 * Framework-agnostic TypeScript types + a few runtime helpers shared by the
 * Express API (apps/api) and the Angular UI (apps/web). Both compile this
 * source directly via the "@penfolio/shared" path alias — there is no build step.
 */

/* ------------------------------------------------------------------ */
/* Primitives & helpers                                               */
/* ------------------------------------------------------------------ */

/** Bump whenever the export file shape changes. */
export const EXPORT_VERSION = 1;

export interface AboutInfo {
  name: string;
  tagline: string;
  description: string;
  /** filled at runtime from the build (GitVersion assemblySemVer). */
  version: string;
  repository: string;
  license: string;
}

export const ABOUT: AboutInfo = {
  name: 'PenFolio',
  tagline: 'A self-hosted CV / cover-letter builder with a built-in job tracker.',
  description:
    'PenFolio is a self-hosted, open-source platform inspired by FlowCV. Build and ' +
    'tailor résumés and cover letters, then track every job application from saved to ' +
    'signed — all on your own machine, with no limits and no paywalls.',
  version: '0.0.0',
  repository: 'https://github.com/jeff-nasseri/penfolio',
  license: 'MIT',
};

/** Short random id for client-generated nested objects (sections, entries…). */
export function genId(prefix = ''): string {
  const rnd = Math.random().toString(36).slice(2, 8);
  const t = Date.now().toString(36);
  return `${prefix}${t}${rnd}`;
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

/* ------------------------------------------------------------------ */
/* Auth & user                                                        */
/* ------------------------------------------------------------------ */

export interface UserProfile {
  id: number;
  username: string;
  /** data URL (base64) or null. */
  profilePicture: string | null;
  /** free-text "about me" shown in settings. */
  about: string;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  username?: string;
  /** data URL or null to clear. */
  profilePicture?: string | null;
  about?: string;
}

/* ------------------------------------------------------------------ */
/* Résumé content model                                               */
/* ------------------------------------------------------------------ */

export type PageFormat = 'A4' | 'Letter';

/** A labelled contact link (LinkedIn, GitHub, Website, Portfolio…). */
export interface ContactLink {
  id: string;
  /** e.g. "LinkedIn", "GitHub", "Website". Drives the icon. */
  label: string;
  url: string;
}

/** An extra free-form personal field (Nationality, Visa status, Driving license…). */
export interface CustomField {
  id: string;
  label: string;
  value: string;
}

export interface PersonalDetails {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  /** data URL or null. */
  photo: string | null;
  links: ContactLink[];
  customFields: CustomField[];
}

export const SECTION_TYPES = [
  'profile',
  'experience',
  'education',
  'skills',
  'languages',
  'certificates',
  'courses',
  'projects',
  'awards',
  'publications',
  'organizations',
  'references',
  'interests',
  'declaration',
  'custom',
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

/**
 * One generic entry. Every field is optional; the editor surfaces and the
 * preview renders only what is relevant for the parent section's type. This
 * keeps the model simple while covering all FlowCV section variants.
 */
export interface ResumeEntry {
  id: string;
  visible: boolean;
  /** role / degree / skill-group name / language / certificate / project… */
  title: string;
  /** company / institution / issuer / publisher… */
  subtitle: string;
  location: string;
  startDate: string;
  endDate: string;
  /** "Present" toggle — when true endDate is ignored. */
  current: boolean;
  /** rich description; supports simple markdown-ish bullets ("- ") and **bold**. */
  description: string;
  /** skills / language proficiency 0–5 (0 = no bar shown). */
  level: number;
  /** comma-friendly inline list (e.g. skill keywords for a skill group). */
  tags: string[];
  url: string;
}

export interface ResumeSection {
  id: string;
  type: SectionType;
  /** the heading shown on the résumé (user-editable). */
  name: string;
  visible: boolean;
  /** Icon name shown next to the heading (matches the UI Icon set). Empty = none. */
  icon?: string;
  entries: ResumeEntry[];
  /** which layout column the section lives in for two-column templates. */
  column?: 1 | 2;
}

export interface ResumeContent {
  personalDetails: PersonalDetails;
  sections: ResumeSection[];
}

/** Toggles for where the accent colour is applied (mirrors FlowCV). */
export interface AccentTargets {
  name: boolean;
  jobTitle: boolean;
  headings: boolean;
  headingLine: boolean;
  headerIcons: boolean;
  dates: boolean;
  /** colour the link icons / links. */
  links: boolean;
  /** colour the skill dots / language bars / level bubbles. */
  dotsBarsBubbles: boolean;
  /** colour the entry subtitle (company / institution). */
  entrySubtitle: boolean;
}

export type PhotoShape = 'circle' | 'squircle' | 'rounded' | 'soft' | 'square';
export type PhotoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface PhotoSettings {
  show: boolean;
  shape: PhotoShape;
  size: PhotoSize;
  /** placement of the photo relative to the header text (top-header layouts). */
  position: 'left' | 'top' | 'right';
  grayscale: boolean;
}

/** Link rendering options (mirrors FlowCV "Link Styling"). */
export interface LinkStyle {
  underline: boolean;
  /** use the accent colour for link text. */
  coloured: boolean;
  showIcon: boolean;
  iconStyle: 'chain' | 'external';
}

/** Footer toggles (mirrors FlowCV "Footer"). */
export interface FooterSettings {
  pageNumbers: boolean;
  email: boolean;
  name: boolean;
}

/** How the header contact details are arranged. */
export type DetailsLayout = 'stack' | 'inline' | 'grid';

export interface ResumeCustomization {
  /** visual template id — see TEMPLATES. */
  template: string;
  accentColor: string;
  fontFamily: string;
  /** name font, or 'inherit' to use the body font. */
  nameFont: string;
  /** base scale multiplier, 0.85–1.2. */
  fontScale: number;
  /** line height multiplier, 1.1–1.8. */
  lineSpacing: number;
  /** spacing between sections in px. */
  sectionSpacing: number;
  headerPosition: 'top' | 'left' | 'right';
  headerAlignment: 'left' | 'center';
  /** arrangement of the contact details in the header. */
  headerDetailsLayout: DetailsLayout;
  columns: 1 | 2;
  /** render section headings in UPPERCASE. */
  headingUppercase: boolean;
  photo: PhotoSettings;
  accent: AccentTargets;
  link: LinkStyle;
  footer: FooterSettings;
  pageFormat: PageFormat;
  /** date display format token. */
  dateFormat: string;
}

export interface ResumeDocument {
  id: number;
  title: string;
  tag: string | null;
  createdAt: string;
  updatedAt: string;
  content: ResumeContent;
  customization: ResumeCustomization;
}

/** Payload to create/update a résumé. */
export interface ResumeInput {
  title: string;
  tag?: string | null;
  content: ResumeContent;
  customization: ResumeCustomization;
}

/* ------------------------------------------------------------------ */
/* Cover letter model                                                 */
/* ------------------------------------------------------------------ */

export interface CoverLetterSignature {
  fullName: string;
  place: string;
  date: string;
}

export interface CoverLetterContent {
  personalDetails: PersonalDetails;
  /** recipient block. */
  recipientName: string;
  recipientCompany: string;
  recipientAddress: string;
  /** letter meta. */
  date: string;
  subject: string;
  greeting: string;
  /** the letter body — paragraphs separated by blank lines. */
  body: string;
  closing: string;
  signature: CoverLetterSignature;
  /** optional résumé this letter is kept in sync with. */
  syncedResumeId: number | null;
}

export interface CoverLetterCustomization {
  template: string;
  accentColor: string;
  fontFamily: string;
  fontScale: number;
  lineSpacing: number;
  headerPosition: 'top' | 'left' | 'right';
  headerAlignment: 'left' | 'center';
  photo: PhotoSettings;
  pageFormat: PageFormat;
}

export interface CoverLetterDocument {
  id: number;
  title: string;
  tag: string | null;
  createdAt: string;
  updatedAt: string;
  content: CoverLetterContent;
  customization: CoverLetterCustomization;
}

export interface CoverLetterInput {
  title: string;
  tag?: string | null;
  content: CoverLetterContent;
  customization: CoverLetterCustomization;
}

/* ------------------------------------------------------------------ */
/* Job tracker                                                        */
/* ------------------------------------------------------------------ */

/** Canonical analytics stage a column maps to. */
export type JobStage = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected' | 'other';

export const JOB_STAGES: { stage: JobStage; label: string; color: string }[] = [
  { stage: 'saved', label: 'Saved', color: '#8AA0C2' },
  { stage: 'applied', label: 'Applied', color: '#8B7BFF' },
  { stage: 'interview', label: 'Interview', color: '#E8B45A' },
  { stage: 'offer', label: 'Offer', color: '#4ADE80' },
  { stage: 'rejected', label: 'Rejected', color: '#F08C8C' },
  { stage: 'other', label: 'Other', color: '#8AA0C2' },
];

export interface JobColumn {
  id: number;
  name: string;
  color: string;
  /** drives the funnel order + the canonical analytics stage. */
  stage: JobStage;
  sortOrder: number;
}

export interface JobColumnInput {
  name: string;
  color?: string;
  stage?: JobStage;
  sortOrder?: number;
}

export interface JobApplication {
  id: number;
  columnId: number;
  company: string;
  role: string;
  location: string;
  source: string;
  url: string;
  salary: string;
  notes: string;
  /** YYYY-MM-DD or '' — drives the "applications over time" chart. */
  appliedDate: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplicationInput {
  columnId: number;
  company: string;
  role?: string;
  location?: string;
  source?: string;
  url?: string;
  salary?: string;
  notes?: string;
  appliedDate?: string;
  sortOrder?: number;
}

/** Bulk reorder / move payload after a drag. */
export interface MoveApplicationRequest {
  columnId: number;
  sortOrder: number;
}

export interface JobBoard {
  columns: JobColumn[];
  applications: JobApplication[];
}

/* ------------------------------------------------------------------ */
/* Analytics                                                          */
/* ------------------------------------------------------------------ */

export interface AnalyticsResponse {
  totals: {
    applications: number;
    resumes: number;
    coverLetters: number;
    columns: number;
    activePipeline: number;
  };
  byColumn: { columnId: number; name: string; color: string; count: number; pct: number }[];
  funnel: { stage: JobStage; label: string; value: number; pct: number; conversion: number | null }[];
  rates: { responseRate: number; interviewRate: number; offerRate: number; overallRate: number };
  overTime: { month: string; total: number; rejected: number }[];
  sources: { source: string; count: number; pct: number }[];
}

/* ------------------------------------------------------------------ */
/* Settings — export / import / purge                                 */
/* ------------------------------------------------------------------ */

export interface DatabaseExport {
  app: 'penfolio';
  version: number;
  exportedAt: string;
  tables: Record<string, Array<Record<string, unknown>>>;
}

export interface ImportResult {
  imported: Record<string, number>;
}

export interface PurgeResult {
  purged: boolean;
}
