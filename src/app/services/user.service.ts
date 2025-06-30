import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environment';

export interface UserProfile {
  email: string;
  first_name: string;
  last_name: string;
  username?: string;
  guid: string;
  created: string;
  modified: string;
  last_login: string;
  is_active: boolean;
  date_joined?: string; // Add this for compatibility
}

export interface UpdateUserPayload {
  first_name: string;
  last_name: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ValidatePasswordPayload {
  password: string;
}

export interface ApiResponse<T = any> {
  message: string;
  showToast?: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get current user profile
   */
  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/users/me/`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Update user profile (first_name and last_name only)
   */
  updateUserProfile(userData: UpdateUserPayload): Observable<ApiResponse<UpdateUserPayload>> {
    return this.http.put<ApiResponse<UpdateUserPayload>>(`${this.baseUrl}/users/`, userData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Validate current password
   */
  validatePassword(passwordData: ValidatePasswordPayload): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/users/validate-password/`, passwordData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Change password with current password validation
   */
  changePassword(currentPassword: string, newPassword: string): Observable<ApiResponse> {
    const payload: ChangePasswordPayload = {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: newPassword
    };

    return this.http.post<ApiResponse>(`${this.baseUrl}/users/change-password/`, payload)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Request password reset via email
   */
  requestPasswordReset(email: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/users/request-password-reset/`, { email })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, guid: string, newPassword: string, confirmPassword: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/users/password-reset/`, {
      token,
      guid,
      new_password: newPassword,
      confirm_password: confirmPassword
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    let errorData: any = {};

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
      if (error.error && error.error.data) {
        errorData = error.error.data;
      }
    }

    return throwError(() => ({
      message: errorMessage,
      data: errorData,
      status: error.status
    }));
  }
}
