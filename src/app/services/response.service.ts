// src/app/services/response.service.ts

import { Injectable }     from '@angular/core';
import { HttpClient }     from '@angular/common/http';
import { environment }    from 'src/environments/environment';
import { Observable }     from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResponseService {
  private base = `${environment.apiUrl}/formulaires`;

  constructor(private http: HttpClient) {}  // ← Injection de HttpClient

  /**
   * Enregistre les réponses pour un formulaire donné
   * @param formId  ID du formulair
   * @param userId  ID de l’utilisateur
   * @param answers Tableau d’objets { sectionId, questionId, answer }
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

    /** Récupère toutes les réponses (avec titre du formulaire) */
  getAllResponses(): Observable<Array<{
    _id: string;
    createdAt: string;
    userId: string;
    formulaire: { titre: string };
  }>> {
    return this.http.get<Array<any>>( `${environment.apiUrl}/formulaires/responses/all` );
  }
}
