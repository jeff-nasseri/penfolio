import { Component, Injectable, effect, signal } from '@angular/core';
import { Icon } from './icon';

interface ConfirmOpts {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  /** require typing this exact word to enable the confirm button. */
  requireText?: string;
}

interface ConfirmState extends ConfirmOpts {
  resolve: (ok: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly state = signal<ConfirmState | null>(null);

  ask(opts: ConfirmOpts): Promise<boolean> {
    return new Promise((resolve) => this.state.set({ ...opts, resolve }));
  }

  resolve(ok: boolean): void {
    const s = this.state();
    if (s) s.resolve(ok);
    this.state.set(null);
  }
}

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [Icon],
  template: `
    @if (svc.state(); as s) {
      <div class="pf-backdrop" (click)="svc.resolve(false)">
        <div class="pf-modal box" (click)="$event.stopPropagation()">
          <div class="head">
            <span class="ic" [class.danger]="s.danger">
              <app-icon [name]="s.danger ? 'warning' : 'check'" [size]="20" />
            </span>
            <div>
              <h2>{{ s.title }}</h2>
              <p>{{ s.message }}</p>
            </div>
          </div>
          @if (s.requireText) {
            <div class="confirm-text">
              <label class="pf-label">
                Type <b>{{ s.requireText }}</b> to confirm
              </label>
              <input class="pf-input" [value]="typed()" (input)="typed.set($any($event.target).value)" />
            </div>
          }
          <div class="actions">
            <button class="pf-btn pf-btn-ghost" (click)="svc.resolve(false)">Cancel</button>
            <button
              class="pf-btn"
              [class.pf-btn-danger]="s.danger"
              [class.pf-btn-primary]="!s.danger"
              [disabled]="!!s.requireText && typed() !== s.requireText"
              (click)="svc.resolve(true)"
            >
              {{ s.confirmLabel || 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .box {
        width: min(440px, 100%);
        padding: 26px;
        margin-top: 12vh;
      }
      .head {
        display: flex;
        gap: 14px;
        align-items: flex-start;
      }
      .ic {
        width: 40px;
        height: 40px;
        border-radius: 11px;
        background: var(--accent-soft);
        color: var(--accent);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .ic.danger {
        background: var(--danger-soft);
        color: var(--danger);
      }
      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--text);
      }
      p {
        margin: 6px 0 0;
        font-size: 13.5px;
        line-height: 1.55;
        color: var(--text-2);
      }
      .confirm-text {
        margin-top: 18px;
      }
      .confirm-text b {
        color: var(--danger);
        font-family: 'JetBrains Mono';
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 24px;
      }
    `,
  ],
})
export class Confirm {
  readonly typed = signal('');
  constructor(public svc: ConfirmService) {
    // Clear the typed-confirmation field each time a new dialog opens.
    effect(() => {
      this.svc.state();
      this.typed.set('');
    });
  }
}
