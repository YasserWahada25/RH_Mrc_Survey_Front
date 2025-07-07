import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'; 


@Injectable({ providedIn: 'root' })
export class AuthService {
  private BASE_URL = 'http://localhost:3033/api/auth';

  constructor(private http: HttpClient) {}

  registerRh(data: any) {
    return this.http.post(`${this.BASE_URL}/register-rh`, data);
  }

  login(data: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.BASE_URL}/login`, data);
  }
}



