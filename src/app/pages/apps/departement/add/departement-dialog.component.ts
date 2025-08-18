import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';

import { DepartementService } from 'src/app/services/departement.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-departement-dialog',
  standalone: true,
  templateUrl: './departement-dialog.component.html',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule
  ]
})
export class AppDepartementDialogComponent implements OnInit {
  nom = '';
  responsable = '';
  users: any[] = [];
  mode: 'create' | 'edit' = 'create';

  /** id de l'utilisateur connecté (exclu de la liste) */
  private currentUserId: string | null = null;

  /** rôles autorisés pour la sélection */
  private readonly allowedRoles = ['employe', 'responsable'];

  constructor(
    private dialogRef: MatDialogRef<AppDepartementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private deptService: DepartementService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    if (this.data) {
      this.nom = this.data.nom;
      this.responsable = this.data.responsable?._id;
      this.mode = 'edit';
    }

    this.currentUserId = this.getCurrentUserId();

    // Charge TOUS les utilisateurs (rh_admin a le droit) puis on filtre côté client
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        this.users = Array.isArray(res) ? res : [];
        // console.log('RAW users:', this.users);
      },
      error: () =>
        this.snackBar.open('Erreur chargement utilisateurs', 'Fermer', { duration: 3000 })
    });
  }

  /** liste affichée dans le <mat-select> */
  get allowedUsers() {
    return (this.users || []).filter((u: any) => {
      const role = this.getRole(u);
      const roleOk = this.allowedRoles.includes(role); // employe | responsable
      const notCurrent = this.currentUserId ? this.getUserId(u) !== this.currentUserId : true; // exclure le compte connecté
      return roleOk && notCurrent;
    });
  }

  /** normalise l’id utilisateur (selon backend: _id | id | userId) */
  private getUserId(u: any): string | null {
    return u?._id || u?.id || u?.userId || null;
  }

  /** normalise le rôle (selon backend: type | role, valeurs fr/en) */
  private getRole(u: any): string {
    const raw = (u?.type ?? u?.role ?? '').toString().toLowerCase().trim();
    if (raw === 'employee') return 'employe';
    if (raw === 'manager' || raw === 'responsable') return 'responsable';
    return raw; // 'employe', 'rh_admin', 'owner', etc.
  }

  /** essaie de déduire l'id utilisateur depuis storage / token */
  private getCurrentUserId(): string | null {
    // 1) depuis un objet user stocké
    const userKeys = ['user', 'auth_user', 'currentUser'];
    for (const k of userKeys) {
      const raw = localStorage.getItem(k) || sessionStorage.getItem(k);
      if (raw) {
        try {
          const obj = JSON.parse(raw);
          const id = obj?._id || obj?.id || obj?.userId || null;
          if (id) return id;
        } catch { /* ignore */ }
      }
    }

    // 2) sinon, décoder le JWT
    const tokenKeys = ['token', 'access_token'];
    for (const k of tokenKeys) {
      const token = localStorage.getItem(k) || sessionStorage.getItem(k);
      if (!token) continue;
      const id = this.decodeUserIdFromJwt(token);
      if (id) return id;
    }

    return null;
  }

  private decodeUserIdFromJwt(token: string): string | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1]));
      return payload?.id || payload?._id || payload?.userId || payload?.sub || null;
    } catch {
      return null;
    }
  }

  submit(): void {
    if (!this.nom || !this.responsable) return;

    const payload = { nom: this.nom, responsable: this.responsable };

    if (this.mode !== 'edit') {
      this.deptService.create(payload).subscribe({
        next: (createdDept) => {
          const updatePayload = {
            type: 'responsable',
            departement: createdDept._id
          };
          this.userService.updateUser(this.responsable, updatePayload).subscribe({
            next: () => {
              this.snackBar.open('Département créé et utilisateur mis à jour', 'Fermer', { duration: 3000 });
              this.dialogRef.close(true);
            },
            error: () => {
              this.snackBar.open('Département créé, erreur mise à jour utilisateur', 'Fermer', { duration: 3000 });
              this.dialogRef.close(true);
            }
          });
        },
        error: (err) => {
          this.snackBar.open('Erreur création département : ' + err.message, 'Fermer', { duration: 3000 });
        }
      });

    } else {
      // on laisse ta logique d’origine
      this.deptService.create(payload).subscribe({
        next: () => {
          this.userService.updateUser(this.responsable, { type: 'responsable' }).subscribe({
            next: () => {
              this.snackBar.open('Département créé et rôle mis à jour', 'Fermer', { duration: 3000 });
              this.dialogRef.close(true);
            },
            error: () => {
              this.snackBar.open('Département créé, erreur mise à jour rôle', 'Fermer', { duration: 3000 });
              this.dialogRef.close(true);
            }
          });
        },
        error: (err) => {
          this.snackBar.open('Erreur création : ' + err.message, 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
