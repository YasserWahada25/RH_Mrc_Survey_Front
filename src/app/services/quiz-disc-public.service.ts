import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class QuizDiscPublicService {
  private baseUrl = 'http://localhost:3033/api/quizdisc';

  constructor(private http: HttpClient) {}

  getBeneficiaireEmail(token: string) {
    return this.http.get<{ email: string }>(`${this.baseUrl}/${token}`);
  }

  submitQuiz(token: string, answers: any[], utilisateur: string) {
    return this.http.post(`${this.baseUrl}/${token}`, {
      answers, 
      utilisateur
    });
    
  }

  sendResultPdfByEmail(payload: {
    email: string;
    charts: { plus: string; minus: string; diff: string };
    scores: { plus: any; minus: any };
  }) {
    return this.http.post(`${this.baseUrl}/send-pdf`, payload);
  }
}
