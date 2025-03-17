import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment';
import { AuthService } from './auth.service';

export interface PlagiarismResponse {
  message: string;
  plagiarism: {
    verdict: string;
    confidence: number;
    is_plagiarized: boolean;
    similarity_score: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PlagiarismService {
  private baseUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private logAuthStatus() {
    const token = this.authService.getToken();
    console.log('Auth token available:', !!token);
    if (!token) {
      console.warn('No authentication token available for request!');
    }
  }

  checkTextToText(suspiciousText: string, sourceText: string): Observable<PlagiarismResponse> {
    this.logAuthStatus();
    const url = `${this.baseUrl}/plagiarism/text-to-text/`;
    const payload = {
      suspicious_text: suspiciousText,
      source_text: sourceText
    };

    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<PlagiarismResponse>(url, payload, { headers });
  }

  checkTextToFile(suspiciousText: string, sourceFile: File): Observable<PlagiarismResponse> {
    this.logAuthStatus();
    const url = `${this.baseUrl}/plagiarism/text-to-file/`;
    const formData = new FormData();
    formData.append('suspicious_text', suspiciousText);
    formData.append('source_file', sourceFile);

    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<PlagiarismResponse>(url, formData, { headers });
  }

  checkFileToFile(suspiciousFile: File, sourceFile: File): Observable<PlagiarismResponse> {
    this.logAuthStatus();
    const url = `${this.baseUrl}/plagiarism/file-to-file/`;
    const formData = new FormData();
    formData.append('suspicious_file', suspiciousFile);
    formData.append('source_file', sourceFile);

    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<PlagiarismResponse>(url, formData, { headers });
  }
}
