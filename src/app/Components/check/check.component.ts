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

  constructor(
    private plagiarismService: PlagiarismService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authService.isLoggedIn()) {
      console.warn('User not logged in, redirecting to login page');
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
    this.isLoading = true;

    if (!this.authService.isLoggedIn()) {
      alert('Your session has expired. Please login again.');
      this.router.navigate(['']);
      this.isLoading = false;
      return;
    }

    switch(this.tabValue) {
      case 0: // Text to Text
        if (this.suspiciousText && this.sourceText) {
          this.plagiarismService.checkTextToText(this.suspiciousText, this.sourceText)
            .subscribe({
              next: (result) => {
                this.router.navigate(['/result'], { state: { result } });
                this.isLoading = false;
              },
              error: (error) => {
                console.error('Error checking plagiarism:', error);
                if (error.status === 401) {
                  alert('Authentication failed. Please login again.');
                  this.authService.logout();
                } else {
                  alert('Error checking plagiarism. Please try again.');
                }
                this.isLoading = false;
              }
            });
        } else {
          alert('Please enter both texts to compare.');
          this.isLoading = false;
        }
        break;

      case 1: // Text to File
        if (this.textToFileText && this.textToFileFile) {
          this.plagiarismService.checkTextToFile(this.textToFileText, this.textToFileFile)
            .subscribe({
              next: (result) => {
                this.router.navigate(['/result'], { state: { result } });
                this.isLoading = false;
              },
              error: (error) => {
                console.error('Error checking plagiarism:', error);
                alert('Error checking plagiarism. Please try again.');
                this.isLoading = false;
              }
            });
        } else {
          alert('Please enter text and upload a file to compare.');
          this.isLoading = false;
        }
        break;

      case 2: // File to File
        if (this.firstFile && this.secondFile) {
          this.plagiarismService.checkFileToFile(this.firstFile, this.secondFile)
            .subscribe({
              next: (result) => {
                this.router.navigate(['/result'], { state: { result } });
                this.isLoading = false;
              },
              error: (error) => {
                console.error('Error checking plagiarism:', error);
                alert('Error checking plagiarism. Please try again.');
                this.isLoading = false;
              }
            });
        } else {
          alert('Please upload both files to compare.');
          this.isLoading = false;
        }
        break;
    }
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
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      alert('Unable to paste from clipboard. Please try copying the text again.');
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
        alert('Please upload a valid file type (.txt, .doc, .docx, .pdf)');
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
