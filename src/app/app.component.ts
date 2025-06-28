import { Component, OnInit } from '@angular/core';
import { SessionService } from './services/session.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'PlagChecker';
  showSidebar = false;

  constructor(private sessionService: SessionService, private router: Router) {
    // Listen to route changes to hide sidebar on login/signup
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects || event.url;
        this.showSidebar = !['/', '/login', '/signup'].includes(url);
      }
    });
  }

  ngOnInit(): void {
    // Optionally, check session on load
    this.showSidebar = this.sessionService.isAuthenticated();
  }
}
