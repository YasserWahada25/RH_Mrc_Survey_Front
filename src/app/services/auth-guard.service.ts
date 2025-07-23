import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  CanLoad,
  Route,
  UrlSegment,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { AuthService } from './authentification.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  // Protège l’accès direct à un chemin
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkLogin(state.url);
  }

  // Protège toutes les routes “enfant”
  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(childRoute, state);
  }

  // Protège le lazy-loading d’un module
  canLoad(route: Route, segments: UrlSegment[]): boolean {
    const url = `/${route.path}`;
    return this.checkLogin(url);
  }

  // Vérifie l’authentification et redirige vers le login si nécessaire
  private checkLogin(url: string): boolean {
    if (this.auth.isLoggedIn()) {
      return true;
    }
    // Stocke l’URL pour redirection après login
    (this.auth as any).redirectUrl = url;
    this.router.navigate(['/authentication/side-login'], {
      queryParams: { returnUrl: url }
    });
    return false;
  }
}
