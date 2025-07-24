import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QuizResult } from '../models/quiz-result.model';

@Injectable({ providedIn: 'root' })
export class QuizResultsService {
    private apiUrl = 'http://localhost:3033/api/quiz-disc';

  constructor(private http: HttpClient) {}

  getResults(): Observable<QuizResult[]> {
    return this.http.get<QuizResult[]>(`${this.apiUrl}/results`);
  }


}
