import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlagiarismService, Report, ReportsResponse } from '../../services/plagiarism.service';

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

  constructor(
    private router: Router,
    private plagiarismService: PlagiarismService
  ) { }

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;
    this.error = null;

    this.plagiarismService.getReports(this.currentPage, this.pageSize).subscribe({
      next: (response: ReportsResponse) => {
        console.log('Reports response:', response);
        this.reports = response.results;
        this.totalReports = response.count;
        this.filterReports();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching reports:', error);
        this.error = error.error?.message || 'Failed to load reports. Please try again.';
        this.loading = false;
        this.reports = [];
        this.filteredReports = [];
        this.totalReports = 0;
      }
    });
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
    this.router.navigate(['/report', reportId]);
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
      this.loadReports(); // Reload data for the new page
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

  refreshReports(): void {
    this.currentPage = 1;
    this.loadReports();
  }
}
