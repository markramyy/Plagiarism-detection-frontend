import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoginComponent } from './components/login/login.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { SessionExpiredComponent } from './components/session-expired/session-expired.component';
import { AccuracyRingComponent } from './components/accuracy-ring/accuracy-ring.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { CheckComponent } from './components/check/check.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ReportsComponent } from './components/reports/reports.component';
import { ReportDetailComponent } from './components/report-detail/report-detail.component';
import { HistoryComponent } from './components/history/history.component';
import { ToastComponent } from './components/toast/toast.component';
import { LoadingModalComponent } from './components/loading-modal/loading-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    LoginComponent,
    SessionExpiredComponent,
    AccuracyRingComponent,
    ProfileComponent,
    ReportsComponent,
    ReportDetailComponent,
    HistoryComponent,
    SidebarComponent,
    CheckComponent,
    ToastComponent,
    LoadingModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule
],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
