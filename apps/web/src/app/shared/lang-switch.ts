import { Component, inject } from '@angular/core';
import { I18nService, LANGUAGES, type Lang } from '../core/i18n.service';
import { Icon } from './icon';

/** Compact language selector used in the sidebar. */
@Component({
  selector: 'app-lang-switch',
  standalone: true,
  imports: [Icon],
  template: `
    <div class="lang">
      <app-icon name="globe" [size]="15" />
      <select [value]="i18n.lang()" (change)="pick($any($event.target).value)">
        @for (l of languages; track l.code) {
          <option [value]="l.code">{{ l.label }}</option>
        }
      </select>
      <app-icon name="chevron-down" [size]="13" />
    </div>
  `,
  styles: [
    `
      .lang {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 11px;
        border-radius: 11px;
        background: var(--chip-bg);
        color: var(--text-2);
        margin-bottom: 12px;
        position: relative;
      }
      select {
        flex: 1;
        appearance: none;
        background: transparent;
        border: none;
        outline: none;
        color: var(--text);
        font-family: inherit;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
      }
      option {
        color: #111;
      }
    `,
  ],
})
export class LangSwitch {
  readonly i18n = inject(I18nService);
  readonly languages = LANGUAGES;
  pick(code: Lang): void {
    this.i18n.set(code);
  }
}
