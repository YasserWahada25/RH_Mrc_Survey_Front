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

import { DepartementService } from 'src/app/services/departement/departement.service';
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

    this.userService.getAllUsers().subscribe({
      next: (res) => (this.users = res),
      error: () =>
        this.snackBar.open('Erreur chargement utilisateurs', 'Fermer', { duration: 3000 })
    });
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
