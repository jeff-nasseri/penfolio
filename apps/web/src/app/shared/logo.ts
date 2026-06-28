import { Component, Input } from '@angular/core';

/** The PenFolio nib mark (optionally with the wordmark). */
@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <span class="row">
      <span class="tile" [style.width.px]="size" [style.height.px]="size" [style.borderRadius.px]="size * 0.28">
        <svg [attr.width]="size * 0.55" [attr.height]="size * 0.55" viewBox="0 0 48 48" fill="none">
          <path
            d="M14.5 7.5h19c2 0 3.2 1.1 3.6 3.1L26.8 41.4c-.9 2.6-4.7 2.6-5.6 0L10.9 10.6c.4-2 1.6-3.1 3.6-3.1Z"
            fill="#fff"
          />
          <circle cx="24" cy="15.2" r="2.7" fill="#6557e8" />
          <path d="M24 19.4V40.6" stroke="#6557e8" stroke-width="2.1" stroke-linecap="round" />
        </svg>
      </span>
      @if (showText) {
        <span class="word" [style.fontSize.px]="size * 0.56">
          <b>Pen</b><span>Folio</span>
        </span>
      }
    </span>
  `,
  styles: [
    `
      .row {
        display: inline-flex;
        align-items: center;
        gap: 11px;
      }
      .tile {
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(152deg, #9486ff 6%, #6557e8 94%);
        box-shadow:
          0 8px 20px -8px rgba(101, 87, 232, 0.55),
          inset 0 1px 0 rgba(255, 255, 255, 0.28);
        flex-shrink: 0;
      }
      .word {
        font-family: 'Space Grotesk', sans-serif;
        letter-spacing: -0.02em;
        line-height: 1;
      }
      .word b {
        font-weight: 700;
        color: var(--text);
      }
      .word span {
        font-weight: 500;
        color: var(--text-2);
      }
    `,
  ],
})
export class Logo {
  @Input() size = 34;
  @Input() showText = true;
}
