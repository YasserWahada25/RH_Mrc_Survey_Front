import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

// DTO pour la liste des réponses
export interface ResponseListDTO {
  _id: string;
  createdAt: string;
  userId: string;
  formulaire: {
    _id: string;
    titre: string;
  };
}

// DTO détaillé d'une réponse, avec les réponses aux questions
export interface ResponseDetailDTO extends ResponseListDTO {
  answers: Array<{
    sectionId: string;
    questionId: string;
    answer: any;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ResponseService {
  private base = `${environment.apiUrl}/formulaires`;

  constructor(private http: HttpClient) {}

  /**
   * Enregistre les réponses pour un formulaire donné
   */
  create(
    formId: string,
    userId: string,
    answers: Array<{ sectionId: string; questionId: string; answer: any }>
  ): Observable<any> {
    return this.http.post(
      `${this.base}/${formId}/responses`,
      { userId, answers }
    );
  }

  /**
   * Récupère toutes les réponses (avec _id et titre du formulaire)
   */
  getAllResponses(): Observable<ResponseListDTO[]> {
    return this.http.get<ResponseListDTO[]>(
      `${this.base}/responses/all`
    );
  }

  /**
   * Récupère une réponse unique (avec titre de formulaire et réponses détaillées)
   */
  getResponse(
    formId: string,
    responseId: string
  ): Observable<ResponseDetailDTO> {
    return this.http.get<ResponseDetailDTO>(
      `${this.base}/${formId}/responses/${responseId}`
    );
  }
}
