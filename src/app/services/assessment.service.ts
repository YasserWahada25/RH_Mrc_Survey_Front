import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private api = 'http://localhost:3033/api/assessments';

  constructor(private http: HttpClient) {}

  findAll() {
    return this.http.get<any[]>(this.api);
  }

  create(assessment: any) {
    return this.http.post(this.api, assessment);
  }

  delete(id: string) {
    return this.http.delete(`${this.api}/${id}`);
  }

  // update, findById… à ajouter si besoin
}
