// src/app/services/assessment.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; // ✅ nécessaire si on typede les retours

@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private api = 'http://localhost:3033/api/assessments';

  constructor(private http: HttpClient) {}

  findAll(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  create(assessment: any): Observable<any> {
    return this.http.post(this.api, assessment);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  findResponses(assessmentId: string, userId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.api}/${assessmentId}/responses`,
      { params: { userId } }
    );
  }

  sendByEmail(assessmentId: string, userId: string): Observable<any> {
    return this.http.post(
      `${this.api}/${assessmentId}/send-email`,
      { userId }
    );
  }

  submitResponse(assessmentId: string, payload: any): Observable<any> {
    return this.http.post(
      `${this.api}/${assessmentId}/responses`,
      payload
    );
  }

  getUserInfo(assessmentId: string, userId: string): Observable<{ firstName: string; lastName: string; email: string }> {
    return this.http.get<{ firstName: string, lastName: string, email: string }>(
      `${this.api}/${assessmentId}/user-info`,
      { params: { userId } }
    );
  }

  /** GET /api/assessments/grouped-responses */
  getGroupedResponses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/grouped-responses`);
  }

  /** Envoi du PDF des réponses par email à un utilisateur */
  sendResponsesPdf(assessmentId: string, userId: string): Observable<any> {
    return this.http.post(
      `${this.api}/${assessmentId}/send-responses`,
      { userId }
    );
  }

  // ✅ Envoi à plusieurs emails (liste libre)
  // Endpoint attendu côté backend : POST /api/assessments/:id/send-by-email { emails: string[] }
  sendByEmailToMany(assessmentId: string, emails: string[]): Observable<any> {
    return this.http.post(
      `${this.api}/${assessmentId}/send-by-email`,
      { emails }
    );
  }
}
