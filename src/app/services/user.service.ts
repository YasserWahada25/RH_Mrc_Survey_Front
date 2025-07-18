import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:3033/api/users';

  constructor(private http: HttpClient) {}

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token manquant');
    return {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
    };
  }

  createUser(userData: any) {
    return this.http.post(this.apiUrl, userData, this.getHeaders());
  }
  

  // ✅ Ajoutée : appelle URL dynamique (pour RH ou Responsable)
  // createUserCustom(userData: any, url: string) {
  //   return this.http.post(url, userData, this.getHeaders());
  // }
  createUserCustom(userData: any, url: string) {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Token manquant');

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.post(url, userData, { headers });
}


  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, this.getHeaders());
  }

  updateUser(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, this.getHeaders());
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders());
  }
}
