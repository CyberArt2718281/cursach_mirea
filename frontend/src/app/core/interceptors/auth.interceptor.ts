import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../../shared/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Клонируем запрос и добавляем withCredentials для всех запросов к API
    if (request.url.includes('/api/')) {
      request = request.clone({
        withCredentials: true,
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Не пытаемся обновить токен для login, register и refresh endpoints
        if (
          error.status === 401 &&
          !request.url.includes('/login') &&
          !request.url.includes('/register') &&
          !request.url.includes('/refresh') &&
          !this.isRefreshing
        ) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response);
          console.log('✅ Токен успешно обновлен');
          // Повторяем оригинальный запрос
          return next.handle(request);
        }),
        catchError((err) => {
          this.isRefreshing = false;
          console.log('❌ Не удалось обновить токен, требуется повторный вход');
          // Не делаем logout автоматически, пользователь сам решит
          return throwError(() => err);
        })
      );
    } else {
      // Ждем пока токен обновится
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap(() => next.handle(request))
      );
    }
  }
}
