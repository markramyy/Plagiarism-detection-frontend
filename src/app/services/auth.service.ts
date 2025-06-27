import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, switchMap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environment';

interface TokenResponse {
  access: string;
  refresh: string;
}

interface RegisterResponse {
  message: string;
  tokens: TokenResponse;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface ApiError {
  detail?: string;
  code?: string;
  errors?: Record<string, string[]>;
  non_field_errors?: string[];
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private baseUrl = environment.apiBaseUrl;
  private refreshTokenInProgress = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient, private router: Router) { }

  login(username: string, password: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.baseUrl}/auth/api/token/`, {
      username,
      password
    }).pipe(
      tap(response => {
        this.storeTokens(response);
      }),
      catchError(this.handleError)
    );
  }

  register(userData: RegisterPayload): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/auth/api/signup/`, userData)
      .pipe(
        tap(response => {
          // Store the tokens from the nested tokens object
          if (response && response.tokens) {
            this.storeTokens(response.tokens);
          } else {
            console.error('Registration response does not contain tokens', response);
          }
        }),
        catchError(this.handleError)
      );
  }

  refreshToken(): Observable<TokenResponse> {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    if (this.refreshTokenInProgress) {
      return this.refreshTokenSubject.pipe(
        switchMap(result => {
          return result ? this.refreshTokenSubject : throwError(() => new Error('Refresh token failed'));
        })
      );
    }

    this.refreshTokenInProgress = true;
    this.refreshTokenSubject.next(null);

    return this.http.post<TokenResponse>(`${this.baseUrl}/auth/api/token/refresh/`, {
      refresh: refreshToken
    }).pipe(
      tap(response => {
        this.refreshTokenInProgress = false;
        this.refreshTokenSubject.next(response);
        this.storeTokens(response);
      }),
      catchError(error => {
        this.refreshTokenInProgress = false;
        this.logout();
        return throwError(() => new Error('Session expired. Please log in again.'));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private storeTokens(tokens: TokenResponse): void {
    if (!tokens.access || !tokens.refresh) {
      console.error('Invalid token data', tokens);
      return;
    }

    localStorage.setItem('accessToken', tokens.access);
    localStorage.setItem('refreshToken', tokens.refresh);
    console.log('Tokens stored successfully', {
      accessToken: !!tokens.access,
      refreshToken: !!tokens.refresh
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorObj: ApiError = {};

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorObj.detail = `Client error: ${error.error.message}`;
    } else {
      // Server-side error
      errorObj = error.error || { detail: 'Server error occurred' };
    }

    return throwError(() => errorObj);
  }
}
