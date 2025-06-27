import { Component, Input, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-accuracy-ring',
  templateUrl: './accuracy-ring.component.html',
  styleUrl: './accuracy-ring.component.css'
})
export class AccuracyRingComponent implements AfterViewInit, OnChanges {
  
  @Input() set accuracy(value: number) {
    console.log('Accuracy input changed:', value);
    // Ensure value is a number and within valid range
    this._accuracy = typeof value === 'number' ? Math.min(Math.max(value, 0), 100) : 0;
    if (this.progressCircle) {
      this.updateProgress();
    }
  }
  get accuracy(): number {
    return this._accuracy;
  }
  
  private _accuracy: number = 0;
  private progressCircle: SVGElement | null = null;

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    this.progressCircle = this.elementRef.nativeElement.querySelector('.progress');
    this.updateProgress();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('Changes detected:', changes);
    if (changes['accuracy'] && this.progressCircle) {
      this.updateProgress();
    }
  }

  private updateProgress() {
    if (this.progressCircle) {
      console.log('Updating progress with accuracy:', this._accuracy);
      const radius = 90;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (this._accuracy / 100) * circumference;
      this.progressCircle.style.setProperty('--dash-offset', offset.toString());
      this.progressCircle.style.setProperty('--ring-color', this.getRingColor());
    }
  }

  getRingColor(): string {
    return this._accuracy <= 50 ? '#4caf50' : '#f44336';
  }

  get dashOffset(): number {
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    return circumference - (this._accuracy / 100) * circumference;
  }
}
