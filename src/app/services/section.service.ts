import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
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
}
