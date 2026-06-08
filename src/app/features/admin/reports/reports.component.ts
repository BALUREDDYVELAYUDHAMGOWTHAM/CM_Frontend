import { Component, OnInit } from '@angular/core';
import { DashboardApiService } from '../../../core/services/api.services';
import { ReportRow } from '../../../shared/models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  rows: ReportRow[] = [];
  loading = false;
  deptFilter = '';
  periodFilter = 'monthly';
  periods = ['daily', 'weekly', 'monthly'];

  // Date range for correct filtering
  fromDate = '';
  toDate   = '';

  displayedColumns = ['mentorName', 'department', 'cohortCode', 'coachName', 'totalSessions', 'totalHours', 'avgDuration'];
  kpis: { label: string; value: string | number; icon: string; color: string }[] = [];

  constructor(private dashApi: DashboardApiService, private snack: MatSnackBar) {}

  ngOnInit(): void { this.setDefaultDateRange(); this.load(); }

  setDefaultDateRange(): void {
    const now   = new Date();
    const p     = this.periodFilter;
    const toD   = new Date(now);
    let fromD   = new Date(now);
    if (p === 'daily')   { fromD = new Date(now); }
    else if (p === 'weekly') { fromD.setDate(now.getDate() - 7); }
    else { fromD = new Date(now.getFullYear(), now.getMonth(), 1); }
    this.fromDate = fromD.toISOString().split('T')[0];
    this.toDate   = toD.toISOString().split('T')[0];
  }

  onPeriodChange(p: string): void {
    this.periodFilter = p;
    this.setDefaultDateRange();
    this.load();
  }

  load(): void {
    this.loading = true;
    this.dashApi.getReport(this.deptFilter||undefined, this.fromDate||undefined, this.toDate||undefined).subscribe({
      next: d => { this.rows = d; this.refreshKpis(); this.loading = false; },
      error: () => { this.loading = false; this.snack.open('Failed to load report', 'Close', { duration: 3000 }); }
    });
  }

  refreshKpis(): void {
    this.kpis = [
      { label:'Total Sessions',  value: this.totalSessions,              icon:'event_available', color:'#1D4ED8' },
      { label:'Total Hours',     value: this.totalHours.toFixed(1),      icon:'schedule',        color:'#059669' },
      { label:'Mentors Tracked', value: this.mentorsTracked,             icon:'people',          color:'#D97706' },
      { label:'Avg Hrs/Session', value: this.avgHrsSession.toFixed(1),   icon:'trending_up',     color:'#6D28D9' },
    ];
  }

  get totalSessions(): number  { return this.rows.reduce((s, r) => s + r.totalSessions, 0); }
  get totalHours(): number     { return this.rows.reduce((s, r) => s + r.totalHours, 0); }
  get mentorsTracked(): number { return this.rows.length; }
  get avgHrsSession(): number  { return this.totalSessions > 0 ? this.totalHours / this.totalSessions : 0; }

  exportCsv(): void {
    const headers = ['Mentor Name','Department','Cohort','Coach','Sessions','Hours','Avg Duration'];
    const csvRows = [headers.join(','), ...this.rows.map(r =>
      [r.mentorName, r.department, r.cohortCode, r.coachName, r.totalSessions, r.totalHours.toFixed(1), r.avgDuration.toFixed(1)].join(',')
    )];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `CoachMetrics_Report_${this.fromDate}_to_${this.toDate}.csv`;
    a.click(); URL.revokeObjectURL(url);
    this.snack.open('CSV exported', 'Close', { duration: 2000 });
  }
}
