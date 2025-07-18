import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Role, Permission } from './role.service';

@Injectable({ providedIn: 'root' })
export class RolePermissionService {
private baseUrl = 'http://localhost:3033/api/roles';
private permissionUrl = 'http://localhost:3033/api/permissions';

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.baseUrl);
  }

  addRole(role: Role): Observable<any> {
    return this.http.post(this.baseUrl, role);
  }

  updateRole(id: string, role: Role): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, role);
  }

  deleteRole(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.permissionUrl);
  }
}