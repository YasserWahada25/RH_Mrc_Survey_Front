import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, of, forkJoin } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
export interface SurveyOption {
  label: string;
  score: number;  
}
export interface Question {
  _id: string;
  texte: string;
  obligatoire: boolean;
  inputType: string;
  score: number;
  options: SurveyOption[];
  section: string;
}

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private url = `${environment.apiUrl}/questions`;
  constructor(private http: HttpClient) {}
  create(data: Partial<Question>) {
    return this.http.post<Question>(this.url, data);
  }
  update(id: string, data: any) {
    return this.http.put<Question>(`${this.url}/${id}`, data);
  }
  /** NOUVELLE MÉTHODE : récupère toutes les questions d’une section */
  findBySection(sectionId: string): Observable<Question[]> {
    // Suppose que l’API back accepte ?section=<id>
    return this.http.get<Question[]>(`${this.url}?section=${sectionId}`);
  }
}
