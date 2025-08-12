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

  // ⬇️ nouvelle méthode (tu peux garder l’ancienne pour compat)
  getBeneficiaireInfo(token: string) {
    return this.http.get<BeneficiaireInfo>(`${this.baseUrl}/${token}`);
  }

  submitQuiz(token: string, answers: any[], utilisateur: string) {
    return this.http.post(`${this.baseUrl}/${token}`, { answers, utilisateur });
  }

  sendResultPdfByEmail(payload: {
    email: string;
    charts: { plus: string; minus: string; diff: string };
    scores: { plus: any; minus: any };
    token: string;
  }) {
    return this.http.post(`${this.baseUrl}/send-pdf`, payload);
  }
}
