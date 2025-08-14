import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';

interface JwtPayload {
  id: string;
  email: string;       // rh_admin, owner, etc
  type: string;
  nom: string;
  societe_logo?: string | null;
  photo?: string | null;
  // add other fields you might rely on in header/components
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private BASE_URL = 'http://localhost:3033/api/auth';
  // ✅ Ajouté : racine API (les routes login/logout sont montées sous /api)
  private API_ROOT = 'http://localhost:3033/api';

  private currentUserSubject = new BehaviorSubject<JwtPayload | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  registerRh(data: any) {
    return this.http.post(`${this.BASE_URL}/register-rh`, data);
  }

  login(data: { email: string; password: string }): Observable<{ token: string; user: any }> {
    return this.http
      .post<{ token: string; user: any }>(`${this.BASE_URL}/login`, data)
      .pipe(
        tap(response => {
          // Store
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));

          // Decode for subject
          const payload = this.decodeToken(response.token);
          this.currentUserSubject.next(payload);
        })
      );
  }

  // ✅ Ajouté : appelle le backend pour marquer l'utilisateur hors_ligne + lastLogoutAt
  private apiLogout(): Observable<any> {
    const token = this.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    // Backend route protégée : POST /api/logout
    return this.http.post(`${this.API_ROOT}/logout`, {}, { headers });
  }

  // ✅ Ajouté : séquence complète = API logout -> puis nettoyage local (en réutilisant ta méthode logout existante)
  logoutWithApi(): Promise<any> {
    return new Promise((resolve) => {
      this.apiLogout()
        .pipe(
          tap((res) => {
            // Optionnel : exploiter res.message / res.lastLogoutAt
            console.log('Logout API response:', res);
          }),
          catchError((err) => {
            // Même en cas d’erreur API, on continue à déconnecter côté front
            console.warn('Logout API error (continuing):', err);
            return of(null);
          }),
          finalize(() => {
            // On garde TA méthode logout() telle quelle pour vider les stockages + BehaviorSubject
            this.logout();
            resolve(true);
          })
        )
        .subscribe();
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): JwtPayload | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  // --------- NEW: live updates to broadcast changes without re-login ---------

  /** Merge partial fields into the current user, update localStorage and notify subscribers */
  updateCurrentUser(patch: Partial<JwtPayload>) {
    // update the "user" object used by components storing more UI-friendly fields
    const lsUser = JSON.parse(localStorage.getItem('user') || '{}');
    const nextUser = { ...lsUser, ...patch };
    localStorage.setItem('user', JSON.stringify(nextUser));

    // update the BehaviorSubject (decoded token shape)
    const cur = this.currentUserSubject.value;
    if (cur) {
      const next = { ...cur, ...patch };
      this.currentUserSubject.next(next);
    }
  }

  /** Convenience helpers */
  setUserPhoto(photoPath: string) {
    this.updateCurrentUser({ photo: photoPath });
  }

  setSocieteLogo(logoPath: string) {
    this.updateCurrentUser({ societe_logo: logoPath });
  }

  // --------------------------------------------------------------------------

  private loadUserFromStorage() {
    const token = this.getToken();
    if (token) {
      const payload = this.decodeToken(token);
      this.currentUserSubject.next(payload);
    }
  }

  private decodeToken(token: string): JwtPayload {
    const payloadBase64 = token.split('.')[1];
    const decodedJson = atob(payloadBase64);
    return JSON.parse(decodedJson);
  }
}
