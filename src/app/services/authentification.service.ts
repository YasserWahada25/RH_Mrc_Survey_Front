import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, map } from 'rxjs';

interface JwtPayload {
  id: string;
  email: string;
  type: string; // rh_admin, owner, etc
  nom: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private BASE_URL = 'http://localhost:3033/api/auth';

  private currentUserSubject = new BehaviorSubject<JwtPayload | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  registerRh(data: any) {
    return this.http.post(`${this.BASE_URL}/register-rh`, data);
  }

  login(data: { email: string; password: string }): Observable<{ token: string, user: any }> {
  return this.http.post<{ token: string, user: any }>(`${this.BASE_URL}/login`, data).pipe(
    map((response) => {
      // Stocker le token dans localStorage
      localStorage.setItem('token', response.token);

      // Décoder le token pour obtenir les données (nom, type, etc)
      const payload = this.decodeToken(response.token);

      // Mettre à jour le BehaviorSubject
      this.currentUserSubject.next(payload);

      return response;
    })
  );
}

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser'); // facultatif si tu l’utilises
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














// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs'; 


// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   private BASE_URL = 'http://localhost:3033/api/auth';

//   constructor(private http: HttpClient) {}

//   registerRh(data: any) {
//     return this.http.post(`${this.BASE_URL}/register-rh`, data);
//   }

//   login(data: { email: string, password: string }): Observable<any> {
//     return this.http.post(`${this.BASE_URL}/login`, data);
//   }
// }



