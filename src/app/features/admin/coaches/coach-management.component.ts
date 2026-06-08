// features/admin/coaches/coach-management.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CoachApiService } from '../../../core/services/api.services';
import { CoachResponse } from '../../../shared/models';

@Component({
  selector: 'app-coach-management',
  templateUrl: './coach-management.component.html',
  styleUrls: ['./coach-management.component.scss']
})
export class CoachManagementComponent implements OnInit {
  coaches: CoachResponse[] = [];
  loading = false;
  searchTerm = '';
  deptFilter = '';
  statusFilter = '';

  // Modal state
  showModal = false;
  editMode = false;
  editingId: number | null = null;
  form: FormGroup;

  // Delete dialog
  showDeleteDialog = false;
  deletingCoach: CoachResponse | null = null;
  deleting = false;

  displayedColumns = ['num', 'fullName', 'email', 'department', 'contact', 'status', 'actions'];

  constructor(private coachApi: CoachApiService, private fb: FormBuilder, private snack: MatSnackBar) {
    this.form = this.fb.group({
      fullName:   ['', [Validators.required, Validators.minLength(2)]],
      email:      ['', [Validators.required, Validators.email]],
      department: ['', Validators.required],
      contact:    [''],
      active:     [true],
      notes:      ['']
    });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.coachApi.getCoaches(this.searchTerm || undefined, this.deptFilter || undefined).subscribe({
      next: d => { this.coaches = d; this.loading = false; },
      error: () => { this.loading = false; this.snack.open('Failed to load coaches', 'Close', { duration: 3000 }); }
    });
  }

  get filtered(): CoachResponse[] {
    return this.coaches.filter(c => {
      const matchName = !this.searchTerm || c.fullName.toLowerCase().includes(this.searchTerm.toLowerCase())
                        || c.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchDept = !this.deptFilter || c.department === this.deptFilter;
      const matchStatus = !this.statusFilter || (this.statusFilter === 'active' ? c.active : !c.active);
      return matchName && matchDept && matchStatus;
    });
  }

  get totalCoaches(): number   { return this.coaches.length; }
  get activeCoaches(): number  { return this.coaches.filter(c => c.active).length; }
  get inactiveCoaches(): number{ return this.coaches.filter(c => !c.active).length; }
  get departments(): number    { return new Set(this.coaches.map(c => c.department).filter(Boolean)).size; }

  openAdd(): void {
    this.editMode = false; this.editingId = null;
    this.form.reset({ active: true });
    this.showModal = true;
  }

  openEdit(coach: CoachResponse): void {
    this.editMode = true; this.editingId = coach.id;
    this.form.patchValue({
      fullName: coach.fullName, email: coach.email,
      department: coach.department, contact: coach.contact, active: coach.active
    });
    this.showModal = true;
  }

  save(): void {
    if (this.form.invalid) return;
    const req = this.form.value;
    const call = this.editMode && this.editingId
      ? this.coachApi.updateCoach(this.editingId, req)
      : this.coachApi.createCoach(req);
    call.subscribe({
      next: () => { this.showModal = false; this.load(); this.snack.open(`Coach ${this.editMode ? 'updated' : 'added'} successfully`, 'Close', { duration: 3000 }); },
      error: err => this.snack.open(err.error?.error ?? 'Operation failed', 'Close', { duration: 3000 })
    });
  }

  confirmDelete(coach: CoachResponse): void { this.deletingCoach = coach; this.showDeleteDialog = true; }

  doDelete(): void {
    if (!this.deletingCoach) return;
    this.deleting = true;
    this.coachApi.deleteCoach(this.deletingCoach.id).subscribe({
      next: () => { this.showDeleteDialog = false; this.deleting = false; this.load(); this.snack.open('Coach deleted', 'Close', { duration: 3000 }); },
      error: err => { this.deleting = false; this.snack.open(err.error?.error ?? 'Delete failed', 'Close', { duration: 3000 }); }
    });
  }

  clearFilters(): void { this.searchTerm = ''; this.deptFilter = ''; this.statusFilter = ''; }
}
