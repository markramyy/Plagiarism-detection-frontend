import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

// Report Summary Interface (nested within history)
export interface ReportSummary {
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

// History Item Interface
export interface HistoryItem {
  guid: string;
  title: string;
  tags: string[];
  is_favorite: boolean;
  is_archived: boolean;
  last_viewed: string;
  view_count: number;
  created: string;
  report_summary: ReportSummary;
}

// History List Response Interface
export interface HistoryListResponse {
  message: string;
  results: HistoryItem[];
  count: number;
  next?: string | null;
  previous?: string | null;
}

// History Detail Response Interface
export interface HistoryDetailResponse {
  message: string;
  data: {
    guid: string;
    title: string;
    tags: string[];
    is_favorite: boolean;
    is_archived: boolean;
    last_viewed: string;
    view_count: number;
    created: string;
    modified: string;
    report_detail: any; // Full report detail structure
  };
}

// History Update Interface
export interface HistoryUpdate {
  title?: string;
  tags?: string[];
  is_favorite?: boolean;
  is_archived?: boolean;
}

// Statistics Interface
export interface UserStatistics {
  total_reports: number;
  high_risk_count: number;
  average_score: number;
  favorite_count: number;
  archived_count: number;
}

export interface UserStatisticsResponse {
  message: string;
  data: UserStatistics;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
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

    // Get paginated list of history items
    getHistory(
        page: number = 1,
        pageSize: number = 20,
        filters: {
        is_favorite?: boolean;
        is_archived?: boolean;
        tags?: string[];
        } = {}
    ): Observable<HistoryListResponse> {
        this.logAuthStatus();

        let params = new HttpParams()
        .set('page', page.toString())
        .set('page_size', pageSize.toString());

        // Add filters
        if (filters.is_favorite !== undefined) {
        params = params.set('is_favorite', filters.is_favorite.toString());
        }

        if (filters.is_archived !== undefined) {
        params = params.set('is_archived', filters.is_archived.toString());
        }

        if (filters.tags && filters.tags.length > 0) {
        params = params.set('tags', filters.tags.join(','));
        }

        const url = `${this.baseUrl}/report/history/`;
        const headers = this.getHeaders();

        return this.http.get<HistoryListResponse>(url, { headers, params });
    }

    // Get detailed history item by ID
    getHistoryById(historyId: string): Observable<HistoryDetailResponse> {
        this.logAuthStatus();
        const url = `${this.baseUrl}/report/history/${historyId}/`;
        const headers = this.getHeaders();

        return this.http.get<HistoryDetailResponse>(url, { headers });
    }

    // Update history item (title, tags, favorite, archive status)
    updateHistory(historyId: string, updates: HistoryUpdate): Observable<any> {
        this.logAuthStatus();
        const url = `${this.baseUrl}/report/history/${historyId}/`;
        const headers = this.getHeaders();

        return this.http.patch(url, updates, { headers });
    }

    // Toggle favorite status
    toggleFavorite(historyId: string): Observable<any> {
        this.logAuthStatus();
        const url = `${this.baseUrl}/report/history/${historyId}/toggle-favorite/`;
        const headers = this.getHeaders();

        return this.http.post(url, {}, { headers });
    }

    // Toggle archive status
    toggleArchive(historyId: string): Observable<any> {
        this.logAuthStatus();
        const url = `${this.baseUrl}/report/history/${historyId}/toggle-archive/`;
        const headers = this.getHeaders();

        return this.http.post(url, {}, { headers });
    }

    // Delete history item
    deleteHistory(historyId: string): Observable<any> {
        this.logAuthStatus();
        const url = `${this.baseUrl}/report/history/${historyId}/`;
        const headers = this.getHeaders();

        return this.http.delete(url, { headers });
    }

    // Get user statistics
    getUserStatistics(): Observable<UserStatisticsResponse> {
        this.logAuthStatus();
        const url = `${this.baseUrl}/report/reports/user-statistics/`;
        const headers = this.getHeaders();

        return this.http.get<UserStatisticsResponse>(url, { headers });
    }

    // Get favorites only
    getFavorites(page: number = 1, pageSize: number = 20): Observable<HistoryListResponse> {
        return this.getHistory(page, pageSize, { is_favorite: true });
    }

    // Get archived items only
    getArchived(page: number = 1, pageSize: number = 20): Observable<HistoryListResponse> {
        return this.getHistory(page, pageSize, { is_archived: true });
    }

    // Search history by tags
    searchByTags(tags: string[], page: number = 1, pageSize: number = 20): Observable<HistoryListResponse> {
        return this.getHistory(page, pageSize, { tags });
    }

  // Bulk operations
  bulkUpdateHistory(historyIds: string[], updates: HistoryUpdate): Observable<any> {
    this.logAuthStatus();
    const headers = this.getHeaders();

    // Since the backend doesn't have bulk update, we'll do multiple requests
    const requests = historyIds.map(id => this.updateHistory(id, updates));

    // Execute all requests and wait for all to complete
    return new Observable(observer => {
      let completed = 0;
      let errors: any[] = [];

      requests.forEach((request, index) => {
        request.subscribe({
          next: (result) => {
            completed++;
            if (completed === requests.length) {
              if (errors.length === 0) {
                observer.next({ success: true, updated: historyIds.length });
              } else {
                observer.error({ errors, partialSuccess: completed - errors.length });
              }
              observer.complete();
            }
          },
          error: (error) => {
            errors.push({ id: historyIds[index], error });
            completed++;
            if (completed === requests.length) {
              observer.error({ errors, partialSuccess: completed - errors.length });
              observer.complete();
            }
          }
        });
      });
    });
  }

