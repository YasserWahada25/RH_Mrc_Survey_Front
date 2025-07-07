import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
export interface Formulaire {
  _id: string;
  titre: string;
  description: string;
  type: string;
}

@Injectable({ providedIn: 'root' })
export class FormulaireService {
  private url = `${environment.apiUrl}/formulaires`;
  constructor(private http: HttpClient) {}
  create(data: Partial<Formulaire>) {
    return this.http.post<Formulaire>(this.url, data);
  }
}
