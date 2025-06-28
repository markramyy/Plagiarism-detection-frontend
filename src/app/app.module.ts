import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './Components/home/home.component';
import { NavbarComponent } from './Components/navbar/navbar.component';
import { LoginComponent } from './Components/login/login.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { SessionExpiredComponent } from './Components/session-expired/session-expired.component';
import { ResultComponent } from './Components/result/result.component';
import { AccuracyRingComponent } from './Components/accuracy-ring/accuracy-ring.component';
import { SidebarComponent } from './Components/sidebar/sidebar.component';
import { CheckComponent } from './Components/check/check.component';
import { ProfileComponent } from './Components/profile/profile.component';
import { ReportsComponent } from './Components/reports/reports.component';
import { ReportDetailComponent } from './Components/report-detail/report-detail.component';
import { HistoryComponent } from './Components/history/history.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    LoginComponent,
    SessionExpiredComponent,
    ResultComponent,
    AccuracyRingComponent,
    ProfileComponent,
    ReportsComponent,
    ReportDetailComponent,
    HistoryComponent,
    SidebarComponent,
    CheckComponent
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
