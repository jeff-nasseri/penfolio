import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';

/** Tiny shared store for the sidebar "Job Tracker" application count badge. */
@Injectable({ providedIn: 'root' })
export class CountsService {
  private readonly api = inject(ApiService);
  readonly applications = signal(0);

  refresh(): void {
    this.api.getBoard().subscribe({
      next: (b) => this.applications.set(b.applications.length),
      error: () => {},
    });
  }

  set(n: number): void {
    this.applications.set(n);
  }
}
