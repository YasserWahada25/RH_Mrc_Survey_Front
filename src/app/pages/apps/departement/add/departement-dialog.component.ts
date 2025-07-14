import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DepartementService } from 'src/app/services/departement/departement.service';
import { UserService } from 'src/app/services/user.service';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';

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

  constructor(
    private dialogRef: MatDialogRef<AppDepartementDialogComponent>,
    private deptService: DepartementService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (res) => (this.users = res),
      error: () => this.snackBar.open('Erreur chargement utilisateurs', 'Fermer', { duration: 3000 })
    });
  }

  submit(): void {
    if (!this.nom || !this.responsable) return;

    this.deptService.create({ nom: this.nom, responsable: this.responsable }).subscribe({
      next: () => {
        // Mise à jour du rôle de l’utilisateur choisi
        this.userService.updateUser(this.responsable, { type: 'responsable' }).subscribe({
          next: () => {
            this.snackBar.open('✅ Département créé et rôle mis à jour', 'Fermer', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: () => {
            this.snackBar.open('Département créé, mais erreur mise à jour rôle utilisateur', 'Fermer', { duration: 3000 });
            this.dialogRef.close(true);
          }
        });
      },
      error: (err) => {
        this.snackBar.open('Erreur lors de la création : ' + err.message, 'Fermer', { duration: 3000 });
      }
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
