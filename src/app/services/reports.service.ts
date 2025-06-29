import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment';
import { AuthService } from './auth.service';

// Component Score Interface
export interface ComponentScore {
  guid: string;
    component_type: string;
    component_display: string;
    score: number;
    formatted_score: string;
    weight: number;
}

// Analysis Insight Interface
export interface AnalysisInsight {
    guid: string;
    insight: string;
    order: number;
}

// Plagiarism Explanation Interface
export interface PlagiarismExplanation {
    guid: string;
    explanation: string;
    order: number;
}

// Matching Segment Interface
export interface MatchingSegment {
    guid: string;
    source_segment: string;
    suspect_segment: string;
    similarity_score: number;
    formatted_similarity: string;
    is_high_similarity: boolean;
    position_source: number;
    position_suspect: number;
    analysis_data: string[];
    differences_data: {
        type: string;
        source_words: string;
        suspect_words: string;
    }[];
}

// Scoring Detail Interface
export interface ScoringDetail {
    guid: string;
    basic_calculation: string;
    enhanced_score: string;
    weights_used: string;
    enhancement: string;
    enhancement_reason: string;
}

// File Detail Interface
export interface FileDetail {
    guid: string;
    file: string;
    file_type: string;
    zip_folder?: string | null;
}

// Report Detail Interface (for detailed view)
export interface ReportDetail {
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
    suspicious_text: string;
    source_text: string;
    processing_time: number;
    notes?: string | null;
    created: string;
    modified: string;

    // Related data
    component_scores: ComponentScore[];
    analysis_insights: AnalysisInsight[];
    explanations: PlagiarismExplanation[];
    matching_segments: MatchingSegment[];
    scoring_details: ScoringDetail[];

    // File details
    suspicious_file_detail?: FileDetail | null;
    source_file_detail?: FileDetail | null;
}

// Report List Item Interface (for listing)
export interface ReportListItem {
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
    suspicious_file_name?: string;
    source_file_name?: string;
    processing_time?: number;
}

// Reports Response Interfaces
export interface ReportsListResponse {
    message: string;
    results: ReportListItem[];
    count: number;
    next?: string | null;
    previous?: string | null;
}

export interface ReportDetailResponse {
    message: string;
    data: ReportDetail;
}

@Injectable({
    providedIn: 'root'
})
export class ReportsService {
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

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
        'Authorization': `Bearer ${token}`
        });
    }

    // Get paginated list of reports
    getReports(page: number = 1, pageSize: number = 10): Observable<ReportsListResponse> {
        this.logAuthStatus();
        const url = `${this.baseUrl}/report/reports/?page=${page}&page_size=${pageSize}`;
        const headers = this.getHeaders();

        return this.http.get<ReportsListResponse>(url, { headers });
    }

    // Get detailed report by ID
    getReportById(reportId: string): Observable<ReportDetailResponse> {
        this.logAuthStatus();
        const url = `${this.baseUrl}/report/reports/${reportId}/`;
        const headers = this.getHeaders();

        return this.http.get<ReportDetailResponse>(url, { headers });
    }

    // Get reports with filters
    getReportsWithFilters(
        page: number = 1,
        pageSize: number = 10,
        filters: {
        check_type?: string;
        verdict?: string;
        min_score?: number;
        max_score?: number;
        date_from?: string;
        date_to?: string;
        } = {}
    ): Observable<ReportsListResponse> {
        this.logAuthStatus();

        let url = `${this.baseUrl}/report/reports/?page=${page}&page_size=${pageSize}`;

        // Add filters to URL
        Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            url += `&${key}=${encodeURIComponent(value)}`;
        }
        });

        const headers = this.getHeaders();
        return this.http.get<ReportsListResponse>(url, { headers });
    }

    // Delete report
    deleteReport(reportId: string): Observable<any> {
        this.logAuthStatus();
        const url = `${this.baseUrl}/report/reports/${reportId}/`;
        const headers = this.getHeaders();

        return this.http.delete(url, { headers });
    }

    // Download report
    downloadReport(reportId: string): Observable<Blob> {
        this.logAuthStatus();
        const url = `${this.baseUrl}/report/reports/${reportId}/download/`;
        const headers = this.getHeaders();

        return this.http.get(url, {
        headers,
        responseType: 'blob'
        });
    }

    // Get report statistics
    getReportStatistics(): Observable<any> {
        this.logAuthStatus();
        const url = `${this.baseUrl}/report/reports/statistics/`;
        const headers = this.getHeaders();

        return this.http.get(url, { headers });
    }
}
