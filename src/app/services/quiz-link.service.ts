import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface RecipientPayload {
  email: string;
  nom?: string;
  prenom?: string;
  societe?: string;
  age?: number | null;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class QuizLinkService {
  private apiUrl = 'http://localhost:3033/api/links';

  constructor(private http: HttpClient) {}

  generateLinks(recipients: RecipientPayload[]): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post(`${this.apiUrl}/generate-links`, { recipients }, { headers });
  }
}
