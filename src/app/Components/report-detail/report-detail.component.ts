import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ReportsService, ReportDetail } from '../../services/reports.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-report-detail',
  templateUrl: './report-detail.component.html',
  styleUrls: ['./report-detail.component.css']
})
export class ReportDetailComponent implements OnInit {
  report: ReportDetail | null = null;
  loading = false;
  error: string | null = null;

  // UI state properties
  comparisonView: 'side-by-side' | 'unified' = 'side-by-side';
  showTechnicalDetails = false;
  expandedSegments: boolean[] = [];
  highlightedSuspiciousText = '';
  highlightedSourceText = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private reportsService: ReportsService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    const reportId = this.route.snapshot.paramMap.get('id');
    if (reportId) {
      this.loadReport(reportId);
    }
  }

  loadReport(reportId: string): void {
    this.loading = true;
    this.error = null;

    this.reportsService.getReportById(reportId).subscribe({
      next: (response) => {
        console.log('Report detail response:', response);
        this.report = response.data;
        this.initializeTextHighlighting();
        this.expandedSegments = new Array(this.report.matching_segments?.length || 0).fill(false);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching report details:', error);
        this.error = error.error?.message || 'Failed to load report details. Please try again.';
        this.loading = false;
        this.report = null;
      }
    });
  }

  private initializeTextHighlighting(): void {
    if (this.report) {
      // For now, just assign the raw text - we can implement highlighting later
      this.highlightedSuspiciousText = this.report.suspicious_text || '';
      this.highlightedSourceText = this.report.source_text || '';

      // TODO: Implement text highlighting based on matching segments
      this.highlightMatchingSegments();
    }
  }

  private highlightMatchingSegments(): void {
    if (!this.report?.matching_segments) return;

    // Create highlighted versions of the text
    let suspiciousHighlighted = this.report.suspicious_text;
    let sourceHighlighted = this.report.source_text;

    // Apply highlighting to matching segments
    this.report.matching_segments.forEach((segment, index) => {
      const highlightClass = this.getSegmentHighlightClass(segment.similarity_score);

      // Highlight suspect segment
      if (segment.suspect_segment) {
        const suspectRegex = new RegExp(this.escapeRegExp(segment.suspect_segment), 'gi');
        suspiciousHighlighted = suspiciousHighlighted.replace(
          suspectRegex,
          `<span class="${highlightClass}" data-segment="${index}">${segment.suspect_segment}</span>`
        );
      }

      // Highlight source segment
      if (segment.source_segment) {
        const sourceRegex = new RegExp(this.escapeRegExp(segment.source_segment), 'gi');
        sourceHighlighted = sourceHighlighted.replace(
          sourceRegex,
          `<span class="${highlightClass}" data-segment="${index}">${segment.source_segment}</span>`
        );
      }
    });

    this.highlightedSuspiciousText = suspiciousHighlighted;
    this.highlightedSourceText = sourceHighlighted;
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private getSegmentHighlightClass(similarity: number): string {
    if (similarity >= 80) return 'highlight-high';
    if (similarity >= 60) return 'highlight-medium';
    return 'highlight-low';
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

  getVerdictIcon(verdict?: string): string {
    const v = verdict || (this.report ? this.report.verdict : '');
    const icons: { [key: string]: string } = {
      'LOW': 'fas fa-check-circle',
      'MID_LOW': 'fas fa-info-circle',
      'MID': 'fas fa-exclamation-triangle',
      'MID_HIGH': 'fas fa-exclamation-triangle',
      'HIGH': 'fas fa-times-circle'
    };
    return icons[v] || 'fas fa-info-circle';
  }

  getVerdictLabel(): string {
    if (!this.report) return '';
    const labels: { [key: string]: string } = {
      'LOW': 'Low Risk',
      'MID_LOW': 'Mid-Low Risk',
      'MID': 'Mid Risk',
      'MID_HIGH': 'Mid-High Risk',
      'HIGH': 'High Risk'
    };
    return labels[this.report.verdict] || this.report.verdict_display || this.report.verdict;
  }

  getFileName(filePath: string): string {
    if (!filePath) return '';
    return filePath.split('/').pop() || filePath;
  }

  goBack(): void {
    this.location.back();
  }

  downloadReport(): void {
    if (!this.report) return;

    this.reportsService.downloadReport(this.report.guid).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${this.report!.guid}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.toastService.showSuccess('Report downloaded successfully!');
      },
      error: (error) => {
        console.error('Error downloading report:', error);
        this.toastService.showError('Failed to download report. Please try again.');
      }
    });
  }

  shareReport(): void {
    if (!this.report) return;

    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: this.getReportTitle(),
        text: `Plagiarism detection report - ${this.report.formatted_score} similarity`,
        url: url
      }).then(() => {
        this.toastService.showSuccess('Report shared successfully!');
      }).catch((error) => {
        console.error('Error sharing report:', error);
        this.fallbackShare(url);
      });
    } else {
      this.fallbackShare(url);
    }
  }

  private fallbackShare(url: string): void {
    this.copyToClipboard(url);
    this.toastService.showSuccess('Report URL copied to clipboard!');
  }

  getReportTitle(): string {
    if (!this.report) return '';
    return `${this.report.check_type_display} Analysis Report`;
  }

  getTypeIcon(): string {
    if (!this.report) return 'fas fa-file';
    const icons: { [key: string]: string } = {
      'text_to_text': 'fas fa-font',
      'text_to_file': 'fas fa-file-alt',
      'file_to_file': 'fas fa-copy'
    };
    return icons[this.report.check_type] || 'fas fa-file';
  }

  getTypeLabel(): string {
    if (!this.report) return '';
    return this.report.check_type_display || this.report.check_type;
  }

  getScoreColorClass(score: number): string {
    if (score < 20) return 'score-low';
    if (score < 40) return 'score-mid-low';
    if (score < 60) return 'score-mid';
    if (score < 80) return 'score-mid-high';
    return 'score-high';
  }

  highlightMatches(): void {
    console.log('Highlight matches functionality');
  }

  getSuspiciousWordCount(): number {
    if (!this.report || !this.report.suspicious_text) return 0;
    return this.report.suspicious_text.split(/\s+/).length;
  }

  getSourceWordCount(): number {
    if (!this.report || !this.report.source_text) return 0;
    return this.report.source_text.split(/\s+/).length;
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.toastService.showSuccess('Text copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      this.toastService.showError('Failed to copy text to clipboard.');
    });
  }

  toggleSegment(index: number): void {
    this.expandedSegments[index] = !this.expandedSegments[index];
  }
}