  // Bulk delete
  bulkDeleteHistory(historyIds: string[]): Observable<any> {
    this.logAuthStatus();
    const headers = this.getHeaders();

    // Since the backend doesn't have bulk delete, we'll do multiple requests
    const requests = historyIds.map(id => this.deleteHistory(id));

    // Execute all requests and wait for all to complete
    return new Observable(observer => {
      let completed = 0;
      let errors: any[] = [];

      requests.forEach((request, index) => {
        request.subscribe({
          next: (result) => {
            completed++;
            if (completed === requests.length) {
              if (errors.length === 0) {
                observer.next({ success: true, deleted: historyIds.length });
              } else {
                observer.error({ errors, partialSuccess: completed - errors.length });
              }
              observer.complete();
            }
          },
          error: (error) => {
            errors.push({ id: historyIds[index], error });
            completed++;
            if (completed === requests.length) {
              observer.error({ errors, partialSuccess: completed - errors.length });
              observer.complete();
            }
          }
        });
      });
    });
  }

  // Download report from history
  downloadReport(historyId: string, format: string = 'pdf'): Observable<Blob> {
    this.logAuthStatus();
    const url = `${this.baseUrl}/report/history/${historyId}/download/`;
    const headers = this.getHeaders();

    let params = new HttpParams().set('format', format);

    return this.http.get(url, {
      headers,
      params,
      responseType: 'blob'
    });
  }

  // Export history data as CSV
  exportHistory(filters: {
    is_favorite?: boolean;
    is_archived?: boolean;
    tags?: string[];
  } = {}): Observable<Blob> {
    this.logAuthStatus();
    const url = `${this.baseUrl}/report/history/export/`;
    const headers = this.getHeaders();

    let params = new HttpParams();

    // Add filters
    if (filters.is_favorite !== undefined) {
      params = params.set('is_favorite', filters.is_favorite.toString());
    }

    if (filters.is_archived !== undefined) {
      params = params.set('is_archived', filters.is_archived.toString());
    }

    if (filters.tags && filters.tags.length > 0) {
      params = params.set('tags', filters.tags.join(','));
    }

    return this.http.get(url, {
      headers,
      params,
      responseType: 'blob'
    });
  }

  // Duplicate a history item
  duplicateHistory(historyId: string): Observable<any> {
    this.logAuthStatus();
    const url = `${this.baseUrl}/report/history/${historyId}/duplicate/`;
    const headers = this.getHeaders();

    return this.http.post(url, {}, { headers });
  }

  // Get history statistics for a specific time period
  getHistoryStatistics(period: 'week' | 'month' | 'year' = 'month'): Observable<any> {
    this.logAuthStatus();
    const url = `${this.baseUrl}/report/history/statistics/`;
    const headers = this.getHeaders();

    let params = new HttpParams().set('period', period);

    return this.http.get(url, { headers, params });
  }

  // Bulk toggle favorite
  bulkToggleFavorite(historyIds: string[], favorite: boolean): Observable<any> {
    this.logAuthStatus();

    const requests = historyIds.map(id =>
      this.updateHistory(id, { is_favorite: favorite })
    );

    return new Observable(observer => {
      let completed = 0;
      let errors: any[] = [];

      requests.forEach((request, index) => {
        request.subscribe({
          next: (result) => {
            completed++;
            if (completed === requests.length) {
              if (errors.length === 0) {
                observer.next({
                  success: true,
                  updated: historyIds.length,
                  action: favorite ? 'favorited' : 'unfavorited'
                });
              } else {
                observer.error({ errors, partialSuccess: completed - errors.length });
              }
              observer.complete();
            }
          },
          error: (error) => {
            errors.push({ id: historyIds[index], error });
            completed++;
            if (completed === requests.length) {
              observer.error({ errors, partialSuccess: completed - errors.length });
              observer.complete();
            }
          }
        });
      });
    });
  }

  // Bulk toggle archive
  bulkToggleArchive(historyIds: string[], archive: boolean): Observable<any> {
    this.logAuthStatus();

    const requests = historyIds.map(id =>
      this.updateHistory(id, { is_archived: archive })
    );

    return new Observable(observer => {
      let completed = 0;
      let errors: any[] = [];

      requests.forEach((request, index) => {
        request.subscribe({
          next: (result) => {
            completed++;
            if (completed === requests.length) {
              if (errors.length === 0) {
                observer.next({
                  success: true,
                  updated: historyIds.length,
                  action: archive ? 'archived' : 'unarchived'
                });
              } else {
                observer.error({ errors, partialSuccess: completed - errors.length });
              }
              observer.complete();
            }
          },
          error: (error) => {
            errors.push({ id: historyIds[index], error });
            completed++;
            if (completed === requests.length) {
              observer.error({ errors, partialSuccess: completed - errors.length });
              observer.complete();
            }
          }
        });
      });
    });
  }
}