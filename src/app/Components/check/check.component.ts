import { Component, OnInit } from '@angular/core';
import {
  faCloudArrowUp,
  faShieldAlt,
  faFileText,
  faFile,
  faCopy,
  faExclamationTriangle,
  faBookOpen,
  faUpload,
  faTrash,
  faClipboard,
  faCheck,
  faSpinner,
  faTimes,
  faRobot,
  faBolt,
  faLock,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import { PlagiarismService } from '../../services/plagiarism.service';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-check',
  templateUrl: './check.component.html',
  styleUrl: './check.component.css'
})
export class CheckComponent implements OnInit {

  // FontAwesome Icons
  uplaodIcon = faCloudArrowUp;
  shieldIcon = faShieldAlt;
  textIcon = faFileText;
  documentIcon = faFileAlt;
  filesIcon = faCopy;
  suspiciousIcon = faExclamationTriangle;
  sourceIcon = faBookOpen;
  uploadIcon = faUpload;
  fileIcon = faFile;
  removeIcon = faTimes;
  clearIcon = faTrash;
  pasteIcon = faClipboard;
  checkIcon = faCheck;
  spinnerIcon = faSpinner;
  aiIcon = faRobot;
  fastIcon = faBolt;
  secureIcon = faLock;
  formatIcon = faFileAlt;

  tabValue = 0;

  // Text inputs
  suspiciousText = '';
  sourceText = '';
  textToFileText = '';

  // File inputs
  firstFile: File | null = null;
  secondFile: File | null = null;
  textToFileFile: File | null = null;

  // File names for display
  firstFileName = '';
  secondFileName = '';
  textToFileFileName = '';

  // Loading state
  isLoading = false;
  showLoadingModal = false;

  // Analysis completion state
  analysisCompleted = false;
  analysisResult: any = null;

