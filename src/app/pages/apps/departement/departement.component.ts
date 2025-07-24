import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

import { DepartementService } from 'src/app/services/departement.service';
import { AppDepartementDialogComponent } from './add/departement-dialog.component';

@Component({
  selector: 'app-departement',
  standalone: true,
  templateUrl: './departement.component.html',
  imports: [
    CommonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    AppDepartementDialogComponent
  ]
})
export class DepartementComponent implements OnInit {
  departements: any[] = [];
  displayedColumns: string[] = ['nom', 'responsable', 'actions'];

  constructor(
    private deptService: DepartementService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDepartements();
  }

  loadDepartements(): void {
    this.deptService.getAll().subscribe({
      next: (res) => (this.departements = res),
      error: () =>
        this.snackBar.open('Erreur chargement', 'Fermer', { duration: 3000 })
    });
  }

  openDialog(existingDept: any = null): void {
    const dialogRef = this.dialog.open(AppDepartementDialogComponent, {
      width: '500px',
      data: existingDept
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res === true) this.loadDepartements();
    });
  }

  deleteDepartement(id: string): void {
    if (confirm('Voulez-vous vraiment supprimer ce département ?')) {
      this.deptService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('✅ Département supprimé', 'Fermer', { duration: 3000 });
          this.loadDepartements();
        },
        error: () => {
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  editDepartement(dept: any): void {
    this.openDialog(dept);
  }
}
