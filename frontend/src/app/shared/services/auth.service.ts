import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from '../../core/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users`;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isInitialized = false;

  constructor(private http: HttpClient) {}

  // Инициализация - вызывается один раз из app.component
  init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Пытаемся загрузить профиль при инициализации
    this.getProfile().subscribe({
      next: (user) => {
        console.log('✅ Пользователь авторизован:', user.username);
        this.currentUserSubject.next(user);
      },
      error: (err) => {
        // Если не получилось - пользователь не авторизован (это нормально)
        console.log('ℹ️ Пользователь не авторизован');
        this.currentUserSubject.next(null);
      },
    });
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, data, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          this.currentUserSubject.next(response.user);
        })
      );
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.currentUserSubject.next(null);
        }),
        catchError(() => {
          this.currentUserSubject.next(null);
          return of(null);
        })
      );
  }

  getProfile(): Observable<User> {
    return this.http
      .get<User>(`${this.apiUrl}/profile`, { withCredentials: true })
      .pipe(
        tap((user) => {
          this.currentUserSubject.next(user);
        }),
        catchError((err) => {
          this.currentUserSubject.next(null);
          throw err;
        })
      );
  }

  updateProfile(data: any): Observable<any> {
    return this.http
      .put<any>(`${this.apiUrl}/profile`, data, { withCredentials: true })
      .pipe(
        tap((response) => {
          if (response.user) {
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  refreshToken(): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/refresh`, {}, { withCredentials: true })
      .pipe(
        tap((response: any) => {
          if (response.user) {
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }

  // Устаревшие методы для обратной совместимости
  setToken(token: string): void {
    // Больше не используется, токены в cookies
  }

  getToken(): string | null {
    // Больше не используется, токены в cookies
    return null;
  }
}
