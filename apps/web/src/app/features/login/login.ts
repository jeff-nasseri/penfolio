import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Logo } from '../../shared/logo';
import { Icon } from '../../shared/icon';
import { TPipe } from '../../shared/t.pipe';
import { LangSwitch } from '../../shared/lang-switch';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, Logo, Icon, TPipe, LangSwitch],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  username = 'admin';
  password = '';
  readonly busy = signal(false);
  readonly error = signal('');

  submit(): void {
    if (this.busy()) return;
    this.error.set('');
    this.busy.set(true);
    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.busy.set(false);
        void this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.busy.set(false);
        this.error.set(err?.error?.error || 'Login failed');
      },
    });
  }
}
