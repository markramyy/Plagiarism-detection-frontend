import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HistoryService, HistoryItem, UserStatistics } from '../../services/history.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  historyItems: HistoryItem[] = [];
  filteredHistory: HistoryItem[] = [];
  paginatedHistory: HistoryItem[] = [];
  loading = false;
  error: string | null = null;

  // Statistics
  statistics: UserStatistics | null = null;
  favoriteReports = 0;
  thisMonthReports = 0;
  totalReports = 0;

  // Filters
  searchTerm = '';
  selectedVerdict = '';
  selectedCheckType = '';
  selectedPeriod = '';
  showArchived = false;

  // Sorting
  sortBy = 'created';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Pagination
  currentPage = 1;
  pageSize = 20;
  totalItems = 0;
  totalPages = 0;

  // UI
  selectedReports: string[] = [];
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
    private historyService: HistoryService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadHistory();
    this.loadStatistics();
  }

  loadHistory(): void {
    this.loading = true;
    this.error = null;

    const filters: any = {};
    if (this.showArchived) {
      filters.is_archived = true;
    } else {
      filters.is_archived = false;
    }

    this.historyService.getHistory(this.currentPage, this.pageSize, filters).subscribe({
      next: (response) => {
        console.log('History response:', response);
        this.historyItems = response.results || [];
        this.totalItems = response.count || 0;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading history:', error);
        this.error = error.error?.message || 'Failed to load history. Please try again.';
        this.loading = false;
        this.toastService.showError('Failed to load history');
      }
    });
  }

  loadStatistics(): void {
    this.historyService.getUserStatistics().subscribe({
      next: (response) => {
        this.statistics = response.data;
        this.totalReports = this.statistics.total_reports;
        this.favoriteReports = this.statistics.favorite_count;
        // Calculate this month reports (you might want to add this to backend)
        this.thisMonthReports = Math.floor(this.totalReports * 0.3); // Mock calculation
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredHistory = this.historyItems.filter(item => {
      // Search term filter
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(searchLower);
        const matchesTags = item.tags.some(tag => tag.toLowerCase().includes(searchLower));
        const matchesVerdict = item.report_summary.verdict_display.toLowerCase().includes(searchLower);

        if (!matchesTitle && !matchesTags && !matchesVerdict) {
          return false;
        }
      }

      // Verdict filter
      if (this.selectedVerdict && item.report_summary.verdict !== this.selectedVerdict) {
        return false;
      }

      // Check type filter
      if (this.selectedCheckType && item.report_summary.check_type !== this.selectedCheckType) {
        return false;
      }

      // Period filter
      if (this.selectedPeriod) {
        const itemDate = new Date(item.created);
        const now = new Date();

        switch (this.selectedPeriod) {
          case 'today':
            if (itemDate.toDateString() !== now.toDateString()) return false;
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (itemDate < weekAgo) return false;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (itemDate < monthAgo) return false;
            break;
          case 'year':
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            if (itemDate < yearAgo) return false;
            break;
        }
      }

      return true;
    });

    this.applySorting();
    this.updatePagination();
  }

  applySorting(): void {
    this.filteredHistory.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (this.sortBy) {
        case 'title':
          aVal = a.title;
          bVal = b.title;
          break;
        case 'created':
          aVal = new Date(a.created);
          bVal = new Date(b.created);
          break;
        case 'score':
          aVal = a.report_summary.overall_score;
          bVal = b.report_summary.overall_score;
          break;
        case 'verdict':
          aVal = a.report_summary.verdict;
          bVal = b.report_summary.verdict;
          break;
        default:
          aVal = new Date(a.created);
          bVal = new Date(b.created);
      }

      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  updatePagination(): void {
    this.totalItems = this.filteredHistory.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);

    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedHistory = this.filteredHistory.slice(startIndex, endIndex);
  }

  // Filter methods
  filterHistory(): void {
    this.currentPage = 1; // Reset to first page when filtering
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedVerdict = '';
    this.selectedCheckType = '';
    this.selectedPeriod = '';
    this.filterHistory();
  }

  // Sorting methods
  toggleSort(field: string): void {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'desc';
    }
    this.applySorting();
    this.updatePagination();
  }

  // Pagination methods
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

  // Action methods
  openReport(historyItemId: string): void {
    // Find the history item by its GUID (historyItemId is the history item's GUID)
    const historyItem = this.historyItems.find(item => item.guid === historyItemId);

    if (historyItem && historyItem.report_summary && historyItem.report_summary.guid) {
      console.log('Navigating to report:', historyItem.report_summary.guid);
      this.router.navigate(['/report', historyItem.report_summary.guid]);
    } else {
      console.error('Could not find report GUID for history item:', historyItemId);
      console.error('Available history items:', this.historyItems.map(item => ({ historyGuid: item.guid, reportGuid: item.report_summary?.guid })));
      this.toastService.showError('Unable to open report. Please try again.');
    }
  }

  toggleFavorite(item: HistoryItem, event: Event): void {
    event.stopPropagation();

    this.historyService.toggleFavorite(item.guid).subscribe({
      next: (response) => {
        item.is_favorite = response.data.is_favorite;
        this.toastService.showSuccess(
          item.is_favorite ? 'Added to favorites' : 'Removed from favorites'
        );
        this.loadStatistics(); // Refresh stats
      },
      error: (error) => {
        console.error('Error toggling favorite:', error);
        this.toastService.showError('Failed to update favorite status');
      }
    });
  }

  toggleArchive(item: HistoryItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this.historyService.toggleArchive(item.guid).subscribe({
      next: (response) => {
        item.is_archived = response.data.is_archived;
        this.toastService.showSuccess(
          item.is_archived ? 'Item archived' : 'Item unarchived'
        );
        // Reload the history to reflect current filter state
        this.loadHistory();
      },
      error: (error) => {
        console.error('Error toggling archive:', error);
        this.toastService.showError('Failed to update archive status');
      }
    });
  }

  editTitle(item: HistoryItem): void {
    // Edit title functionality disabled
    this.toastService.showInfo('Edit title feature is currently disabled');
  }

  manageTags(item: HistoryItem): void {
    // Manage tags functionality disabled
    this.toastService.showInfo('Manage tags feature is currently disabled');
  }

  deleteHistoryItem(item: HistoryItem): void {
    // Delete functionality disabled
    this.toastService.showInfo('Delete feature is currently disabled');
  }

  downloadReport(report: HistoryItem, event: Event): void {
    event.stopPropagation();
    // Download functionality disabled
    this.toastService.showInfo('Download feature is currently disabled');
  }

  exportHistory(): void {
    // Export functionality disabled
    this.toastService.showInfo('Export feature is currently disabled');
  }

  duplicateReport(item: HistoryItem): void {
    // Duplicate functionality disabled
    this.toastService.showInfo('Duplicate feature is currently disabled');
  }

  // Utility methods
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

  getFileName(filePath: string): string {
    if (!filePath) return '';
    return filePath.split('/').pop() || filePath;
  }

  generateReportSummary(item: HistoryItem): string {
    const report = item.report_summary;
    const riskLevel = report.is_high_risk ? 'High' : (report.is_plagiarized ? 'Medium' : 'Low');
    return `${report.check_type_display} analysis with ${report.formatted_score} similarity score (${riskLevel} risk)`;
  }

  // Template helper for Math access
  get Math() {
    return Math;
  }

  // Selection methods
  toggleReportSelection(reportId: string): void {
    const index = this.selectedReports.indexOf(reportId);
    if (index > -1) {
      this.selectedReports.splice(index, 1);
    } else {
      this.selectedReports.push(reportId);
    }
  }

  selectAllReports(): void {
    if (this.selectedReports.length === this.paginatedHistory.length) {
      this.selectedReports = [];
    } else {
      this.selectedReports = this.paginatedHistory.map(item => item.guid);
    }
  }
  deleteSelectedReports(): void {
    // Bulk delete functionality disabled
    this.toastService.showInfo('Bulk delete feature is currently disabled');
  }

  // Bulk operations for selected reports
  bulkAddToFavorites(): void {
    if (this.selectedReports.length === 0) return;

    const count = this.selectedReports.length;
    this.historyService.bulkToggleFavorite(this.selectedReports, true).subscribe({
      next: (result) => {
        // Update local items
        this.historyItems.forEach(item => {
          if (this.selectedReports.includes(item.guid)) {
            item.is_favorite = true;
          }
        });
        this.selectedReports = [];
        this.applyFilters();
        this.toastService.showSuccess(`${count} items added to favorites`);
        this.loadStatistics();
      },
      error: (error) => {
        console.error('Error updating favorites:', error);
        if (error.partialSuccess > 0) {
          this.toastService.showWarning(`${error.partialSuccess} items updated, ${error.errors.length} failed`);
          this.loadHistory();
        } else {
          this.toastService.showError('Failed to update favorites');
        }
        this.selectedReports = [];
      }
    });
  }

  bulkRemoveFromFavorites(): void {
    if (this.selectedReports.length === 0) return;

    const count = this.selectedReports.length;
    this.historyService.bulkToggleFavorite(this.selectedReports, false).subscribe({
      next: (result) => {
        // Update local items
        this.historyItems.forEach(item => {
          if (this.selectedReports.includes(item.guid)) {
            item.is_favorite = false;
          }
        });
        this.selectedReports = [];
        this.applyFilters();
        this.toastService.showSuccess(`${count} items removed from favorites`);
        this.loadStatistics();
      },
      error: (error) => {
        console.error('Error updating favorites:', error);
        if (error.partialSuccess > 0) {
          this.toastService.showWarning(`${error.partialSuccess} items updated, ${error.errors.length} failed`);
          this.loadHistory();
        } else {
          this.toastService.showError('Failed to update favorites');
        }
        this.selectedReports = [];
      }
    });
  }

  bulkArchive(): void {
    if (this.selectedReports.length === 0) return;

    const count = this.selectedReports.length;
    this.historyService.bulkToggleArchive(this.selectedReports, true).subscribe({
      next: (result) => {
        this.selectedReports = [];
        this.toastService.showSuccess(`${count} items archived`);
        this.loadStatistics();
        this.loadHistory(); // Reload to reflect current filter state
      },
      error: (error) => {
        console.error('Error archiving items:', error);
        if (error.partialSuccess > 0) {
          this.toastService.showWarning(`${error.partialSuccess} items updated, ${error.errors.length} failed`);
          this.loadHistory();
        } else {
          this.toastService.showError('Failed to archive items');
        }
        this.selectedReports = [];
      }
    });
  }

  bulkUnarchive(): void {
    if (this.selectedReports.length === 0) return;

    const count = this.selectedReports.length;
    this.historyService.bulkToggleArchive(this.selectedReports, false).subscribe({
      next: (result) => {
        this.selectedReports = [];
        this.toastService.showSuccess(`${count} items unarchived`);
        this.loadStatistics();
        this.loadHistory(); // Reload to reflect current filter state
      },
      error: (error) => {
        console.error('Error unarchiving items:', error);
        if (error.partialSuccess > 0) {
          this.toastService.showWarning(`${error.partialSuccess} items updated, ${error.errors.length} failed`);
          this.loadHistory();
        } else {
          this.toastService.showError('Failed to unarchive items');
        }
        this.selectedReports = [];
      }
    });
  }

  // Helper method to check if any reports are selected
  get hasSelectedReports(): boolean {
    return this.selectedReports.length > 0;
  }

  // Helper method to check if all visible reports are selected
  get allVisibleSelected(): boolean {
    return this.paginatedHistory.length > 0 &&
           this.selectedReports.length === this.paginatedHistory.length;
  }
}
