import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    const apiUrl = environment.apiBaseUrl;

    // Log the request details
    console.log(`Intercepting request to: ${request.url}`);
    console.log(`Auth token available: ${!!token}`);

    // Only add auth token if the request is going to our API
    if (token && request.url.includes(apiUrl.replace(/https?:\/\//, ''))) {
      console.log('Adding token to request');
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      tap(event => {
        // Log successful responses if needed
      }),
      catchError(error => {
        if (
          error instanceof HttpErrorResponse &&
          error.status === 401 &&
          error.error?.code === 'token_not_valid'
        ) {
          return this.handle401Error(request, next);
        }

        console.error('Request error:', error);
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip token refresh for the refresh token endpoint itself
    if (request.url.includes('token/refresh')) {
      return throwError(() => new Error('Session expired'));
    }

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((token) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token.access);
          return next.handle(this.addToken(request, token.access));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => error);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next.handle(this.addToken(request, token)))
      );
    }
  }
}
