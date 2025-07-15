import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Formulaire {
  _id: string;
  titre: string;
  description?: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class FormulaireService {
  private url = `${environment.apiUrl}/formulaires`;

  constructor(private http: HttpClient) {}

  /** Récupère tous les formulaires */
  getAll(): Observable<Formulaire[]> {
    return this.http.get<Formulaire[]>(this.url);
  }

  /** Crée un nouveau formulaire */
  create(data: Partial<Formulaire>): Observable<Formulaire> {
    return this.http.post<Formulaire>(this.url, data);
  }

  /** (Optionnel) Récupérer un formulaire par ID */
  getById(id: string): Observable<Formulaire> {
    return this.http.get<Formulaire>(`${this.url}/${id}`);
  }

  /** (Optionnel) Mettre à jour un formulaire existant */
  update(id: string, data: Partial<Formulaire>): Observable<Formulaire> {
    return this.http.put<Formulaire>(`${this.url}/${id}`, data);
  }


/** DELETE /api/formulaires/:id */
delete(id: string): Observable<void> {
  return this.http.delete<void>(`${this.url}/${id}`);
}

    duplicate(id: string): Observable<Formulaire> {
    return this.http.post<Formulaire>(`${this.url}/${id}/duplicate`, {});
  }

  getByToken(id: string, token: string) {
  return this.http.get<{ form: Formulaire, sections: any[] }>(
    `${this.url}/${id}/by-token/${token}`
  );
}

  
  
}
