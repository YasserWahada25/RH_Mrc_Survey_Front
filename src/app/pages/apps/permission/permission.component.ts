import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

import { RolePermissionService, Role } from 'src/app/services/role.service';
import { RoleDialogComponent } from './add/role-dialog.component';

@Component({
  selector: 'app-permission',
  standalone: true,
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    RoleDialogComponent
  ]
})
export class PermissionComponent implements OnInit {
  roles: Role[] = [];
  displayedColumns: string[] = ['nom', 'permissions', 'actions'];

  constructor(
    private roleService: RolePermissionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (res: Role[]) => (this.roles = res),
      error: () =>
        this.snackBar.open('Erreur chargement rôles', 'Fermer', { duration: 3000 }),
    });
  }

  openDialog(existingRole: Role | null = null): void {
    const dialogRef = this.dialog.open(RoleDialogComponent, {
      width: '500px',
      data: existingRole
    });

    dialogRef.afterClosed().subscribe((res: boolean) => {
      if (res === true) this.loadRoles();
    });
  }

  deleteRole(id: string): void {
    if (confirm('Voulez-vous vraiment supprimer ce rôle ?')) {
      this.roleService.deleteRole(id).subscribe({
        next: () => {
          this.snackBar.open('✅ Rôle supprimé', 'Fermer', { duration: 3000 });
          this.loadRoles();
        },
        error: () => {
          this.snackBar.open('Erreur suppression', 'Fermer', { duration: 3000 });
        },
      });
    }
  }

  editRole(role: Role): void {
    this.openDialog(role);
  }
}
