import { Component, OnInit } from '@angular/core';
import {
  faShieldAlt,
  faCheck,
  faRobot,
  faBolt,
  faLock,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  // FontAwesome Icons
  shieldIcon = faShieldAlt;
  checkIcon = faCheck;
  aiIcon = faRobot;
  fastIcon = faBolt;
  secureIcon = faLock;
  formatIcon = faFileAlt;

  constructor(
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

  startChecking(): void {
    this.router.navigate(['/check']);
  }
}
