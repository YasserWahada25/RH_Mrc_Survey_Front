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

  
}
