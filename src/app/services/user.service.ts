import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

export interface PresenceUser {
  _id: string;
  nom: string;
  email: string;
  type: 'owner' | 'rh_admin' | 'responsable' | 'employe';
  photo?: string | null;
  status: 'en_ligne' | 'hors_ligne';
  lastActiveAt?: string;
  lastLoginAt?: string;
  lastLogoutAt?: string;
  lastActiveAgo?: string;    // string built by backend (ex: "il y a 10 min")
}
export interface PresenceResponse {
  online: PresenceUser[];
  offline: PresenceUser[];
}


@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:3033/api/users';
  private base = 'http://localhost:3033';

  constructor(private http: HttpClient) { }

  private authHeaders() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token manquant');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  createUser(userData: any) {
    const headers = this.authHeaders();
    return this.http.post(this.apiUrl, userData, { headers });
  }

  createUserCustom(userData: any, url: string) {
    const headers = this.authHeaders();
    return this.http.post(url, userData, { headers });
  }

  uploadMyPhoto(file: File) {
    const headers = this.authHeaders();
    const fd = new FormData();
    fd.append('photo', file);
    return this.http.patch<{ photo: string }>(`${this.apiUrl}/me/photo`, fd, { headers });
  }

  uploadUserPhotoByAdmin(userId: string, file: File) {
    const headers = this.authHeaders();
    const fd = new FormData();
    fd.append('photo', file);
    return this.http.patch<{ photo: string }>(`${this.apiUrl}/${userId}/photo`, fd, { headers });
  }

  getAllUsers(): Observable<User[]> {
    const headers = this.authHeaders();
    return this.http.get<User[]>(this.apiUrl, { headers });
  }

  // ✅ AJOUT : liste des utilisateurs accessibles (responsable/employé)
  getAccessibleUsers(): Observable<User[]> {
    const headers = this.authHeaders();
    return this.http.get<User[]>(`${this.apiUrl}/accessible`, { headers });
  }

  // ✅ AJOUT : employés du responsable (utile selon tes écrans)
  getUsersForResponsable(): Observable<User[]> {
    const headers = this.authHeaders();
    return this.http.get<User[]>(`${this.apiUrl}/responsable/employes`, { headers });
  }


  updateUser(id: string, data: any): Observable<any> {
    const headers = this.authHeaders();
    return this.http.put(`${this.apiUrl}/${id}`, data, { headers });
  }

  deleteUser(id: string): Observable<any> {
    const headers = this.authHeaders();
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }
  /** ✅ NEW: presence list (online/offline) */
 // ---- API call (add) ----
getPresence(): Observable<PresenceResponse> {
  const headers = this.authHeaders();
  return this.http.get<PresenceResponse>(`${this.apiUrl}/presence`, { headers });
}
  absolute(path?: string | null) {
    return path ? `${this.base}${path}` : null;
  }
}

