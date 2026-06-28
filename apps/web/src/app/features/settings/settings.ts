import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { AboutInfo } from '@penfolio/shared';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';
import { Icon } from '../../shared/icon';
import { Logo } from '../../shared/logo';
import { TPipe } from '../../shared/t.pipe';
import { ToastService } from '../../shared/toast';
import { ConfirmService } from '../../shared/confirm';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, Icon, Logo, TPipe],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  readonly user = this.auth.user;
  readonly about = signal<AboutInfo | null>(null);

  // profile
  username = '';
  photo: string | null = null;

  // password
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  readonly pwBusy = signal(false);

  readonly initials = computed(() => (this.username || 'A').slice(0, 2).toUpperCase());

  ngOnInit(): void {
    this.auth.getProfile().subscribe({
      next: (u) => {
        this.username = u.username;
        this.photo = u.profilePicture;
      },
    });
    this.api.getAbout().subscribe({ next: (a) => this.about.set(a) });
  }

  // ---- Profile ----
  onPhoto(ev: Event): void {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => (this.photo = reader.result as string);
    reader.readAsDataURL(file);
  }
  clearPhoto(): void {
    this.photo = null;
  }
  saveProfile(): void {
    this.auth.updateProfile({ username: this.username, profilePicture: this.photo }).subscribe({
      next: () => this.toast.success('Profile saved'),
      error: () => this.toast.error('Could not save profile'),
    });
  }

  // ---- Password ----
  changePassword(): void {
    if (this.newPassword.length < 6) {
      this.toast.error('New password must be at least 6 characters');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.toast.error('Passwords do not match');
      return;
    }
    this.pwBusy.set(true);
    this.auth.changePassword({ currentPassword: this.currentPassword, newPassword: this.newPassword }).subscribe({
      next: () => {
        this.pwBusy.set(false);
        this.currentPassword = this.newPassword = this.confirmPassword = '';
        this.toast.success('Password changed');
      },
      error: (err) => {
        this.pwBusy.set(false);
        this.toast.error(err?.error?.error || 'Could not change password');
      },
    });
  }

  // ---- Data ----
  exportData(): void {
    this.api.exportData().subscribe({
      next: (data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'penfolio-export.json';
        a.click();
        URL.revokeObjectURL(url);
        this.toast.success('Export downloaded');
      },
      error: () => this.toast.error('Export failed'),
    });
  }

  async onImport(ev: Event): Promise<void> {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const ok = await this.confirm.ask({
      title: 'Import data',
      message: 'Importing replaces ALL existing résumés, cover letters and tracker data with the file contents. This cannot be undone.',
      confirmLabel: 'Replace everything',
      danger: true,
      requireText: 'IMPORT',
    });
    if (!ok) return;
    try {
      const data = JSON.parse(await file.text());
      this.api.importData(data).subscribe({
        next: () => {
          this.toast.success('Data imported — reloading…');
          setTimeout(() => location.reload(), 900);
        },
        error: () => this.toast.error('Import failed — is this a PenFolio export?'),
      });
    } catch {
      this.toast.error('Could not read the file');
    }
  }

  async purge(): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Purge all data',
      message: 'This permanently deletes every résumé, cover letter and all job-tracker data. Your account stays. This cannot be undone.',
      confirmLabel: 'Purge everything',
      danger: true,
      requireText: 'DELETE',
    });
    if (!ok) return;
    this.api.purge().subscribe({
      next: () => {
        this.toast.success('All data purged');
        setTimeout(() => location.reload(), 800);
      },
      error: () => this.toast.error('Purge failed'),
    });
  }

  openSwagger(): void {
    window.open('/api/docs', '_blank');
  }

  logout(): void {
    this.auth.logout().subscribe({ next: () => this.finishLogout(), error: () => this.finishLogout() });
  }
  private finishLogout(): void {
    this.auth.clearSession();
    location.href = '/login';
  }
}
