import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DepartementService {
  private baseUrl = `${environment.apiUrl}/departement`;

  constructor(private http: HttpClient) {}

  private getHeaders(): any {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token manquant');
    return { headers: new HttpHeaders().set('Authorization', `Bearer ${token}`) };
  }

 getAll(): Observable<any[]> {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Token manquant');
    return new Observable((observer) => {
      observer.error('Token JWT manquant');
    });
  }

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get<any[]>(this.baseUrl, { headers });
}


  create(dept: any): Observable<any> {
    return this.http.post(this.baseUrl, dept, this.getHeaders());
  }
}