import { Injectable, signal } from '@angular/core';

export type Lang = 'en' | 'nl' | 'fa';

export const LANGUAGES: { code: Lang; label: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'nl', label: 'Nederlands', dir: 'ltr' },
  { code: 'fa', label: 'فارسی', dir: 'rtl' },
];

const KEY = 'penfolio_lang';

/** Flat key → string dictionaries. English is the source of truth. */
const EN: Record<string, string> = {
  'nav.workspace': 'Workspace',
  'nav.tracker': 'Job Tracker',
  'nav.analytics': 'Analytics',
  'nav.resumes': 'Resumes',
  'nav.coverLetters': 'Cover Letters',
  'nav.account': 'My account',
  'selfHosted.title': 'Self-hosted',
  'selfHosted.desc': 'Open-source & yours. No limits, no paywalls.',
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'lang.label': 'Language',

  'common.create': 'Create',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.download': 'Download',
  'common.search': 'Search',
  'common.add': 'Add',
  'common.loading': 'Loading…',
  'common.signOut': 'Sign out',

  'login.welcome': 'Welcome back',
  'login.subtitle': 'Sign in to your self-hosted PenFolio workspace.',
  'login.username': 'Username',
  'login.password': 'Password',
  'login.passwordPlaceholder': 'Enter your password',
  'login.signIn': 'Sign in',
  'login.signingIn': 'Signing in…',
  'login.defaultCreds': 'Default credentials',

  'tracker.title': 'Job Tracker',
  'tracker.subtitle': 'Every application, from saved to signed — in one board.',
  'tracker.column': 'Column',
  'tracker.analytics': 'Analytics',
  'tracker.search': 'Search company or role…',
  'tracker.addApplication': 'Add application',
  'tracker.dropHere': 'Drop applications here',
  'tracker.loading': 'Loading board…',

  'resumes.title': 'My Resumes',
  'resumes.subtitle': 'Tailor a version for every role. They all stay in sync.',
  'resumes.create': 'Create resume',
  'resumes.search': 'Search resumes…',
  'resumes.empty': 'No resumes yet.',
  'resumes.createFirst': 'Create your first resume',

  'cover.title': 'Cover Letters',
  'cover.subtitle': 'Synced with your résumé — write once, reuse everywhere.',
  'cover.new': 'New cover letter',
  'cover.search': 'Search letters…',
  'cover.empty': 'No cover letters yet.',
  'cover.createFirst': 'Write your first letter',

  'analytics.title': 'Analytics',
  'analytics.subtitle': 'How your search is really going — measured across the whole pipeline.',
  'analytics.totalTracked': 'Total tracked',
  'analytics.responseRate': 'Response rate',
  'analytics.activePipeline': 'Active pipeline',
  'analytics.offerRate': 'Offer rate',
  'analytics.resumes': 'Résumés',
  'analytics.coverLetters': 'Cover letters',
  'analytics.columns': 'Tracker columns',

  'settings.title': 'Settings',
  'settings.subtitle': 'Manage your account, your data and the API.',
  'settings.account': 'Account',
  'settings.security': 'Security',
  'settings.dataApi': 'Data & API',
  'settings.about': 'About',
  'settings.dangerZone': 'Danger zone',
  'settings.profile': 'Profile',
  'settings.uploadPicture': 'Upload picture',
  'settings.remove': 'Remove',
  'settings.username': 'Username',
  'settings.saveProfile': 'Save profile',
  'settings.changePassword': 'Change password',
  'settings.currentPassword': 'Current password',
  'settings.newPassword': 'New password',
  'settings.confirmPassword': 'Confirm new password',
  'settings.exportImport': 'Export & import',
  'settings.exportJson': 'Export JSON',
  'settings.importJson': 'Import JSON',
  'settings.api': 'API',
  'settings.openSwagger': 'Open Swagger API',
  'settings.purge': 'Purge all data',
  'settings.version': 'Version',
  'settings.license': 'License',
  'settings.repository': 'Repository',
  'settings.language': 'Language',
};

