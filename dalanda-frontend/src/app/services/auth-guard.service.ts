// src/app/services/auth-guard.service.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthGuardService implements CanActivate {
  constructor(private tokenSvc: TokenService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('AuthGuardService#canActivate running, token=', this.tokenSvc.get());
    if (this.tokenSvc.get()) {
      return true;
    }
    console.log('No token, redirecting to /login');
    this.router.navigate(['/login']);
    return false;
  }
}
