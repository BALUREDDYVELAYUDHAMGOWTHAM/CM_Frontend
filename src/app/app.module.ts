import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';
import { MainLayoutComponent } from './layout/main-layout.component';
import { LoginComponent } from './features/auth/login.component';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';
import { CoachManagementComponent } from './features/admin/coaches/coach-management.component';
import { ReportsComponent } from './features/admin/reports/reports.component';
import { AdminMentorListComponent } from './features/admin/mentors/admin-mentor-list.component';
import { CoachDashboardComponent } from './features/coach/dashboard/coach-dashboard.component';
import { MentorManagementComponent } from './features/coach/mentors/mentor-management.component';
import { MentorTrackerComponent } from './features/coach/mentors/mentor-tracker.component';
import { AgentChatComponent } from './features/coach/agent/agent-chat.component';

const MAT = [
  MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule,
  MatButtonModule, MatCardModule, MatTableModule, MatPaginatorModule,
  MatSortModule, MatInputModule, MatFormFieldModule, MatSelectModule,
  MatDialogModule, MatSnackBarModule, MatChipsModule, MatProgressSpinnerModule,
  MatMenuModule, MatTooltipModule, MatTabsModule, MatDividerModule,
  MatProgressBarModule, MatCheckboxModule, MatSlideToggleModule,
  MatBadgeModule, MatDatepickerModule, MatNativeDateModule
];

@NgModule({
  declarations: [
    AppComponent, MainLayoutComponent, LoginComponent,
    AdminDashboardComponent, CoachManagementComponent, ReportsComponent, AdminMentorListComponent,
    CoachDashboardComponent, MentorManagementComponent, MentorTrackerComponent,
    AgentChatComponent
  ],
  imports: [BrowserModule, BrowserAnimationsModule, HttpClientModule,
            FormsModule, ReactiveFormsModule, AppRoutingModule, ...MAT],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule {}
