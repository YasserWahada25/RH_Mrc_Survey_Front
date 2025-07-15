import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DepartementService {
  private baseUrl = `${environment.apiUrl}/departements`;

  constructor(private http: HttpClient) {}

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token manquant');
    return {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
    };
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl, this.getHeaders());
  }

  create(dept: any): Observable<any> {
    return this.http.post(this.baseUrl, dept, this.getHeaders());
  }
  delete(id: string): Observable<any> {
  return this.http.delete(`${this.baseUrl}/${id}`, this.getHeaders());
}
update(id: string, data: any): Observable<any> {
  return this.http.put(`${this.baseUrl}/${id}`, data, this.getHeaders());
}


}
