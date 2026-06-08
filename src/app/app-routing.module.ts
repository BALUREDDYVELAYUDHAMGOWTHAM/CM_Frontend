import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
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

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '', component: MainLayoutComponent, canActivate: [AuthGuard],
    children: [
      { path: 'admin/dashboard', component: AdminDashboardComponent,   canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'admin/coaches',   component: CoachManagementComponent,  canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'admin/mentors',   component: AdminMentorListComponent,  canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'admin/reports',   component: ReportsComponent,          canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'coach/dashboard', component: CoachDashboardComponent,   canActivate: [AuthGuard], data: { roles: ['COACH'] } },
      { path: 'coach/mentors',   component: MentorManagementComponent, canActivate: [AuthGuard], data: { roles: ['COACH'] } },
      { path: 'coach/tracker',   component: MentorTrackerComponent,    canActivate: [AuthGuard], data: { roles: ['COACH'] } },
      { path: 'coach/agent',     component: AgentChatComponent,        canActivate: [AuthGuard], data: { roles: ['COACH'] } },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
