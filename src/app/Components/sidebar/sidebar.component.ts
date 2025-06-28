import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  currentUser: any = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Get current user information
    this.getCurrentUser();
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  getCurrentUser(): void {
    // You might want to get this from your auth service
    // For now, we'll use a placeholder
    this.currentUser = {
      username: 'User',
      email: 'user@example.com'
    };
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
