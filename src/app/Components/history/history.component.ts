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
  sortBy = 'last_viewed';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Pagination
  currentPage = 1;
  pageSize = 20;
  totalItems = 0;
  totalPages = 0;

  // UI
  selectedReports: string[] = [];
  viewMode: 'grid' | 'list' = 'grid';
  showOptionsMenuFor: HistoryItem | null = null;
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
    if (this.showArchived !== undefined) {
      filters.is_archived = this.showArchived;
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
        const itemDate = new Date(item.last_viewed);
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
        case 'last_viewed':
          aVal = new Date(a.last_viewed);
          bVal = new Date(b.last_viewed);
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
        case 'view_count':
          aVal = a.view_count;
          bVal = b.view_count;
          break;
        default:
          aVal = new Date(a.last_viewed);
          bVal = new Date(b.last_viewed);
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
  openReport(reportId: string): void {
    // Extract the actual report GUID from the history item
    const historyItem = this.historyItems.find(item => item.guid === reportId);
    if (historyItem) {
      this.router.navigate(['/reports', historyItem.report_summary.guid]);
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

  toggleArchive(item: HistoryItem): void {
    this.historyService.toggleArchive(item.guid).subscribe({
      next: (response) => {
        item.is_archived = response.data.is_archived;
        this.toastService.showSuccess(
          item.is_archived ? 'Item archived' : 'Item unarchived'
        );
        // If currently filtering by archived status, reload
        if (this.showArchived !== undefined) {
          this.loadHistory();
        } else {
          this.applyFilters();
        }
      },
      error: (error) => {
        console.error('Error toggling archive:', error);
        this.toastService.showError('Failed to update archive status');
      }
    });
  }

  editTitle(item: HistoryItem): void {
    const newTitle = prompt('Enter new title:', item.title);
    if (newTitle && newTitle.trim() !== item.title) {
      this.historyService.updateHistory(item.guid, { title: newTitle.trim() }).subscribe({
        next: () => {
          item.title = newTitle.trim();
          this.toastService.showSuccess('Title updated successfully');
        },
        error: (error) => {
          console.error('Error updating title:', error);
          this.toastService.showError('Failed to update title');
        }
      });
    }
  }

  manageTags(item: HistoryItem): void {
    const currentTags = item.tags.join(', ');
    const newTags = prompt('Enter tags (comma-separated):', currentTags);
    if (newTags !== null) {
      const tagArray = newTags.split(',').map(tag => tag.trim()).filter(tag => tag);
      this.historyService.updateHistory(item.guid, { tags: tagArray }).subscribe({
        next: () => {
          item.tags = tagArray;
          this.toastService.showSuccess('Tags updated successfully');
        },
        error: (error) => {
          console.error('Error updating tags:', error);
          this.toastService.showError('Failed to update tags');
        }
      });
    }
  }

  deleteHistoryItem(item: HistoryItem): void {
    if (confirm('Are you sure you want to delete this history item? This action cannot be undone.')) {
      this.historyService.deleteHistory(item.guid).subscribe({
        next: () => {
          this.historyItems = this.historyItems.filter(h => h.guid !== item.guid);
          this.applyFilters();
          this.toastService.showSuccess('History item deleted successfully');
          this.loadStatistics(); // Refresh stats
        },
        error: (error) => {
          console.error('Error deleting history item:', error);
          this.toastService.showError('Failed to delete history item');
        }
      });
    }
  }

  downloadReport(report: HistoryItem, event: Event): void {
    event.stopPropagation();

    this.toastService.showInfo('Preparing download...');

    this.historyService.downloadReport(report.guid, 'pdf').subscribe({
      next: (blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.pdf`;
        link.click();

        // Clean up
        window.URL.revokeObjectURL(url);

        this.toastService.showSuccess('Report downloaded successfully');
      },
      error: (error) => {
        console.error('Error downloading report:', error);
        this.toastService.showError('Failed to download report');
      }
    });
  }

  exportHistory(): void {
    const filters: any = {};
    if (this.showArchived !== undefined) {
      filters.is_archived = this.showArchived;
    }

    this.toastService.showInfo('Preparing export...');

    this.historyService.exportHistory(filters).subscribe({
      next: (blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `history_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        // Clean up
        window.URL.revokeObjectURL(url);

        this.toastService.showSuccess('History exported successfully');
      },
      error: (error) => {
        console.error('Error exporting history:', error);
        this.toastService.showError('Failed to export history');
      }
    });
  }

  showOptionsMenu(item: HistoryItem, event: MouseEvent): void {
    event.stopPropagation();
    this.showOptionsMenuFor = item;
    this.optionsMenuPosition = { x: event.clientX, y: event.clientY };

    // Close menu when clicking elsewhere
    setTimeout(() => {
      document.addEventListener('click', () => {
        this.showOptionsMenuFor = null;
      }, { once: true });
    });
  }

  duplicateReport(item: HistoryItem): void {
    this.historyService.duplicateHistory(item.guid).subscribe({
      next: (response) => {
        this.toastService.showSuccess('Report duplicated successfully');
        this.loadHistory(); // Refresh the list to show the new duplicate
      },
      error: (error) => {
        console.error('Error duplicating report:', error);
        this.toastService.showError('Failed to duplicate report');
      }
    });
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
  }  deleteSelectedReports(): void {
    if (this.selectedReports.length === 0) return;

    const count = this.selectedReports.length;
    if (confirm(`Are you sure you want to delete ${count} selected report(s)?`)) {
      // Use the enhanced bulk delete service
      this.historyService.bulkDeleteHistory(this.selectedReports).subscribe({
        next: (result) => {
          // Remove deleted items from the local array
          this.historyItems = this.historyItems.filter(h => !this.selectedReports.includes(h.guid));
          this.selectedReports = [];
          this.applyFilters();
          this.toastService.showSuccess(`${count} items deleted successfully`);
          this.loadStatistics();
        },
        error: (error) => {
          console.error('Error deleting selected reports:', error);
          if (error.partialSuccess > 0) {
            this.toastService.showWarning(`${error.partialSuccess} items deleted, ${error.errors.length} failed`);
            // Refresh the list to show current state
            this.loadHistory();
          } else {
            this.toastService.showError('Failed to delete selected items');
          }
          this.selectedReports = [];
        }
      });
    }
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
        // Update local items
        this.historyItems.forEach(item => {
          if (this.selectedReports.includes(item.guid)) {
            item.is_archived = true;
          }
        });
        this.selectedReports = [];
        this.applyFilters();
        this.toastService.showSuccess(`${count} items archived`);
        this.loadStatistics();
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
        // Update local items
        this.historyItems.forEach(item => {
          if (this.selectedReports.includes(item.guid)) {
            item.is_archived = false;
          }
        });
        this.selectedReports = [];
        this.applyFilters();
        this.toastService.showSuccess(`${count} items unarchived`);
        this.loadStatistics();
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
