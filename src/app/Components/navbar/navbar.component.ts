import { Component } from '@angular/core';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})

export class NavbarComponent {
  userIcon = faUser;

  constructor(private authService: AuthService) { }

  logout(): void {
    this.authService.logout();
  }
}
