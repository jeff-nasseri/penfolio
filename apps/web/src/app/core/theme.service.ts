import { Injectable, signal } from '@angular/core';

export type Theme = 'dark' | 'light';
const KEY = 'penfolio_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(this.read());

  constructor() {
    this.apply(this.theme());
  }

  toggle(): void {
    this.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  set(theme: Theme): void {
    this.theme.set(theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* ignore */
    }
    this.apply(theme);
  }

  private read(): Theme {
    try {
      return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  }

  private apply(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
