import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/login']); return false; }
    const roles: string[] = route.data['roles'] ?? [];
    if (roles.length && !roles.includes(this.auth.getRole())) {
      this.router.navigate([this.auth.isAdmin() ? '/admin/dashboard' : '/coach/dashboard']);
      return false;
    }
    return true;
  }
}
