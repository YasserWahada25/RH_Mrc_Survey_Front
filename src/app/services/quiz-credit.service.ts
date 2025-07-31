import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuizCreditService {
  private apiUrl = 'http://localhost:3033/api/quizCredit';

  constructor(private http: HttpClient) {}

  approveAndAffectCredits(id: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/approve/${id}`, {}, { headers });
  }
}
