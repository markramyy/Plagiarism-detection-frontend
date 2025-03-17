import { Component, ElementRef, ViewChild } from '@angular/core';
import { PlagiarismResponse } from '../../services/plagiarism.service';

@Component({
  selector: 'app-result-dialog',
  templateUrl: './result-dialog.component.html',
  styleUrl: './result-dialog.component.css'
})

export class ResultDialogComponent {
  @ViewChild('dialog') dialogElement!: ElementRef;

  result: PlagiarismResponse | null = null;
  isVisible = false;

  showResult(result: PlagiarismResponse): void {
    this.result = result;
    this.isVisible = true;
  }

  close(): void {
    this.isVisible = false;
  }
}
