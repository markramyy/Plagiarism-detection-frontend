import { Component, OnInit } from '@angular/core';

interface ComponentScore {
  guid: string;
  component_type: string;
  component_display: string;
  score: number;
  formatted_score: string;
  weight: number;
}

interface HistoryReport {
  guid: string;
  title: string;
  check_type: string;
  check_type_display: string;
  verdict: string;
  verdict_display: string;
  overall_score: number;
  formatted_score: string;
  is_plagiarized: boolean;
  is_high_risk: boolean;
  confidence: number;
  word_count: number;
  character_count: number;
  processing_time: number;
  created: string;
  modified: string;
  component_scores: ComponentScore[];
  suspicious_file_name?: string;
  source_file_name?: string;
  metadata: {
    user_id?: string;
    session_id?: string;
    ip_address?: string;
    user_agent?: string;
  };
  // Additional properties for history UI
  is_archived?: boolean;
  is_favorite?: boolean;
  last_viewed?: string;
  view_count?: number;
  tags?: string[];
}

interface HistoryResponse {
  message: string;
  data: HistoryReport[];
  total_count: number;
  page: number;
  page_size: number;
}

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  reports: HistoryReport[] = [];
  filteredReports: HistoryReport[] = [];
  loading = false;
  error: string | null = null;

  // Filters
  searchTerm = '';
  selectedVerdict = '';
  selectedCheckType = '';
  dateFilter = '';
  startDate = '';
  endDate = '';
  selectedPeriod = '';

  // Sorting
  sortBy = 'created';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Pagination
  currentPage = 1;
  pageSize = 20;
  totalReports = 0;
  totalPages = 0;

  // UI
  selectedReports: string[] = [];
  showFilters = false;
  viewMode: 'grid' | 'list' = 'grid';
  showArchived = false;

  // Additional properties for history view
  filteredHistory: HistoryReport[] = [];
  paginatedHistory: HistoryReport[] = [];
  favoriteReports = 0;
  thisMonthReports = 0;
  totalItems = 0;
  showOptionsMenuFor: HistoryReport | null = null;
  optionsMenuPosition = { x: 0, y: 0 };

  verdictOptions = [
    { value: '', label: 'All Verdicts' },
    { value: 'LOW', label: 'Low Risk' },
    { value: 'MID_LOW', label: 'Mid-Low Risk' },
    { value: 'MID', label: 'Mid Risk' },
    { value: 'MID_HIGH', label: 'Mid-High Risk' },
    { value: 'HIGH', label: 'High Risk' }
  ];

  checkTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'text_to_text', label: 'Text to Text' },
    { value: 'text_to_file', label: 'Text to File' },
    { value: 'file_to_file', label: 'File to File' }
  ];

  constructor() { }

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading = true;
    this.error = null;

    // Mock data based on real backend structure
    setTimeout(() => {
      const mockResponse: HistoryResponse = {
        message: "History fetched successfully",
        data: [
          {
            guid: "hist-550e8400-e29b-41d4-a716-446655440001",
            title: "Academic Paper Analysis - Renaissance Art",
            check_type: "text_to_file",
            check_type_display: "Text to File",
            verdict: "MID",
            verdict_display: "MID plagiarism risk",
            overall_score: 58.85,
            formatted_score: "58.85%",
            is_plagiarized: true,
            is_high_risk: false,
            confidence: 0.5885,
            word_count: 1247,
            character_count: 7845,
            processing_time: 2.67,
            created: "2025-06-27T09:26:20.060472Z",
            modified: "2025-06-27T09:26:20.060516Z",
            component_scores: [
              {
                guid: "998d2c29-095a-4eab-9069-5dd738bec272",
                component_type: "structural",
                component_display: "Structural Similarity (LSTM1)",
                score: 28.96,
                formatted_score: "28.96%",
                weight: 0.3
              }
            ],
            suspicious_file_name: "renaissance_essay.txt",
            source_file_name: "art_history_reference.pdf",
            metadata: {
              user_id: "user123",
              session_id: "sess_456",
              ip_address: "192.168.1.100",
              user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
            is_archived: false,
            is_favorite: true,
            last_viewed: "2025-06-27T15:30:00.000000Z",
            view_count: 3,
            tags: ["academic", "renaissance", "art-history"]
          },
          {
            guid: "hist-550e8400-e29b-41d4-a716-446655440002",
            title: "Literature Review - Machine Learning Applications",
            check_type: "file_to_file",
            check_type_display: "File to File",
            verdict: "HIGH",
            verdict_display: "HIGH plagiarism risk",
            overall_score: 87.45,
            formatted_score: "87.45%",
            is_plagiarized: true,
            is_high_risk: true,
            confidence: 0.8745,
            word_count: 3456,
            character_count: 21890,
            processing_time: 5.23,
            created: "2025-06-26T14:15:30.000000Z",
            modified: "2025-06-26T14:15:30.000000Z",
            component_scores: [
              {
                guid: "998d2c29-095a-4eab-9069-5dd738bec273",
                component_type: "structural",
                component_display: "Structural Similarity (LSTM1)",
                score: 85.32,
                formatted_score: "85.32%",
                weight: 0.3
              }
            ],
            suspicious_file_name: "ml_literature_review.docx",
            source_file_name: "ieee_ml_paper.pdf",
            metadata: {
              user_id: "user123",
              session_id: "sess_789",
              ip_address: "192.168.1.100",
              user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
            is_archived: false,
            is_favorite: false,
            last_viewed: "2025-06-26T18:45:00.000000Z",
            view_count: 7,
            tags: ["machine-learning", "literature-review", "ieee"]
          },
          {
            guid: "hist-550e8400-e29b-41d4-a716-446655440003",
            title: "Short Essay - Climate Change Effects",
            check_type: "text_to_text",
            check_type_display: "Text to Text",
            verdict: "LOW",
            verdict_display: "LOW plagiarism risk",
            overall_score: 15.23,
            formatted_score: "15.23%",
            is_plagiarized: false,
            is_high_risk: false,
            confidence: 0.1523,
            word_count: 567,
            character_count: 3421,
            processing_time: 1.45,
            created: "2025-06-25T10:30:45.000000Z",
            modified: "2025-06-25T10:30:45.000000Z",
            component_scores: [
              {
                guid: "998d2c29-095a-4eab-9069-5dd738bec274",
                component_type: "structural",
                component_display: "Structural Similarity (LSTM1)",
                score: 12.45,
                formatted_score: "12.45%",
                weight: 0.3
              }
            ],
            suspicious_file_name: "climate_essay.txt",
            source_file_name: "climate_reference.txt",
            metadata: {
              user_id: "user123",
              session_id: "sess_012",
              ip_address: "192.168.1.100",
              user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
            is_archived: false,
            is_favorite: false,
            last_viewed: "2025-06-25T12:15:00.000000Z",
            view_count: 2,
            tags: ["climate", "environment", "essay"]
          },
          {
            guid: "hist-550e8400-e29b-41d4-a716-446655440004",
            title: "Research Proposal - Quantum Computing",
            check_type: "file_to_file",
            check_type_display: "File to File",
            verdict: "MID_HIGH",
            verdict_display: "MID-HIGH plagiarism risk",
            overall_score: 72.16,
            formatted_score: "72.16%",
            is_plagiarized: true,
            is_high_risk: true,
            confidence: 0.7216,
            word_count: 2890,
            character_count: 18765,
            processing_time: 4.12,
            created: "2025-06-24T16:45:22.000000Z",
            modified: "2025-06-24T16:45:22.000000Z",
            component_scores: [
              {
                guid: "998d2c29-095a-4eab-9069-5dd738bec275",
                component_type: "structural",
                component_display: "Structural Similarity (LSTM1)",
                score: 68.92,
                formatted_score: "68.92%",
                weight: 0.3
              }
            ],
            suspicious_file_name: "quantum_proposal.pdf",
            source_file_name: "quantum_research_papers.pdf",
            metadata: {
              user_id: "user123",
              session_id: "sess_345",
              ip_address: "192.168.1.100",
              user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
          }
        ],
        total_count: 4,
        page: 1,
        page_size: 20
      };

      this.reports = mockResponse.data;
      this.totalReports = mockResponse.total_count;
      this.totalPages = Math.ceil(this.totalReports / this.pageSize);
      this.totalItems = this.totalReports;

      // Initialize additional stats
      this.favoriteReports = 2; // Mock favorite count
      this.thisMonthReports = this.reports.filter(r => {
        const reportDate = new Date(r.created);
        const now = new Date();
        return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
      }).length;

      this.filteredHistory = [...this.reports];
      this.filterHistory();
      this.loading = false;
    }, 500);
  }

  filterReports(): void {
    this.filteredReports = this.reports.filter(report => {
      const matchesSearch = !this.searchTerm ||
        report.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        report.suspicious_file_name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        report.source_file_name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        report.check_type_display.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesVerdict = !this.selectedVerdict || report.verdict === this.selectedVerdict;
      const matchesCheckType = !this.selectedCheckType || report.check_type === this.selectedCheckType;

      let matchesDate = true;
      if (this.startDate || this.endDate) {
        const reportDate = new Date(report.created);
        if (this.startDate && this.endDate) {
          const start = new Date(this.startDate);
          const end = new Date(this.endDate);
          matchesDate = reportDate >= start && reportDate <= end;
        } else if (this.startDate) {
          matchesDate = reportDate >= new Date(this.startDate);
        } else if (this.endDate) {
          matchesDate = reportDate <= new Date(this.endDate);
        }
      }

      return matchesSearch && matchesVerdict && matchesCheckType && matchesDate;
    });

    this.sortReports();
  }

  sortReports(): void {
    this.filteredReports.sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy) {
        case 'created':
          comparison = new Date(a.created).getTime() - new Date(b.created).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'score':
          comparison = a.overall_score - b.overall_score;
          break;
        case 'verdict':
          comparison = a.verdict.localeCompare(b.verdict);
          break;
        case 'type':
          comparison = a.check_type.localeCompare(b.check_type);
          break;
        case 'word_count':
          comparison = a.word_count - b.word_count;
          break;
        default:
          comparison = 0;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  onSearchChange(): void {
    this.filterReports();
  }

  onFilterChange(): void {
    this.filterReports();
  }

  toggleSort(field: string): void {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'desc';
    }
    this.sortReports();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedVerdict = '';
    this.selectedCheckType = '';
    this.dateFilter = '';
    this.startDate = '';
    this.endDate = '';
    this.filterReports();
  }

  toggleReportSelection(reportId: string): void {
    const index = this.selectedReports.indexOf(reportId);
    if (index > -1) {
      this.selectedReports.splice(index, 1);
    } else {
      this.selectedReports.push(reportId);
    }
  }

  selectAllReports(): void {
    if (this.selectedReports.length === this.filteredReports.length) {
      this.selectedReports = [];
    } else {
      this.selectedReports = this.filteredReports.map(r => r.guid);
    }
  }

  deleteSelectedReports(): void {
    if (this.selectedReports.length === 0) return;

    const count = this.selectedReports.length;
    if (confirm(`Are you sure you want to delete ${count} selected report(s)?`)) {
      console.log('Deleting reports:', this.selectedReports);
      // Implement bulk delete functionality
      this.reports = this.reports.filter(r => !this.selectedReports.includes(r.guid));
      this.selectedReports = [];
      this.filterReports();
    }
  }

  exportSelectedReports(): void {
    if (this.selectedReports.length === 0) return;

    console.log('Exporting reports:', this.selectedReports);
    // Implement bulk export functionality
  }

  getVerdictClass(verdict: string): string {
    const classes: { [key: string]: string } = {
      'LOW': 'verdict-low',
      'MID_LOW': 'verdict-mid-low',
      'MID': 'verdict-mid',
      'MID_HIGH': 'verdict-mid-high',
      'HIGH': 'verdict-high'
    };
    return classes[verdict] || 'verdict-unknown';
  }

  getVerdictIcon(verdict: string): string {
    const icons: { [key: string]: string } = {
      'LOW': 'fas fa-check-circle',
      'MID_LOW': 'fas fa-info-circle',
      'MID': 'fas fa-exclamation-triangle',
      'MID_HIGH': 'fas fa-exclamation-triangle',
      'HIGH': 'fas fa-times-circle'
    };
    return icons[verdict] || 'fas fa-info-circle';
  }

  getTypeIcon(checkType: string): string {
    const icons: { [key: string]: string } = {
      'text_to_text': 'fas fa-font',
      'text_to_file': 'fas fa-file-alt',
      'file_to_file': 'fas fa-copy'
    };
    return icons[checkType] || 'fas fa-file';
  }

  getRiskLevelClass(isHighRisk: boolean, isPlagiarized: boolean): string {
    if (isHighRisk) return 'risk-high';
    if (isPlagiarized) return 'risk-medium';
    return 'risk-low';
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'score-high';
    if (score >= 50) return 'score-medium';
    if (score >= 30) return 'score-low';
    return 'score-very-low';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getProcessingTimeClass(time: number): string {
    if (time > 5) return 'time-slow';
    if (time > 2) return 'time-medium';
    return 'time-fast';
  }

  getFileName(filePath: string): string {
    if (!filePath) return '';
    return filePath.split('/').pop() || filePath;
  }

  generateReportSummary(report: HistoryReport): string {
    const riskLevel = report.is_high_risk ? 'High' : (report.is_plagiarized ? 'Medium' : 'Low');
    return `${report.check_type_display} analysis with ${report.formatted_score} similarity score (${riskLevel} risk)`;
  }

  // Pagination methods
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // In real implementation, reload data for the new page
    }
  }

  getPaginationPages(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    const startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    const endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Additional methods for history functionality
  filterHistory(): void {
    this.filteredHistory = this.reports.filter(report => {
      const matchesSearch = !this.searchTerm ||
        report.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        report.suspicious_file_name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        report.source_file_name?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesVerdict = !this.selectedVerdict || report.verdict === this.selectedVerdict;

      let matchesPeriod = true;
      if (this.selectedPeriod) {
        const reportDate = new Date(report.created);
        const now = new Date();
        switch (this.selectedPeriod) {
          case 'today':
            matchesPeriod = reportDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesPeriod = reportDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesPeriod = reportDate >= monthAgo;
            break;
        }
      }

      return matchesSearch && matchesVerdict && matchesPeriod;
    });

    this.updatePagination();
    this.sortReports();
  }

  updatePagination(): void {
    this.totalItems = this.filteredHistory.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedHistory = this.filteredHistory.slice(startIndex, endIndex);
  }

  openReport(reportId: string): void {
    console.log('Opening report:', reportId);
    // Navigate to report detail page
    // this.router.navigate(['/reports', reportId]);
  }

  toggleFavorite(item: HistoryReport, event: Event): void {
    event.stopPropagation();
    console.log('Toggling favorite for:', item.guid);
    // Implement favorite functionality
  }

  showOptionsMenu(item: HistoryReport, event: Event): void {
    event.stopPropagation();
    this.showOptionsMenuFor = item;
    this.optionsMenuPosition = { x: (event as MouseEvent).clientX, y: (event as MouseEvent).clientY };
  }

  downloadReport(report: HistoryReport, event: Event): void {
    event.stopPropagation();
    console.log('Downloading report:', report.guid);
    // Implement download functionality
  }

  exportHistory(): void {
    console.log('Exporting history');
    // Implement export functionality
  }

  editTitle(item: HistoryReport): void {
    console.log('Editing title for:', item.guid);
    this.showOptionsMenuFor = null;
    // Implement title editing
  }

  manageTags(item: HistoryReport): void {
    console.log('Managing tags for:', item.guid);
    this.showOptionsMenuFor = null;
    // Implement tag management
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    const startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    const endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Template helper for Math access
  get Math() {
    return Math;
  }

  duplicateReport(item: HistoryReport): void {
    console.log('Duplicating report:', item.guid);
    this.showOptionsMenuFor = null;
    // Implement report duplication
    // This would typically create a new check based on the same files
  }

  toggleArchive(item: HistoryReport): void {
    console.log('Toggling archive for:', item.guid);
    item.is_archived = !item.is_archived;
    this.showOptionsMenuFor = null;
    // Implement archive toggle API call
  }

  deleteHistoryItem(item: HistoryReport): void {
    console.log('Deleting history item:', item.guid);
    if (confirm('Are you sure you want to delete this history item? This action cannot be undone.')) {
      this.reports = this.reports.filter(r => r.guid !== item.guid);
      this.filterHistory();
      this.showOptionsMenuFor = null;
      // Implement delete API call
    }
  }
}
