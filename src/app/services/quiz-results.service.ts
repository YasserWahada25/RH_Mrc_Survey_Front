import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QuizResult } from '../models/quiz-result.model';

@Injectable({ providedIn: 'root' })
export class QuizResultsService {
  private apiUrl = 'http://localhost:3033/api/quiz-disc';

  constructor(private http: HttpClient) {}

  private get authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getResults(): Observable<QuizResult[]> {
    return this.http.get<QuizResult[]>(`${this.apiUrl}/results`, {
      headers: this.authHeaders,
    });
  }

  previewReport(token: string): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/report/${token}`;
    return this.http.get(url, {
      headers: this.authHeaders,
      responseType: 'blob',
      observe: 'response',
    });
  }

  downloadReport(token: string): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/report/${token}?download=1`;
    return this.http.get(url, {
      headers: this.authHeaders,
      responseType: 'blob',
      observe: 'response',
    });
  }

  /** ⬇️ NEW: envoi du PDF existant au bénéficiaire */
  sendReportToBeneficiary(token: string, email?: string): Observable<any> {
    const url = `${this.apiUrl}/report/${token}/send`;
    return this.http.post(url, { email }, { headers: this.authHeaders });
  }
}
