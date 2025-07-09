import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
export interface Question {
  _id?: string;
  texte: string;
  date: string;
  obligatoire: boolean;
  inputType: string;
  score: number;
  section: string;
}

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private url = `${environment.apiUrl}/questions`;
  constructor(private http: HttpClient) {}
  create(data: Question) {
    return this.http.post<Question>(this.url, data);
  }
}
