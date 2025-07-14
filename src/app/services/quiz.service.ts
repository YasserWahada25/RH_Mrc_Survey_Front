import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Lot } from '../models/quiz.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class QuizService {
  apiUrl = 'http://localhost:3033/api/quiz';

  constructor(private http: HttpClient) {}

  getAllLots(): Observable<Lot[]> {
    return this.http.get<Lot[]>(`${this.apiUrl}`);
  }

  submitAnswers(answers: { lotId: number; plusIndex: number | null; minusIndex: number | null }[]) {
    return this.http.post(`${this.apiUrl}/submit`, { answers });
  }



}
