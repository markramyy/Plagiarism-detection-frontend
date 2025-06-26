import { Component, OnInit } from '@angular/core';
import { PlagiarismResponse } from '../../services/plagiarism.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})
export class ResultComponent implements OnInit {
  result: PlagiarismResponse | null = null;

  constructor(private router: Router) {
    // Get the result data from the router state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.result = navigation.extras.state['result'];
    }
  }

  ngOnInit() {
    // If no result data, redirect back to home
    if (!this.result) {
      this.router.navigate(['/home']);
    }
  }

  showResult(result: PlagiarismResponse): void {
    this.result = result;
  }
}
