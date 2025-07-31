import { Injectable }   from '@angular/core';
import { HttpClient,
         HttpHeaders }  from '@angular/common/http';
import { Observable }   from 'rxjs';

export interface UserDTO { _id: string; nom: string; email: string; }

@Injectable({ providedIn: 'root' })
export class FormEmailService {
  private baseUrl = 'http://localhost:3033/api/formulaires';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserDTO[]> {
    // vous avez déjà votre UserService ; sinon :
    return this.http.get<UserDTO[]>('http://localhost:3033/api/users', {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('token')}`
      })
    });
  }

  sendFormEmail(formId: string, userId: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/${formId}/send-email`,
      { userId },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${localStorage.getItem('token')}`
        })
      }
    );
  }
}
