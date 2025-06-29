import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { faSpinner, faRobot, faCog, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-loading-modal',
  templateUrl: './loading-modal.component.html',
  styleUrls: ['./loading-modal.component.css']
})
export class LoadingModalComponent implements OnInit, OnDestroy {
  @Input() isVisible: boolean = false;
  @Input() currentStage: string = 'Initializing';

  // Icons
  spinnerIcon = faSpinner;
  robotIcon = faRobot;
  cogIcon = faCog;
  checkIcon = faCheckCircle;

  private stages = [
    'Initializing analysis...',
    'Processing content...',
    'Extracting features...',
    'Running semantic analysis...',
    'Comparing structures...',
    'Calculating similarity scores...',
    'Analyzing patterns...',
    'Generating insights...',
    'Finalizing report...'
  ];

  private currentStageIndex = 0;
  private stageInterval: any;

  ngOnInit() {
    this.startStageRotation();
  }

  ngOnDestroy() {
    if (this.stageInterval) {
      clearInterval(this.stageInterval);
    }
  }

  private startStageRotation() {
    this.stageInterval = setInterval(() => {
      this.currentStageIndex = (this.currentStageIndex + 1) % this.stages.length;
      this.currentStage = this.stages[this.currentStageIndex];
    }, 2000);
  }

  get currentStageText(): string {
    return this.currentStage || this.stages[this.currentStageIndex];
  }
}
