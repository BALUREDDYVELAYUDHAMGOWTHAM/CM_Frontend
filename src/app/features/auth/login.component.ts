// features/auth/login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  hidePass = true;

  demos = [
    { role: 'Admin',   email: 'admin@cm.com', password: 'password', icon: 'admin_panel_settings' },
    { role: 'Coach',   email: 'sarah@cm.com', password: 'password', icon: 'school' },
    { role: 'Coach',   email: 'john@cm.com',  password: 'password', icon: 'school' },
  ];

  constructor(private fb: FormBuilder, private auth: AuthService,
              private router: Router, private snack: MatSnackBar) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  fill(d: any): void { this.form.patchValue({ email: d.email, password: d.password }); }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.login(this.form.value).subscribe({
      next: res => this.router.navigate([res.role === 'ADMIN' ? '/admin/dashboard' : '/coach/dashboard']),
      error: err => { this.loading = false; this.snack.open(err.error?.error ?? 'Login failed. Check backend is running.', 'Close', { duration: 5000 }); }
    });
  }
}
