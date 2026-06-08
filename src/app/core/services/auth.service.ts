import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, LoginRequest } from '../../shared/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API = environment.apiUrl;
  private userSubject = new BehaviorSubject<AuthResponse | null>(this.loadUser());
  currentUser$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/auth/login`, req).pipe(
      tap(res => {
        localStorage.setItem('cm_token', res.token);
        localStorage.setItem('cm_user', JSON.stringify(res));
        this.userSubject.next(res);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('cm_token');
    localStorage.removeItem('cm_user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken():       string | null      { return localStorage.getItem('cm_token'); }
  getCurrentUser(): AuthResponse | null { return this.userSubject.value; }
  isLoggedIn():     boolean             { return !!this.getToken(); }
  getRole():        string              { return this.userSubject.value?.role ?? ''; }
  isAdmin():        boolean             { return this.getRole() === 'ADMIN'; }
  isCoach():        boolean             { return this.getRole() === 'COACH'; }

  private loadUser(): AuthResponse | null {
    const u = localStorage.getItem('cm_user');
    return u ? JSON.parse(u) : null;
  }
}