const NL: Record<string, string> = {
  'nav.workspace': 'Werkruimte',
  'nav.tracker': 'Sollicitaties',
  'nav.analytics': 'Analyse',
  'nav.resumes': "Cv's",
  'nav.coverLetters': 'Motivatiebrieven',
  'nav.account': 'Mijn account',
  'selfHosted.title': 'Zelf gehost',
  'selfHosted.desc': 'Open-source en van jou. Geen limieten, geen betaalmuren.',
  'theme.light': 'Licht',
  'theme.dark': 'Donker',
  'lang.label': 'Taal',

  'common.create': 'Aanmaken',
  'common.save': 'Opslaan',
  'common.cancel': 'Annuleren',
  'common.delete': 'Verwijderen',
  'common.download': 'Downloaden',
  'common.search': 'Zoeken',
  'common.add': 'Toevoegen',
  'common.loading': 'Laden…',
  'common.signOut': 'Afmelden',

  'login.welcome': 'Welkom terug',
  'login.subtitle': 'Meld je aan bij je zelf-gehoste PenFolio-werkruimte.',
  'login.username': 'Gebruikersnaam',
  'login.password': 'Wachtwoord',
  'login.passwordPlaceholder': 'Voer je wachtwoord in',
  'login.signIn': 'Aanmelden',
  'login.signingIn': 'Aanmelden…',
  'login.defaultCreds': 'Standaardgegevens',

  'tracker.title': 'Sollicitaties',
  'tracker.subtitle': 'Elke sollicitatie, van opgeslagen tot getekend — op één bord.',
  'tracker.column': 'Kolom',
  'tracker.analytics': 'Analyse',
  'tracker.search': 'Zoek bedrijf of functie…',
  'tracker.addApplication': 'Sollicitatie toevoegen',
  'tracker.dropHere': 'Sleep sollicitaties hierheen',
  'tracker.loading': 'Bord laden…',

  'resumes.title': "Mijn cv's",
  'resumes.subtitle': 'Maak een versie voor elke functie. Ze blijven gesynchroniseerd.',
  'resumes.create': 'Cv aanmaken',
  'resumes.search': "Zoek cv's…",
  'resumes.empty': "Nog geen cv's.",
  'resumes.createFirst': 'Maak je eerste cv',

  'cover.title': 'Motivatiebrieven',
  'cover.subtitle': 'Gesynchroniseerd met je cv — schrijf één keer, hergebruik overal.',
  'cover.new': 'Nieuwe motivatiebrief',
  'cover.search': 'Zoek brieven…',
  'cover.empty': 'Nog geen motivatiebrieven.',
  'cover.createFirst': 'Schrijf je eerste brief',

  'analytics.title': 'Analyse',
  'analytics.subtitle': 'Hoe je zoektocht echt verloopt — gemeten over de hele pijplijn.',
  'analytics.totalTracked': 'Totaal bijgehouden',
  'analytics.responseRate': 'Reactiepercentage',
  'analytics.activePipeline': 'Actieve pijplijn',
  'analytics.offerRate': 'Aanbodpercentage',
  'analytics.resumes': "Cv's",
  'analytics.coverLetters': 'Motivatiebrieven',
  'analytics.columns': 'Kolommen',

  'settings.title': 'Instellingen',
  'settings.subtitle': 'Beheer je account, je gegevens en de API.',
  'settings.account': 'Account',
  'settings.security': 'Beveiliging',
  'settings.dataApi': 'Gegevens & API',
  'settings.about': 'Over',
  'settings.dangerZone': 'Gevarenzone',
  'settings.profile': 'Profiel',
  'settings.uploadPicture': 'Foto uploaden',
  'settings.remove': 'Verwijderen',
  'settings.username': 'Gebruikersnaam',
  'settings.saveProfile': 'Profiel opslaan',
  'settings.changePassword': 'Wachtwoord wijzigen',
  'settings.currentPassword': 'Huidig wachtwoord',
  'settings.newPassword': 'Nieuw wachtwoord',
  'settings.confirmPassword': 'Bevestig nieuw wachtwoord',
  'settings.exportImport': 'Exporteren & importeren',
  'settings.exportJson': 'JSON exporteren',
  'settings.importJson': 'JSON importeren',
  'settings.api': 'API',
  'settings.openSwagger': 'Open Swagger API',
  'settings.purge': 'Alle gegevens wissen',
  'settings.version': 'Versie',
  'settings.license': 'Licentie',
  'settings.repository': 'Repository',
  'settings.language': 'Taal',
};

