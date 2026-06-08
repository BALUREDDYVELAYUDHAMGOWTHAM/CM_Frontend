import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MentorApiService, MetaApiService } from '../../../core/services/api.services';
import { MentorResponse, DepartmentItem, VerticalItem } from '../../../shared/models';

@Component({
  selector: 'app-mentor-management',
  templateUrl: './mentor-management.component.html',
  styleUrls: ['./mentor-management.component.scss']
})
export class MentorManagementComponent implements OnInit {
  mentors: MentorResponse[] = [];
  loading = false;
  searchTerm = ''; deptFilter = ''; cohortFilter = '';

  showModal = false; editMode = false; editingId: number | null = null;
  form: FormGroup;

  showDeleteDialog = false; deletingMentor: MentorResponse | null = null;

  departments: DepartmentItem[] = [];
  verticals: VerticalItem[] = [];

  displayedColumns = ['num','fullName','associateId','department','cohortCode','sessions','trainingStatus','actions'];

  constructor(private mentorApi: MentorApiService, private metaApi: MetaApiService, private fb: FormBuilder, private snack: MatSnackBar) {
    this.form = this.fb.group({
      fullName:       ['', [Validators.required, Validators.minLength(2)]],
      email:          ['', [Validators.required, Validators.email]],
      associateId:    ['', Validators.required],
      department:     ['', Validators.required],
      cohortCode:     [''],
      contact:        [''],
      verticalMapping:[''],
      notes:          [''],
      trainingStatus: ['ACTIVE']
    });
  }

  ngOnInit(): void {
    this.load();
    this.metaApi.getDepartments().subscribe({ next: d => this.departments = d, error: () => {} });
    this.metaApi.getVerticals().subscribe({ next: d => this.verticals = d, error: () => {} });
  }

  load(): void {
    this.loading = true;
    this.mentorApi.getMyMentors(this.searchTerm||undefined, this.deptFilter||undefined, this.cohortFilter||undefined).subscribe({
      next: d => { this.mentors = d; this.loading = false; },
      error: () => { this.loading = false; this.snack.open('Failed to load mentors', 'Close', { duration: 3000 }); }
    });
  }

  get myMentors():     number { return this.mentors.length; }
  get activeMentors(): number { return this.mentors.filter(m => m.trainingStatus === 'ACTIVE').length; }
  get totalSessions(): number { return this.mentors.reduce((s, m) => s + m.totalSessions, 0); }
  get cohorts():       string[]{ return [...new Set(this.mentors.map(m => m.cohortCode).filter(Boolean))]; }

  openAdd(): void { this.editMode = false; this.editingId = null; this.form.reset({ trainingStatus: 'ACTIVE' }); this.showModal = true; }

  openEdit(m: MentorResponse): void {
    this.editMode = true; this.editingId = m.id;
    this.form.patchValue({ fullName: m.fullName, email: m.email, associateId: m.associateId,
      department: m.department, cohortCode: m.cohortCode, contact: m.contact,
      verticalMapping: m.verticalMapping, notes: m.notes, trainingStatus: m.trainingStatus });
    this.showModal = true;
  }

  save(): void {
    if (this.form.invalid) return;
    const call = this.editMode && this.editingId
      ? this.mentorApi.updateMentor(this.editingId, this.form.value)
      : this.mentorApi.createMentor(this.form.value);
    call.subscribe({
      next: () => { this.showModal = false; this.load(); this.snack.open('Mentor saved', 'Close', { duration: 3000 }); },
      error: err => this.snack.open(err.error?.error ?? 'Operation failed', 'Close', { duration: 3000 })
    });
  }

  confirmDelete(m: MentorResponse): void { this.deletingMentor = m; this.showDeleteDialog = true; }

  doDelete(): void {
    if (!this.deletingMentor) return;
    this.mentorApi.deleteMentor(this.deletingMentor.id).subscribe({
      next: () => { this.showDeleteDialog = false; this.load(); this.snack.open('Mentor deleted', 'Close', { duration: 3000 }); },
      error: err => this.snack.open(err.error?.error ?? 'Delete failed', 'Close', { duration: 3000 })
    });
  }

  getStatusClass(status: string): string {
    const m: Record<string,string> = { ACTIVE:'active-tr', ON_HOLD:'on-hold', COMPLETED:'completed', DROPPED:'dropped' };
    return m[status] ?? 'slate';
  }

  clearFilters(): void { this.searchTerm = ''; this.deptFilter = ''; this.cohortFilter = ''; }
}
