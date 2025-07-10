import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, of, forkJoin } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
export interface Section {
  _id: string;
  titre: string;
  formulaire: string;
}

@Injectable({ providedIn: 'root' })
export class SectionService {
  private url = `${environment.apiUrl}/sections`;
  constructor(private http: HttpClient) {}
  create(data: Partial<Section>) {
    return this.http.post<Section>(this.url, data);
  }
  /** NOUVELLE MÉTHODE : récupère toutes les sections d’un formulaire */
  findByFormulaire(formulaireId: string): Observable<Section[]> {
    return this.http
      .get<Section[]>(`${this.url}?formulaire=${formulaireId}`)
      .pipe(
   /**      catchError((err) => {
          console.error('Échec chargement sections', err);
          return of([]);
        })*/
      );
  }
  update(id: string, data: any) {
    return this.http.put<Section>(`${this.url}/${id}`, data);
  }
}
