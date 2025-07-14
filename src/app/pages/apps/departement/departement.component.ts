import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

import { DepartementService } from 'src/app/services/departement/departement.service';
import { AppDepartementDialogComponent } from './add/departement-dialog.component';

@Component({
  selector: 'app-departement',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    AppDepartementDialogComponent
  ],
  templateUrl: './departement.component.html',
})
export class DepartementComponent implements OnInit {
  departements: any[] = [];

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
      error: (err) => this.snackBar.open('Erreur chargement', 'Fermer', { duration: 3000 })
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AppDepartementDialogComponent, {
      width: '500px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res === true) this.loadDepartements();
    });
  }
}
