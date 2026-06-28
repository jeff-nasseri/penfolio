import { Component, Input } from '@angular/core';

/**
 * Single inline-SVG icon set used across PenFolio. Centralising the SVGs keeps
 * feature templates clean and the visual language consistent. All icons share a
 * 24×24 viewBox and inherit `currentColor`.
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      style="display:block;flex-shrink:0"
    >
      @switch (name) {
        @case ('tracker') {
          <rect x="3" y="4" width="5" height="16" rx="1.5" stroke="currentColor" stroke-width="1.7" />
          <rect x="9.5" y="4" width="5" height="11" rx="1.5" stroke="currentColor" stroke-width="1.7" />
          <rect x="16" y="4" width="5" height="14" rx="1.5" stroke="currentColor" stroke-width="1.7" />
        }
        @case ('analytics') {
          <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
        }
        @case ('resume') {
          <path d="M6 3h8l4 4v14H6V3z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
          <path d="M14 3v4h4M9 12h6M9 16h6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
        }
        @case ('cover') {
          <path d="M3 6l9 6 9-6M3 6h18v12H3V6z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
        }
        @case ('settings') {
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7" />
          <path d="M12 3v2.5M12 18.5V21M21 12h-2.5M5.5 12H3M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M18.4 18.4l-1.8-1.8M7.4 7.4 5.6 5.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
        }
        @case ('sun') {
          <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        }
        @case ('moon') {
          <path d="M20 14.5A8 8 0 119.5 4a6.5 6.5 0 0010.5 10.5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
        }
        @case ('plus') {
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        }
        @case ('search') {
          <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8" />
          <path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        }
        @case ('chevron-down') {
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        }
        @case ('chevron-left') {
          <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" />
        }
        @case ('sort') {
          <path d="M8 9l4-4 4 4M8 15l4 4 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
        }
        @case ('close') {
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" />
        }
        @case ('copy') {
          <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.8" />
          <path d="M16 8V5a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" stroke="currentColor" stroke-width="1.8" />
        }
        @case ('download') {
          <path d="M12 4v11m0 0l-4-4m4 4l4-4M5 20h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        }
        @case ('trash') {
          <path d="M5 7h14M10 7V5h4v2M6 7l1 13h10l1-13" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
        }
        @case ('edit') {
          <path d="M4 20l4-1 10-10-3-3L5 16zM14 6l3 3" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
        }
        @case ('eye') {
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" stroke-width="1.7" />
          <circle cx="12" cy="12" r="2.6" stroke="currentColor" stroke-width="1.7" />
        }
        @case ('eye-off') {
          <path d="M4 4l16 16M10 6.2A9.6 9.6 0 0112 6c6.5 0 10 7 10 7a16 16 0 01-3 3.6M6 7.5A16 16 0 002 13s3.5 7 10 7a9.4 9.4 0 004-.9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
        }
        @case ('grip') {
          <circle cx="9" cy="6" r="1.4" fill="currentColor" /><circle cx="15" cy="6" r="1.4" fill="currentColor" />
          <circle cx="9" cy="12" r="1.4" fill="currentColor" /><circle cx="15" cy="12" r="1.4" fill="currentColor" />
          <circle cx="9" cy="18" r="1.4" fill="currentColor" /><circle cx="15" cy="18" r="1.4" fill="currentColor" />
        }
        @case ('check') {
          <path d="M5 12l5 5 9-11" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
        }
        @case ('sparkle') {
          <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
        }
        @case ('link') {
          <path d="M9 15l6-6M10.5 6.5l1-1a4 4 0 015.7 5.7l-1 1M13.5 17.5l-1 1a4 4 0 01-5.7-5.7l1-1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
        }
        @case ('logout') {
          <path d="M15 12H4m0 0l4-4m-4 4l4 4M10 16v2a2 2 0 002 2h6a2 2 0 002-2V6a2 2 0 00-2-2h-6a2 2 0 00-2 2v2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
        }
        @case ('upload') {
          <path d="M12 16V4m0 0l-4 4m4-4l4 4M5 20h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        }
        @case ('warning') {
          <path d="M12 3l9 16H3l9-16z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
          <path d="M12 10v4M12 17h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        }
        @case ('dots') {
          <circle cx="5" cy="12" r="1.6" fill="currentColor" /><circle cx="12" cy="12" r="1.6" fill="currentColor" /><circle cx="19" cy="12" r="1.6" fill="currentColor" />
        }
        @case ('clock') {
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
          <path d="M12 7v5l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        }
        @case ('lock') {
          <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" stroke-width="1.7" />
          <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" stroke-width="1.7" />
        }
        @case ('user') {
          <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.7" />
          <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
        }
        @case ('database') {
          <ellipse cx="12" cy="6" rx="8" ry="3" stroke="currentColor" stroke-width="1.7" />
          <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" stroke="currentColor" stroke-width="1.7" />
        }
        @case ('book-open') {
          <path d="M12 6c-2-1.3-5-1.3-8 0v13c3-1.3 6-1.3 8 0 2-1.3 5-1.3 8 0V6c-3-1.3-6-1.3-8 0v13" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
        }
        @case ('code') {
          <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13 5l-2 14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
        }
        @case ('globe') {
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7" />
          <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" stroke="currentColor" stroke-width="1.7" />
        }
        @case ('site') {
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7" />
          <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" stroke="currentColor" stroke-width="1.7" />
        }
        @case ('signature') {
          <path d="M4 18l3-1 9-9-3-3-9 9-1 4z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
          <path d="M3 21h18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
        }
        @case ('layout') {
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.7" />
          <path d="M3 9h18M9 9v11" stroke="currentColor" stroke-width="1.7" />
        }
        @case ('palette') {
          <path d="M12 3a9 9 0 100 18c1.5 0 2-1 2-2 0-1.5 1-2 2-2h1a3 3 0 003-3 9 9 0 00-11-9z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
          <circle cx="8" cy="11" r="1" fill="currentColor" /><circle cx="12" cy="8" r="1" fill="currentColor" /><circle cx="16" cy="11" r="1" fill="currentColor" />
        }
        @case ('type') {
          <path d="M5 6h14M12 6v13M9 19h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        }
        @case ('camera') {
          <rect x="3" y="7" width="18" height="13" rx="2.5" stroke="currentColor" stroke-width="1.7" />
          <circle cx="12" cy="13.5" r="3.2" stroke="currentColor" stroke-width="1.7" />
          <path d="M8 7l1.5-2h5L16 7" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
        }
        @case ('grid') {
          <rect x="4" y="4" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.8" />
          <rect x="14" y="4" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.8" />
          <rect x="4" y="14" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.8" />
          <rect x="14" y="14" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.8" />
        }
        @case ('arrow-right') {
          <path d="M5 12h14m0 0l-5-5m5 5l-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        }
        @case ('profile') {
          <path d="M5 4h11l3 3v13H5z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
          <path d="M9 9h6M9 13h6M9 17h3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
        }
        @case ('briefcase') {
          <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.7" />
          <path d="M8 7V5h8v2M3 13h18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
        }
        @case ('badge') {
          <circle cx="12" cy="9" r="5" stroke="currentColor" stroke-width="1.7" />
          <path d="M9 13l-1 8 4-2 4 2-1-8" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
        }
        @case ('flame') {
          <path d="M12 3c3 4 5 6 5 9a5 5 0 11-10 0c0-1.5.7-3 2-4 .3 1.5 1 2 2 2-1-2 0-5 1-7z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
        }
        @case ('puzzle') {
          <path d="M10 4h4v3a2 2 0 104 0V4M14 20h-4v-3a2 2 0 10-4 0v3H4v-6h3a2 2 0 100-4H4V4h6" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
        }
        @case ('cap') {
          <path d="M3 9l9-4 9 4-9 4-9-4z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
          <path d="M7 11v5c0 1 2.5 3 5 3s5-2 5-3v-5" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
        }
        @case ('people') {
          <circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.6" />
          <path d="M3 20c0-3 3-5 6-5s6 2 6 5M16 6a3 3 0 010 6M21 20c0-2-1-3.5-3-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        }
        @case ('heart') {
          <path d="M12 20S4 14 4 9a4 4 0 018-1 4 4 0 018 1c0 5-8 11-8 11z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
        }
        @case ('folder') {
          <path d="M3 7h6l2 2h10v10H3z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
        }
        @case ('book') {
          <path d="M6 4h10a2 2 0 012 2v14H8a2 2 0 01-2-2zM6 18a2 2 0 00-2 2" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
        }
        @case ('trophy') {
          <path d="M8 4h8v4a4 4 0 01-8 0zM5 5H3v1a3 3 0 003 3M19 5h2v1a3 3 0 01-3 3M9 15h6l-1 5h-4z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
        }
        @case ('building') {
          <rect x="5" y="3" width="14" height="18" rx="1" stroke="currentColor" stroke-width="1.7" />
          <path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 17h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        }
        @case ('pen') {
          <path d="M4 20l4-1 10-10-3-3L5 16zM14 6l3 3" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
        }
        @case ('star') {
          <path d="M12 3l2.6 6.3 6.4.5-4.9 4.1 1.5 6.1L12 17l-5.6 3 1.5-6.1L3 9.8l6.4-.5L12 3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
        }
        @default {
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        }
      }
    </svg>
  `,
})
export class Icon {
  @Input() name = 'plus';
  @Input() size: number | string = 18;
}
