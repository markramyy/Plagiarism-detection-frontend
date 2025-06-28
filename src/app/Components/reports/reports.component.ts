import { Component, OnInit } from '@angular/core';

interface ComponentScore {
  guid: string;
  component_type: string;
  component_display: string;
  score: number;
  formatted_score: string;
  weight: number;
}

interface Report {
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
  modified: string;
  component_scores: ComponentScore[];
  suspicious_file_name?: string;
  source_file_name?: string;
  suspicious_text?: string;
  processing_time?: number;
}

interface ReportsResponse {
  message: string;
  data: Report[];
  total_count: number;
  page: number;
  page_size: number;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  reports: Report[] = [];
  filteredReports: Report[] = [];
  loading = false;
  error: string | null = null;

  // Filters
  searchTerm = '';
  selectedVerdict = '';
  selectedCheckType = '';
  dateFilter = '';

  // Sorting
  sortBy = 'created';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalReports = 0;

  // UI
  viewMode: 'grid' | 'list' = 'grid';

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
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;
    this.error = null;

    // Mock data based on real backend structure
    setTimeout(() => {
      const mockResponse: ReportsResponse = {
        message: "Reports fetched successfully",
        data: [
          {
            guid: "550e8400-e29b-41d4-a716-446655440001",
            check_type: "text_to_file",
            check_type_display: "Text to File",
            verdict: "MID",
            verdict_display: "MID plagiarism risk",
            overall_score: 58.85,
            formatted_score: "58.85%",
            is_plagiarized: true,
            is_high_risk: false,
            confidence: 0.5885,
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
              },
              {
                guid: "362699f4-c0fb-4868-ad7e-2e2ac80a9722",
                component_type: "semantic",
                component_display: "Semantic Similarity (LSTM2)",
                score: 100,
                formatted_score: "100.00%",
                weight: 0.3
              }
            ],
            suspicious_file_name: "user_text.txt",
            source_file_name: "sample_pdf.pdf",
            suspicious_text: "The Renaissance era represented a time of cultural, artistic, political and economic revival...",
            processing_time: 2.67
          },
          {
            guid: "550e8400-e29b-41d4-a716-446655440002",
            check_type: "file_to_file",
            check_type_display: "File to File",
            verdict: "HIGH",
            verdict_display: "HIGH plagiarism risk",
            overall_score: 87.45,
            formatted_score: "87.45%",
            is_plagiarized: true,
            is_high_risk: true,
            confidence: 0.8745,
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
              },
              {
                guid: "362699f4-c0fb-4868-ad7e-2e2ac80a9723",
                component_type: "semantic",
                component_display: "Semantic Similarity (LSTM2)",
                score: 92.15,
                formatted_score: "92.15%",
                weight: 0.3
              }
            ],
            suspicious_file_name: "student_essay.docx",
            source_file_name: "reference_paper.pdf",
            suspicious_text: "Machine learning is a powerful tool that enables computers to learn patterns...",
            processing_time: 5.23
          },
          {
            guid: "550e8400-e29b-41d4-a716-446655440003",
            check_type: "text_to_text",
            check_type_display: "Text to Text",
            verdict: "LOW",
            verdict_display: "LOW plagiarism risk",
            overall_score: 15.23,
            formatted_score: "15.23%",
            is_plagiarized: false,
            is_high_risk: false,
            confidence: 0.1523,
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
              },
              {
                guid: "362699f4-c0fb-4868-ad7e-2e2ac80a9724",
                component_type: "semantic",
                component_display: "Semantic Similarity (LSTM2)",
                score: 18.67,
                formatted_score: "18.67%",
                weight: 0.3
              }
            ],
            suspicious_file_name: "text_input.txt",
            source_file_name: "comparison_text.txt",
            suspicious_text: "Climate change represents one of the most significant challenges of our time...",
            processing_time: 1.45
          }
        ],
        total_count: 3,
        page: 1,
        page_size: 10
      };

      this.reports = mockResponse.data;
      this.totalReports = mockResponse.total_count;
      this.filterReports();
      this.loading = false;
    }, 500);
  }

  filterReports(): void {
    this.filteredReports = this.reports.filter(report => {
      const matchesSearch = !this.searchTerm ||
        report.suspicious_file_name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        report.source_file_name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        report.check_type_display.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesVerdict = !this.selectedVerdict || report.verdict === this.selectedVerdict;
      const matchesCheckType = !this.selectedCheckType || report.check_type === this.selectedCheckType;

      let matchesDate = true;
      if (this.dateFilter) {
        const reportDate = new Date(report.created).toDateString();
        const filterDate = new Date(this.dateFilter).toDateString();
        matchesDate = reportDate === filterDate;
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
        case 'score':
          comparison = a.overall_score - b.overall_score;
          break;
        case 'verdict':
          comparison = a.verdict.localeCompare(b.verdict);
          break;
        case 'type':
          comparison = a.check_type.localeCompare(b.check_type);
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
    this.filterReports();
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

  exportReport(reportId: string): void {
    console.log('Exporting report:', reportId);
    // Implement export functionality
  }

  deleteReport(report: Report, event?: Event): void {
    if (event) event.stopPropagation();
    if (confirm('Are you sure you want to delete this report?')) {
      console.log('Deleting report:', report.guid);
      // Implement delete functionality
      this.reports = this.reports.filter(r => r.guid !== report.guid);
      this.filterReports();
    }
  }

  getFileName(filePath: string): string {
    if (!filePath) return '';
    return filePath.split('/').pop() || filePath;
  }

  // Navigation and actions
  viewReport(reportId: string): void {
    // Navigate to report detail page
    console.log('Viewing report:', reportId);
    // this.router.navigate(['/reports', reportId]);
  }

  downloadReport(report: Report, event: Event): void {
    event.stopPropagation();
    console.log('Downloading report:', report.guid);
    // Implement download functionality
  }

  shareReport(report: Report, event: Event): void {
    event.stopPropagation();
    console.log('Sharing report:', report.guid);
    // Implement share functionality
  }

  // Template helper methods
  getTypeLabel(checkType: string): string {
    const labels: { [key: string]: string } = {
      'text_to_text': 'Text to Text',
      'text_to_file': 'Text to File',
      'file_to_file': 'File to File'
    };
    return labels[checkType] || checkType;
  }

  getReportTitle(report: Report): string {
    if (report.suspicious_file_name && report.source_file_name) {
      return `${this.getFileName(report.suspicious_file_name)} vs ${this.getFileName(report.source_file_name)}`;
    }
    return `${report.check_type_display} Analysis`;
  }

  getVerdictLabel(verdict: string): string {
    const labels: { [key: string]: string } = {
      'LOW': 'Low Risk',
      'MID_LOW': 'Mid-Low Risk',
      'MID': 'Mid Risk',
      'MID_HIGH': 'Mid-High Risk',
      'HIGH': 'High Risk'
    };
    return labels[verdict] || verdict;
  }

  getPreviewText(text: string, maxLength: number = 150): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  // Pagination
  get totalPages(): number {
    return Math.ceil(this.totalReports / this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // In real implementation, reload data for the new page
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
}
