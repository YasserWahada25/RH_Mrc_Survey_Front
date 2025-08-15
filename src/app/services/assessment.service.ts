// src/app/services/assessment.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// --- Types facultatifs mais utiles ---
export type Phase = 'normal' | 'avant' | 'apres';

export interface Assessment {
  _id: string;
  name: string;
  type: 'normal' | 'avant_apres';
  company?: string;
  trainerName?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  tasks?: any[];
}

export interface GroupedResponseRow {
  email: string;
  userId: string;
  assessmentId: string;
  assessmentName: string;
  assessmentType: 'normal' | 'avant_apres';
  firstName?: string;
  lastName?: string;
  phaseCount: number; // 0..2
}

export interface Invitee {
  email: string;
  userId: string;
  phase: Phase;
  used: boolean;
  usedAt?: string;
  hasAvant: boolean;
  hasApres: boolean;
  sentAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private api = 'http://localhost:3033/api/assessments';

  constructor(private http: HttpClient) {}

  // ---- Assessments ----
  findAll(): Observable<Assessment[]> {
    return this.http.get<Assessment[]>(this.api);
  }

  create(assessment: any): Observable<Assessment> {
    return this.http.post<Assessment>(this.api, assessment);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.api}/${id}`);
  }

  getById(id: string): Observable<Assessment> {
    return this.http.get<Assessment>(`${this.api}/${id}`);
  }

  // ---- Réponses ----
  findResponses(assessmentId: string, userId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.api}/${assessmentId}/responses`,
      { params: { userId } }
    );
  }

  submitResponse(assessmentId: string, payload: any): Observable<any> {
    // payload peut contenir: { token?, userId, phase, firstName?, lastName?, email?, answers: [...] }
    return this.http.post(`${this.api}/${assessmentId}/responses`, payload);
  }

  getUserInfo(
    assessmentId: string,
    userId: string
  ): Observable<{ firstName: string; lastName: string; email: string }> {
    return this.http.get<{ firstName: string; lastName: string; email: string }>(
      `${this.api}/${assessmentId}/user-info`,
      { params: { userId } }
    );
  }

  // ---- Grouped responses ----
  getGroupedResponses(): Observable<GroupedResponseRow[]> {
    return this.http.get<GroupedResponseRow[]>(`${this.api}/grouped-responses`);
  }

  // ---- PDF ----
  sendResponsesPdf(assessmentId: string, userId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.api}/${assessmentId}/send-responses`,
      { userId }
    );
  }

  // ---- Ancienne API d’envoi (garde pour rétro-compat) ----
  sendByEmail(assessmentId: string, userId: string): Observable<any> {
    return this.http.post(`${this.api}/${assessmentId}/send-email`, { userId });
  }

  // (déprécié au profit de inviteByEmail)
  sendByEmailToMany(assessmentId: string, emails: string[]): Observable<any> {
    return this.http.post(`${this.api}/${assessmentId}/send-by-email`, { emails });
  }

  // ---- Nouvelles invitations par phase ----
  inviteByEmail(assessmentId: string, phase: Phase, emails: string[]): Observable<any> {
    return this.http.post(`${this.api}/${assessmentId}/invite`, { phase, emails });
  }

  listInvitees(assessmentId: string, phase?: Phase): Observable<Invitee[]> {
    let params = new HttpParams();
    if (phase) params = params.set('phase', phase);
    return this.http.get<Invitee[]>(`${this.api}/${assessmentId}/invitees`, { params });
  }
}
