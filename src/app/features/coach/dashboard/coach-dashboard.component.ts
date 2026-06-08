import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DashboardApiService, SessionApiService, MentorApiService, MetaApiService } from '../../../core/services/api.services';
import { DashboardStats, CoachSessionResponse, MentorResponse, DepartmentItem, VerticalItem } from '../../../shared/models';

@Component({
  selector: 'app-coach-dashboard',
  templateUrl: './coach-dashboard.component.html',
  styleUrls: ['./coach-dashboard.component.scss']
})
export class CoachDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;
  kpis: any[] = [];

  // Coach Details form
  showSessionForm = false;
  sessionForm: FormGroup;
  savingSession = false;

  // Autofill
  allMentors: MentorResponse[] = [];
  selectedMentor: MentorResponse | null = null;

  // Upcoming sessions top 5
  upcomingSessions: CoachSessionResponse[] = [];
  departments: DepartmentItem[] = [];
  verticals: VerticalItem[] = [];

  constructor(
    private dashApi: DashboardApiService,
    private sessionApi: SessionApiService,
    private mentorApi: MentorApiService,
    private metaApi: MetaApiService,
    private fb: FormBuilder,
    private snack: MatSnackBar
  ) {
    this.sessionForm = this.fb.group({
      searchKey:     [''],
      mentorId:      ['', Validators.required],
      fullName:      [{value:'', disabled:true}],
      email:         [{value:'', disabled:true}],
      associateId:   [{value:'', disabled:true}],
      department:    [{value:'', disabled:true}],
      cohortCode:    [{value:'', disabled:true}],
      contact:       [{value:'', disabled:true}],
      verticalMapping:[{value:'', disabled:true}],
      trainingStatus:[{value:'', disabled:true}],
      batchOwnerId:  [''],
      batchOwnerName:[''],
      sessionDate:   ['', Validators.required],
      fromTime:      ['', Validators.required],
      toTime:        ['', Validators.required],
      hours:         [{value:'', disabled:true}],
      notes:         ['']
    });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.dashApi.getCoachDashboard().subscribe({
      next: d => {
        this.stats = d;
        this.kpis = [
          { label:'My Mentors',          value: d.myMentors        ?? 0, icon:'people',          iconBg:'#FEF3C7', iconColor:'#D97706' },
          { label:'Sessions This Month', value: d.sessionsThisMonth?? 0, icon:'event_available', iconBg:'#DCFCE7', iconColor:'#059669' },
          { label:'Upcoming Sessions',   value: d.upcomingSessions ?? 0, icon:'pending_actions', iconBg:'#DBEAFE', iconColor:'#1D4ED8' },
          { label:'Cohorts Assigned',    value: d.cohortsAssigned  ?? 0, icon:'group_work',      iconBg:'#EDE9FE', iconColor:'#6D28D9' },
        ];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
    this.sessionApi.getUpcoming().subscribe({ next: d => this.upcomingSessions = d, error: () => {} });
    this.mentorApi.getMyMentors().subscribe({ next: d => this.allMentors = d, error: () => {} });
    this.metaApi.getDepartments().subscribe({ next: d => this.departments = d, error: () => {} });
    this.metaApi.getVerticals().subscribe({ next: d => this.verticals = d, error: () => {} });
  }

  openSessionForm(): void { this.showSessionForm = true; this.sessionForm.reset(); this.selectedMentor = null; }

  // Autofill by name or associateId selection
  onMentorSelect(mentor: MentorResponse): void {
    this.selectedMentor = mentor;
    this.sessionForm.patchValue({
      mentorId:       mentor.id,
      fullName:       mentor.fullName,
      email:          mentor.email,
      associateId:    mentor.associateId,
      department:     mentor.department,
      cohortCode:     mentor.cohortCode,
      contact:        mentor.contact,
      verticalMapping:mentor.verticalMapping,
      trainingStatus: mentor.trainingStatus
    });
  }

  onSearchKeyChange(): void {
    const key = this.sessionForm.get('searchKey')?.value?.trim();
    if (!key) return;
    // Try associateId first, then name match
    const byAssociate = this.allMentors.find(m => m.associateId === key);
    const byName = this.allMentors.find(m => m.fullName.toLowerCase().includes(key.toLowerCase()));
    const found = byAssociate ?? byName;
    if (found) this.onMentorSelect(found);
  }

  // Auto-calculate hours when times change
  onTimeChange(): void {
    const from = this.sessionForm.get('fromTime')?.value;
    const to   = this.sessionForm.get('toTime')?.value;
    if (from && to) {
      const [fh, fm] = from.split(':').map(Number);
      const [th, tm] = to.split(':').map(Number);
      const mins = (th * 60 + tm) - (fh * 60 + fm);
      if (mins > 0) {
        const hrs = Math.round(mins / 60 * 2) / 2;
        this.sessionForm.get('hours')?.setValue(hrs);
      }
    }
  }

  saveSession(): void {
    if (this.sessionForm.invalid || !this.selectedMentor) {
      this.snack.open('Please select a mentor and fill required fields', 'Close', { duration: 3000 });
      return;
    }
    this.savingSession = true;
    const v = this.sessionForm.getRawValue();
    this.sessionApi.createSession({
      mentorId:       Number(v.mentorId),
      batchOwnerId:   v.batchOwnerId,
      batchOwnerName: v.batchOwnerName,
      sessionDate:    v.sessionDate,
      fromTime:       v.fromTime,
      toTime:         v.toTime,
      notes:          v.notes
    }).subscribe({
      next: () => {
        this.savingSession = false;
        this.showSessionForm = false;
        this.snack.open('Session saved successfully!', 'Close', { duration: 3000 });
        this.load();
      },
      error: err => {
        this.savingSession = false;
        this.snack.open(err.error?.error ?? 'Save failed', 'Close', { duration: 3000 });
      }
    });
  }
}
