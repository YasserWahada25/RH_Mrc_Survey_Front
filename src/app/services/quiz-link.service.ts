import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QuizLinkService {
  private apiUrl = 'http://localhost:3033/api/links';

  constructor(private http: HttpClient) {}

  generateLinks(emails: string[]): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
 
return this.http.post(`${this.apiUrl}/generate-links`, { emails }, { headers });
    
  }


//    // 🔹 Méthode pour récupérer les lots depuis un lien
//   getQuizLotsByLinkId(linkId: string) {
//     return this.http.get(`${environment.apiBaseUrl}/api/quizdisc/${linkId}/lots`);
//   }

//   // 🔹 Méthode pour soumettre le quiz
//   submitQuizByLink(linkId: string, answers: any) {
//     return this.http.post(`${environment.apiBaseUrl}/api/quizdisc/${linkId}/submit`, { answers });
//   }


  
}
