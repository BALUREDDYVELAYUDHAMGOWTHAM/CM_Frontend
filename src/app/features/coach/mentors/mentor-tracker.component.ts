import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { MentorApiService, SessionApiService } from '../../../core/services/api.services';
import { MentorResponse, MentorConnectResponse, CoachSessionResponse, WEEK_RANGES } from '../../../shared/models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-mentor-tracker',
  templateUrl: './mentor-tracker.component.html',
  styleUrls: ['./mentor-tracker.component.scss']
})
export class MentorTrackerComponent implements OnInit, OnDestroy {
  mentors:  MentorResponse[]       = [];
  sessions: CoachSessionResponse[] = [];
  loading   = true;
  weekRanges = WEEK_RANGES;

  editingConnect: MentorConnectResponse | null = null;
  editForm: any = {};
  saving = false;

  private routerSub!: Subscription;

  constructor(
    private mentorApi:  MentorApiService,
    private sessionApi: SessionApiService,
    private snack:      MatSnackBar,
    private router:     Router,
    private route:      ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Always load fresh data on init
    this.load();

    // Also reload every time user navigates back to this page
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        if (e.urlAfterRedirects.includes('/coach/tracker')) {
          this.load();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  load(): void {
    this.loading = true;
    // Force fresh API call — no cache
    this.mentorApi.getMyMentors().subscribe({
      next: d => {
        this.mentors = [...d]; // spread to ensure new reference
        this.loading = false;
        this.sessionApi.getMySessions().subscribe({
          next: s => this.sessions = s,
          error: () => {}
        });
      },
      error: () => {
        this.loading = false;
        this.snack.open('Failed to load mentors', 'Close', { duration: 3000 });
      }
    });
  }

  getConnect(mentor: MentorResponse, weekNum: number): MentorConnectResponse | undefined {
    return mentor.connects?.find(c => c.weekNumber === weekNum);
  }

  getCellBg(c: MentorConnectResponse | undefined): string {
    if (!c)         return 'week-empty';
    if (c.happened) return 'week-done';
    if (c.mode && c.mode !== 'NOT_HAPPENED') return 'week-miss';
    return 'week-empty';
  }

  openEdit(c: MentorConnectResponse | undefined): void {
    if (!c) return;
    this.editingConnect = c;
    this.editForm = {
      happened:    c.happened,
      mode:        c.mode ?? 'VIRTUAL',
      connectDate: c.connectDate,
      hours:       c.hours,
      reason:      c.reason
    };
  }

  saveConnect(): void {
    if (!this.editingConnect) return;
    this.saving = true;
    this.mentorApi.updateConnect(this.editingConnect.id, {
      happened:    this.editForm.happened,
      mode:        this.editForm.happened ? this.editForm.mode : 'NOT_HAPPENED',
      connectDate: this.editForm.connectDate,
      hours:       this.editForm.hours,
      reason:      this.editForm.reason
    }).subscribe({
      next: updated => {
        // Update local data immediately
        for (const m of this.mentors) {
          const idx = m.connects?.findIndex(c => c.id === updated.id) ?? -1;
          if (idx >= 0) {
            m.connects[idx] = updated;
          }
        }
        // Force Angular change detection
        this.mentors = [...this.mentors];
        this.editingConnect = null;
        this.saving = false;
        this.snack.open('Connect updated ✅', 'Close', { duration: 2000 });
      },
      error: err => {
        this.saving = false;
        this.snack.open(err.error?.error ?? 'Save failed', 'Close', { duration: 3000 });
      }
    });
  }

  getModeLabel(mode: string | undefined): string {
    const m: Record<string, string> = { VIRTUAL:'V', IN_PERSON:'P', HYBRID:'H', NOT_HAPPENED:'—' };
    return mode ? (m[mode] ?? '—') : '—';
  }

  getModeColor(mode: string | undefined): string {
    const m: Record<string, string> = {
      VIRTUAL:'#0891B2', IN_PERSON:'#059669', HYBRID:'#D97706', NOT_HAPPENED:'#94A3B8'
    };
    return mode ? (m[mode] ?? '#94A3B8') : '#94A3B8';
  }

  getTotalSessions(m: MentorResponse): number {
    return m.connects?.filter(c => c.happened).length ?? 0;
  }

  getTotalHours(m: MentorResponse): number {
    return m.connects?.filter(c => c.happened).reduce((s, c) => s + (c.hours ?? 0), 0) ?? 0;
  }

  exportExcel(): void {
    const headers = [
      'Full Name','Associate ID','Email','Department','Cohort Code',
      'Contact','Vertical Mapping','Training Status',
      ...WEEK_RANGES.flatMap(w => [`${w} - Happened`, `${w} - Mode`, `${w} - Date`, `${w} - Hours`]),
      'Total Sessions','Total Hours'
    ];
    const rows = this.mentors.map(m => {
      const weekCols = WEEK_RANGES.flatMap((_, i) => {
        const c = this.getConnect(m, i + 1);
        return [c?.happened ? 'Yes' : 'No', c?.mode ?? '', c?.connectDate ?? '', c?.hours ?? ''];
      });
      return [
        m.fullName, m.associateId ?? '', m.email, m.department ?? '',
        m.cohortCode ?? '', m.contact ?? '', m.verticalMapping ?? '', m.trainingStatus,
        ...weekCols,
        this.getTotalSessions(m), this.getTotalHours(m).toFixed(1)
      ];
    });
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `Tracker_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.snack.open('Downloaded', 'Close', { duration: 2000 });
  }
}
