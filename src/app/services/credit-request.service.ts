import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreditRequest {
  _id: string;
  nombre_credits: number;
  status: 'pending' | 'approved' | 'rejected';
  dateCreated: string;
  rhAdminId: {
    _id: string;
    nom: string;
    email: string;
    societe?: {
      _id: string;
      nom: string;
    };
  };
}


@Injectable({
  providedIn: 'root'
})
export class CreditRequestService {
  private apiUrl = 'http://localhost:3033/api/creditRequests';

  constructor(private http: HttpClient) {}

  createRequest(rhAdminId: string, nombre: number): Observable<any> {
    const body = { rhAdminId, nombre };
    return this.http.post<any>(`${this.apiUrl}/create`, body);
  }

  getAllRequestsForOwner(): Observable<CreditRequest[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<CreditRequest[]>(`${this.apiUrl}/all`, { headers });
  }

  updateRequestStatus(requestId: string, status: 'approved' | 'rejected'): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${requestId}/status`, { status });
  }

  getCredits(rhAdminId: string): Observable<{ nombre_credits: number }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<{ nombre_credits: number }>(`${this.apiUrl}/credits/${rhAdminId}`, { headers });
  }



}
