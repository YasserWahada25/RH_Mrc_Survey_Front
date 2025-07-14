import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';


@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:3033/api/users';

  constructor(private http: HttpClient) {}

  createUser(userData: any) {
    const token = localStorage.getItem('token'); // ou où tu stockes le JWT
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.post(this.apiUrl, userData, { headers });
  }
getAllUsers(): Observable<User[]> {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Token manquant');
    return new Observable(observer => observer.error('Token manquant'));
  }

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get<User[]>(this.apiUrl, { headers });
}


    updateUser(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  
}
