import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment';
import { AuthService } from './auth.service';

export interface ComponentScores {
  structural_similarity: number;
  semantic_similarity: number;
  meaning_similarity: number;
  exact_similarity: number;
}

export interface ReportComponentScore {
  guid: string;
  component_type: string;
  component_display: string;
  score: number;
  formatted_score: string;
  weight: number;
}

export interface Report {
  guid: string;
  check_type: string;
  check_type_display: string;
  verdict: string;
  verdict_display: string;
  overall_score: number;
  formatted_score: string;
  is_plagiarized: boolean;
  is_high_risk: boolean;
  confidence: number;
  created: string;
  component_scores: ReportComponentScore[];
  suspicious_file_name?: string;
  source_file_name?: string;
  suspicious_text?: string;
  processing_time?: number;
}

export interface DetailedResults {
  overall_score: number;
  component_scores: ComponentScores;
}

export interface PlagiarismResult {
  verdict: string;
  scores: {
    hybrid: number;
    lstm1: number;
    lstm2: number;
    bert: number;
    tfidf: number;
    basic_hybrid?: number;
  };
  detailed_results: DetailedResults;
  analysis?: string[];
  explanation?: string[];
  plagiarized_segments?: {
    source_segment: string;
    suspect_segment: string;
    similarity: number;
    position_source: number;
    position_suspect: number;
    analysis: string[];
    highlighted_differences: any[];
  }[];
  scoring_details?: {
    basic_calculation: string;
    enhanced_score: string;
    weights_used: string;
    enhancement: string;
    enhancement_reason: string;
  };
}

export interface ReportsResponse {
  message: string;
  results: Report[];
  count: number;
  next?: string | null;
  previous?: string | null;
}

export interface PlagiarismResponse {
  message: string;
  report_id: string;
  plagiarism: PlagiarismResult;
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

  getReports(page: number = 1, pageSize: number = 10): Observable<ReportsResponse> {
    this.logAuthStatus();
    const url = `${this.baseUrl}/report/reports/?page=${page}&page_size=${pageSize}`;

    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<ReportsResponse>(url, { headers });
  }

  getReportById(reportId: string): Observable<Report> {
    this.logAuthStatus();
    const url = `${this.baseUrl}/report/reports/${reportId}/`;

    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Report>(url, { headers });
  }
}
