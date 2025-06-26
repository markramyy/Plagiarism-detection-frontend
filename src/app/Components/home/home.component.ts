import { Component, OnInit } from '@angular/core';
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
import { PlagiarismService } from '../../services/plagiarism.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  uplaodIcon = faCloudArrowUp;
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
}