  constructor(
    private plagiarismService: PlagiarismService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authService.isLoggedIn()) {
      console.warn('User not logged in, redirecting to login page');
      this.toastService.showError('Please login to access this feature', 'Authentication Required');
      this.router.navigate(['']);
    }
  }

  onTab(value: number) {
    this.tabValue = value;
  }

  onFirstFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.firstFile = input.files[0];
      this.firstFileName = input.files[0].name;
    } else {
      this.clearFirstFile();
    }
  }

  onSecondFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.secondFile = input.files[0];
      this.secondFileName = input.files[0].name;
    } else {
      this.clearSecondFile();
    }
  }

  onTextToFileFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.textToFileFile = input.files[0];
      this.textToFileFileName = input.files[0].name;
    } else {
      this.clearTextToFileFile();
    }
  }

  clearFirstFile(): void {
    this.firstFile = null;
    this.firstFileName = '';
    // Reset the file input element
    const fileInput = document.getElementById('file-input-1') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  clearSecondFile(): void {
    this.secondFile = null;
    this.secondFileName = '';
    // Reset the file input element
    const fileInput = document.getElementById('file-input-2') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  clearTextToFileFile(): void {
    this.textToFileFile = null;
    this.textToFileFileName = '';
    // Reset the file input element
    const fileInput = document.getElementById('text-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  checkForPlagiarism(): void {
    this.resetAnalysisState(); // Reset previous analysis state
    this.isLoading = true;
    this.showLoadingModal = true;

    if (!this.authService.isLoggedIn()) {
      this.toastService.showError('Your session has expired. Please login again.', 'Session Expired');
      this.router.navigate(['']);
      this.resetLoadingState();
      return;
    }

    switch(this.tabValue) {
      case 0: // Text to Text
        if (this.suspiciousText && this.sourceText) {
          this.plagiarismService.checkTextToText(this.suspiciousText, this.sourceText)
            .subscribe({
              next: (result) => {
                this.handleSuccessResponse(result);
              },
              error: (error) => {
                this.handleErrorResponse(error, 'text-to-text comparison');
              }
            });
        } else {
          this.toastService.showWarning('Please enter both texts to compare.', 'Missing Input');
          this.resetLoadingState();
        }
        break;

      case 1: // Text to File
        if (this.textToFileText && this.textToFileFile) {
          this.plagiarismService.checkTextToFile(this.textToFileText, this.textToFileFile)
            .subscribe({
              next: (result) => {
                this.handleSuccessResponse(result);
              },
              error: (error) => {
                this.handleErrorResponse(error, 'text-to-file comparison');
              }
            });
        } else {
          this.toastService.showWarning('Please enter text and upload a file to compare.', 'Missing Input');
          this.resetLoadingState();
        }
        break;

      case 2: // File to File
        if (this.firstFile && this.secondFile) {
          this.plagiarismService.checkFileToFile(this.firstFile, this.secondFile)
            .subscribe({
              next: (result) => {
                this.handleSuccessResponse(result);
              },
              error: (error) => {
                this.handleErrorResponse(error, 'file-to-file comparison');
              }
            });
        } else {
          this.toastService.showWarning('Please upload both files to compare.', 'Missing Input');
          this.resetLoadingState();
        }
        break;
    }
  }  private handleSuccessResponse(result: any): void {
    this.resetLoadingState();
    this.toastService.showSuccess('Plagiarism analysis completed successfully!', 'Analysis Complete');

    // Store the result and show completion state
    this.analysisResult = result;
    this.analysisCompleted = true;
  }

  private handleErrorResponse(error: any, operation: string): void {
    this.resetLoadingState();
    console.error(`Error in ${operation}:`, error);

    let errorMessage = 'An unexpected error occurred. Please try again.';
    let errorTitle = 'Analysis Failed';

    if (error.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
      errorTitle = 'Authentication Error';
      this.authService.logout();
      this.router.navigate(['']);
    } else if (error.status === 400) {
      errorMessage = error.error?.error || 'Invalid input provided. Please check your data and try again.';
      errorTitle = 'Invalid Input';
    } else if (error.status === 413) {
      errorMessage = 'File size too large. Please use smaller files.';
      errorTitle = 'File Too Large';
    } else if (error.status === 415) {
      errorMessage = 'Unsupported file format. Please use PDF, DOCX, or TXT files.';
      errorTitle = 'Unsupported Format';
    } else if (error.status === 500) {
      errorMessage = 'Server error occurred during analysis. Please try again later.';
      errorTitle = 'Server Error';
    } else if (error.status === 0) {
      errorMessage = 'Unable to connect to server. Please check your internet connection.';
      errorTitle = 'Connection Error';
    } else if (error.error?.error) {
      errorMessage = error.error.error;
    }

    this.toastService.showError(errorMessage, errorTitle, 10000);
  }

  private resetLoadingState(): void {
    this.isLoading = false;
    this.showLoadingModal = false;
  }

  private resetAnalysisState(): void {
    this.analysisCompleted = false;
    this.analysisResult = null;
  }

  // Analysis completion methods

  goToReports(): void {
    this.router.navigate(['/reports']);
  }

  startNewAnalysis(): void {
    // Reset all states
    this.resetAnalysisState();
    this.resetLoadingState();

    // Clear all inputs
    this.clearTextInputs();
    this.clearTextToFileInputs();
    this.clearFileInputs();

    // Reset to first tab
    this.tabValue = 0;

    this.toastService.showInfo('Ready for new analysis', 'New Analysis');
  }

  // Helper method to get analysis summary
  get analysisSummary(): string {
    if (!this.analysisResult?.plagiarism) return '';

    const result = this.analysisResult.plagiarism;
    const score = result.scores?.hybrid || result.detailed_results?.overall_score || 0;
    return `${result.verdict} - ${score.toFixed(1)}% similarity detected`;
  }

  // Helper method to determine if plagiarism is detected based on verdict and score
  get isPlagiarismDetected(): boolean {
    if (!this.analysisResult?.plagiarism) return false;

    const result = this.analysisResult.plagiarism;
    const score = result.scores?.hybrid || result.detailed_results?.overall_score || 0;

    // Consider plagiarism detected if:
    // 1. Verdict indicates risk (MID, MID-HIGH, HIGH)
    // 2. Or score is above 50%
    const riskVerdict = result.verdict &&
      (result.verdict.includes('MID') || result.verdict.includes('HIGH'));

    return riskVerdict || score >= 50;
  }

  // Helper method to get confidence score from the hybrid score
  get confidenceScore(): number {
    if (!this.analysisResult?.plagiarism) return 0;

    const result = this.analysisResult.plagiarism;
    const score = result.scores?.hybrid || result.detailed_results?.overall_score || 0;

    // Convert similarity score to confidence (as a decimal between 0-1)
    return score / 100;
  }

  // Helper method to get detailed score breakdown
  get scoreBreakdown(): string {
    if (!this.analysisResult?.plagiarism?.scores) return '';

    const scores = this.analysisResult.plagiarism.scores;
    return `Structural: ${scores.lstm1?.toFixed(1) || 0}% | Semantic: ${scores.lstm2?.toFixed(1) || 0}% | Exact: ${scores.tfidf?.toFixed(1) || 0}%`;
  }

  // Helper method to get number of suspicious segments
  get suspiciousSegmentsCount(): number {
    return this.analysisResult?.plagiarism?.plagiarized_segments?.length || 0;
  }

  // Utility Methods

  getFileSize(file: File | null): string {
    if (!file) return '';

    const bytes = file.size;
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  clearTextInputs(): void {
    this.suspiciousText = '';
    this.sourceText = '';
  }

  clearTextToFileInputs(): void {
    this.textToFileText = '';
    this.clearTextToFileFile();
  }

  clearFileInputs(): void {
    this.clearFirstFile();
    this.clearSecondFile();
  }

  async pasteFromClipboard(target: 'suspicious' | 'source'): Promise<void> {
    try {
      const text = await navigator.clipboard.readText();
      if (target === 'suspicious') {
        this.suspiciousText = text;
      } else {
        this.sourceText = text;
      }
      this.toastService.showSuccess('Text pasted successfully', 'Clipboard');
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      this.toastService.showError('Unable to paste from clipboard. Please try copying the text again.', 'Clipboard Error');
    }
  }

  // Drag and Drop Methods

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    target.classList.add('drag-over');
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('drag-over');
  }

  onDrop(event: DragEvent, type: 'first' | 'second' | 'textToFile'): void {
    event.preventDefault();
    event.stopPropagation();

    const target = event.currentTarget as HTMLElement;
    target.classList.remove('drag-over');

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Validate file type
      const allowedTypes = ['.txt', '.doc', '.docx', '.pdf'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

      if (!allowedTypes.includes(fileExtension)) {
        this.toastService.showError('Please upload a valid file type (.txt, .doc, .docx, .pdf)', 'Invalid File Type');
        return;
      }

      // Assign file based on type
      switch (type) {
        case 'first':
          this.firstFile = file;
          this.firstFileName = file.name;
          break;
        case 'second':
          this.secondFile = file;
          this.secondFileName = file.name;
          break;
        case 'textToFile':
          this.textToFileFile = file;
          this.textToFileFileName = file.name;
          break;
      }
    }
  }

  triggerFileInput(elementId: string): void {
    const fileInput = document.getElementById(elementId) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }
}
