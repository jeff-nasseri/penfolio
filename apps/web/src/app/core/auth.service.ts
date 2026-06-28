import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import type {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  UpdateProfileRequest,
  UserProfile,
} from '@penfolio/shared';

const TOKEN_KEY = 'penfolio_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly user = signal<UserProfile | null>(null);
  readonly isAuthenticated = computed(() => this.token() !== null);

  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>('/api/auth/login', req)
      .pipe(tap((res) => this.setSession(res.token, res.user)));
  }

  logout(): Observable<unknown> {
    return this.http.post('/api/auth/logout', {});
  }

  loadMe(): Observable<UserProfile> {
    return this.http.get<UserProfile>('/api/auth/me').pipe(tap((u) => this.user.set(u)));
  }

  changePassword(req: ChangePasswordRequest): Observable<unknown> {
    return this.http.post('/api/auth/change-password', req);
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>('/api/profile').pipe(tap((u) => this.user.set(u)));
  }

  updateProfile(input: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>('/api/profile', input).pipe(tap((u) => this.user.set(u)));
  }

  setSession(token: string, user: UserProfile): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.token.set(token);
    this.user.set(user);
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
    this.user.set(null);
  }
}
