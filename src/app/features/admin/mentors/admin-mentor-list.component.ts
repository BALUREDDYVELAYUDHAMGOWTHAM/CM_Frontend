import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MentorApiService, MetaApiService } from '../../../core/services/api.services';
import { MentorResponse, DepartmentItem } from '../../../shared/models';

@Component({
  selector: 'app-admin-mentor-list',
  templateUrl: './admin-mentor-list.component.html',
  styleUrls: ['./admin-mentor-list.component.scss']
})
export class AdminMentorListComponent implements OnInit {
  mentors: MentorResponse[] = [];
  loading = true;
  search = ''; dept = '';
  departments: DepartmentItem[] = [];
  currentMonth = new Date().getMonth() + 1;
  currentYear  = new Date().getFullYear();
  monthLabel   = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  constructor(private mentorApi: MentorApiService, private metaApi: MetaApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.load();
    this.metaApi.getDepartments().subscribe({ next: d => this.departments = d, error: () => {} });
  }

  load(): void {
    this.loading = true;
    this.mentorApi.getAllMentors(this.search||undefined, this.dept||undefined).subscribe({
      next: d => { this.mentors = d; this.loading = false; },
      error: () => { this.loading = false; this.snack.open('Failed to load', 'Close', { duration: 3000 }); }
    });
  }

  get filtered(): MentorResponse[] {
    if (!this.search) return this.mentors;
    const s = this.search.toLowerCase();
    return this.mentors.filter(m => m.fullName.toLowerCase().includes(s) || m.email.toLowerCase().includes(s) || (m.associateId ?? '').toLowerCase().includes(s));
  }

  // Monthly hours: count from CoachSession connects (totalHours is from weekly connects for now)
  // The backend returns total across all sessions; for monthly we use the sessions in that month
  getMonthlyHours(m: MentorResponse): number {
    // totalHours includes all sessions; for display use it as proxy until backend monthly endpoint
    return m.totalHours;
  }

  getStatusClass(status: string): string {
    const map: Record<string,string> = { ACTIVE:'active-tr', ON_HOLD:'on-hold', COMPLETED:'completed', DROPPED:'dropped' };
    return map[status] ?? '';
  }
}
