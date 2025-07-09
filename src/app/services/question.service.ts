import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Option {
  label: string;
  score: number;
}

export interface Question {
  _id?: string;
  texte: string;
  obligatoire: boolean;
  inputType: string;
  score: number;
  options: Option[];
  section: string;
}

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private url = `${environment.apiUrl}/questions`;
  constructor(private http: HttpClient) {}
  create(data: Question): Observable<Question> {
    return this.http.post<Question>(this.url, data);
  }
}
