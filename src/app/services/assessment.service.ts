// src/app/services/assessment.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private api = 'http://localhost:3033/api/assessments';

  constructor(private http: HttpClient) {}

  findAll() {
    return this.http.get<any[]>(this.api);
  }

  create(assessment: any) {
    return this.http.post(this.api, assessment);
  }

  delete(id: string) {
    return this.http.delete(`${this.api}/${id}`);
  }

  getById(id: string) {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  findResponses(assessmentId: string, userId: string) {
    return this.http.get<any[]>(
      `${this.api}/${assessmentId}/responses?userId=${userId}`
    );
  }

  sendByEmail(assessmentId: string, userId: string) {
    return this.http.post(
      `${this.api}/${assessmentId}/send-email`,
      { userId }
    );
  }

  submitResponse(assessmentId: string, payload: any) {
    return this.http.post(
      `${this.api}/${assessmentId}/responses`,
      payload
    );
  }

  getUserInfo(assessmentId: string, userId: string) {
    return this.http.get<{ firstName: string, lastName: string, email: string }>(
      `${this.api}/${assessmentId}/user-info`,
      { params: { userId } }
    );
  }

/** GET /api/assessments/grouped-responses */
getGroupedResponses() {
  return this.http.get<any[]>(`${this.api}/grouped-responses`);
}
}
