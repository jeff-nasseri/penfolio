import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ThemeService } from '../../core/theme.service';
import { CountsService } from '../../core/counts.service';
import { Icon } from '../../shared/icon';
import { Logo } from '../../shared/logo';
import { Toasts } from '../../shared/toast';
import { Confirm } from '../../shared/confirm';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, Logo, Toasts, Confirm],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly themeSvc = inject(ThemeService);
  readonly counts = inject(CountsService);

  readonly user = this.auth.user;
  readonly theme = this.themeSvc.theme;
  readonly appCount = this.counts.applications;
  readonly initials = computed(() => {
    const name = this.user()?.username ?? 'A';
    return name.slice(0, 2).toUpperCase();
  });

  ngOnInit(): void {
    this.auth.loadMe().subscribe({ error: () => {} });
    this.counts.refresh();
  }

  setTheme(t: 'light' | 'dark'): void {
    this.themeSvc.set(t);
  }
}
