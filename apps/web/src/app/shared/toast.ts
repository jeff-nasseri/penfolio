import { Component, Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  text: string;
  kind: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private seq = 0;

  show(text: string, kind: Toast['kind'] = 'info'): void {
    const id = ++this.seq;
    this.toasts.update((t) => [...t, { id, text, kind }]);
    setTimeout(() => this.dismiss(id), 3200);
  }
  success(text: string): void {
    this.show(text, 'success');
  }
  error(text: string): void {
    this.show(text, 'error');
  }
  dismiss(id: number): void {
    this.toasts.update((t) => t.filter((x) => x.id !== id));
  }
}

@Component({
  selector: 'app-toasts',
  standalone: true,
  template: `
    <div class="wrap">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [class]="t.kind" (click)="toast.dismiss(t.id)">{{ t.text }}</div>
      }
    </div>
  `,
  styles: [
    `
      .wrap {
        position: fixed;
        right: 22px;
        bottom: 22px;
        z-index: 200;
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-items: flex-end;
      }
      .toast {
        padding: 12px 18px;
        border-radius: 11px;
        background: var(--elevate);
        border: 1px solid var(--border-2);
        color: var(--text);
        font-size: 13.5px;
        font-weight: 600;
        box-shadow: var(--paper-shadow);
        cursor: pointer;
        animation: pf-fade 0.2s ease;
        max-width: 360px;
      }
      .toast.success {
        border-color: var(--accent-border);
      }
      .toast.error {
        border-color: var(--danger-border);
        color: var(--danger);
      }
    `,
  ],
})
export class Toasts {
  constructor(public toast: ToastService) {}
}
