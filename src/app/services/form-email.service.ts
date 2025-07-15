import { Injectable }   from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable }   from 'rxjs';

export interface UserDTO {
  _id: string;
  nom: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class FormEmailService {
  private baseUrl = 'http://localhost:3033/api';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserDTO[]> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<UserDTO[]>(`${this.baseUrl}/users`, { headers });
  }

  sendFormEmail(formId: string, userId: string): Observable<any> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post(
      `${this.baseUrl}/forms/send-email`,
      { formId, userId },
      { headers }
    );
  }
}
