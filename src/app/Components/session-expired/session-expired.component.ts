import { Component } from '@angular/core';

@Component({
  selector: 'app-session-expired',
  templateUrl: './session-expired.component.html',
  styleUrl: './session-expired.component.css'
})

export class SessionExpiredComponent {
  showDialog = false;

  show(): void {
    this.showDialog = true;
    setTimeout(() => {
      this.close();
    }, 3000); // Auto close after 3 seconds
  }

  close(): void {
    this.showDialog = false;
  }
}