const FA: Record<string, string> = {
  'nav.workspace': 'فضای کاری',
  'nav.tracker': 'پیگیری شغل',
  'nav.analytics': 'تحلیل‌ها',
  'nav.resumes': 'رزومه‌ها',
  'nav.coverLetters': 'نامه‌های پوششی',
  'nav.account': 'حساب من',
  'selfHosted.title': 'خود-میزبان',
  'selfHosted.desc': 'متن‌باز و متعلق به شما. بدون محدودیت، بدون پرداخت.',
  'theme.light': 'روشن',
  'theme.dark': 'تیره',
  'lang.label': 'زبان',

  'common.create': 'ایجاد',
  'common.save': 'ذخیره',
  'common.cancel': 'لغو',
  'common.delete': 'حذف',
  'common.download': 'دانلود',
  'common.search': 'جستجو',
  'common.add': 'افزودن',
  'common.loading': 'در حال بارگذاری…',
  'common.signOut': 'خروج',

  'login.welcome': 'خوش آمدید',
  'login.subtitle': 'به فضای کاری خود-میزبان PenFolio خود وارد شوید.',
  'login.username': 'نام کاربری',
  'login.password': 'رمز عبور',
  'login.passwordPlaceholder': 'رمز عبور خود را وارد کنید',
  'login.signIn': 'ورود',
  'login.signingIn': 'در حال ورود…',
  'login.defaultCreds': 'اطلاعات پیش‌فرض',

  'tracker.title': 'پیگیری شغل',
  'tracker.subtitle': 'هر درخواست، از ذخیره تا قبولی — در یک تخته.',
  'tracker.column': 'ستون',
  'tracker.analytics': 'تحلیل‌ها',
  'tracker.search': 'جستجوی شرکت یا نقش…',
  'tracker.addApplication': 'افزودن درخواست',
  'tracker.dropHere': 'درخواست‌ها را اینجا رها کنید',
  'tracker.loading': 'بارگذاری تخته…',

  'resumes.title': 'رزومه‌های من',
  'resumes.subtitle': 'برای هر نقش نسخه‌ای بسازید. همه هماهنگ می‌مانند.',
  'resumes.create': 'ساخت رزومه',
  'resumes.search': 'جستجوی رزومه‌ها…',
  'resumes.empty': 'هنوز رزومه‌ای نیست.',
  'resumes.createFirst': 'اولین رزومه خود را بسازید',

  'cover.title': 'نامه‌های پوششی',
  'cover.subtitle': 'هماهنگ با رزومه شما — یک بار بنویسید، همه‌جا استفاده کنید.',
  'cover.new': 'نامه پوششی جدید',
  'cover.search': 'جستجوی نامه‌ها…',
  'cover.empty': 'هنوز نامه‌ای نیست.',
  'cover.createFirst': 'اولین نامه خود را بنویسید',

  'analytics.title': 'تحلیل‌ها',
  'analytics.subtitle': 'وضعیت واقعی جستجوی شما — در سراسر مسیر.',
  'analytics.totalTracked': 'کل پیگیری‌شده',
  'analytics.responseRate': 'نرخ پاسخ',
  'analytics.activePipeline': 'مسیر فعال',
  'analytics.offerRate': 'نرخ پیشنهاد',
  'analytics.resumes': 'رزومه‌ها',
  'analytics.coverLetters': 'نامه‌های پوششی',
  'analytics.columns': 'ستون‌ها',

  'settings.title': 'تنظیمات',
  'settings.subtitle': 'حساب، داده‌ها و API خود را مدیریت کنید.',
  'settings.account': 'حساب',
  'settings.security': 'امنیت',
  'settings.dataApi': 'داده و API',
  'settings.about': 'درباره',
  'settings.dangerZone': 'منطقه خطر',
  'settings.profile': 'پروفایل',
  'settings.uploadPicture': 'بارگذاری عکس',
  'settings.remove': 'حذف',
  'settings.username': 'نام کاربری',
  'settings.saveProfile': 'ذخیره پروفایل',
  'settings.changePassword': 'تغییر رمز عبور',
  'settings.currentPassword': 'رمز عبور فعلی',
  'settings.newPassword': 'رمز عبور جدید',
  'settings.confirmPassword': 'تأیید رمز عبور جدید',
  'settings.exportImport': 'برون‌بری و درون‌بری',
  'settings.exportJson': 'برون‌بری JSON',
  'settings.importJson': 'درون‌بری JSON',
  'settings.api': 'API',
  'settings.openSwagger': 'باز کردن Swagger API',
  'settings.purge': 'حذف همه داده‌ها',
  'settings.version': 'نسخه',
  'settings.license': 'مجوز',
  'settings.repository': 'مخزن',
  'settings.language': 'زبان',
};

const DICTS: Record<Lang, Record<string, string>> = { en: EN, nl: NL, fa: FA };

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<Lang>(this.read());

  constructor() {
    this.apply(this.lang());
  }

  /** Translate a key; falls back to English, then the key itself. */
  t(key: string): string {
    const l = this.lang();
    return DICTS[l][key] ?? DICTS.en[key] ?? key;
  }

  set(lang: Lang): void {
    this.lang.set(lang);
    try {
      localStorage.setItem(KEY, lang);
    } catch {
      /* ignore */
    }
    this.apply(lang);
  }

  private read(): Lang {
    try {
      const v = localStorage.getItem(KEY);
      if (v === 'en' || v === 'nl' || v === 'fa') return v;
    } catch {
      /* ignore */
    }
    return 'en';
  }

  private apply(lang: Lang): void {
    const meta = LANGUAGES.find((l) => l.code === lang)!;
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', meta.dir);
  }
}
