import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface BeneficiaireInfo {
  email: string;
  nom?: string;
  prenom?: string;
  societe?: string;
  age?: number | null;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class QuizDiscPublicService {
  private baseUrl = 'http://localhost:3033/api/quizdisc';

  constructor(private http: HttpClient) {}

  getBeneficiaireInfo(token: string) {
    return this.http.get<BeneficiaireInfo>(`${this.baseUrl}/${token}`);
  }

  submitQuiz(token: string, answers: any[], utilisateur: string) {
    return this.http.post(`${this.baseUrl}/${token}`, { answers, utilisateur });
  }

  /** ⬇️ NOUVEAU: Sauvegarde PDF (avec charts) côté serveur, sans email auto */
  savePdfWithCharts(payload: {
    charts: { plus: string; minus: string; diff: string };
    scores: { plus: any; minus: any };
    token: string;
  }) {
    return this.http.post(`${this.baseUrl}/save-pdf`, payload);
  }

  /** (Conservé pour l’étape 4) envoi manuel par RH */
  sendResultPdfByEmail(payload: {
    email: string;
    charts: { plus: string; minus: string; diff: string };
    scores: { plus: any; minus: any };
    token: string;
  }) {
    return this.http.post(`${this.baseUrl}/send-pdf`, payload);
  }
}
