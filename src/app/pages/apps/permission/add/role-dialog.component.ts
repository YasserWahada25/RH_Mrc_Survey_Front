import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { RolePermissionService, Role, Permission } from 'src/app/services/role.service';

@Component({
  selector: 'app-role-dialog',
  standalone: true,
  templateUrl: './role-dialog.component.html',
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatButtonModule,
    ReactiveFormsModule
  ]
})
export class RoleDialogComponent implements OnInit {
  form!: FormGroup;
  allPermissions: Permission[] = [];

  constructor(
    public dialogRef: MatDialogRef<RoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Role,
    private fb: FormBuilder,
    private roleService: RolePermissionService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nom: [this.data?.nom || ''],
      societe: [this.data?.societe || ''],
      permissions: [this.data?.permissions || []]
    });

    this.roleService.getPermissions().subscribe((perms: Permission[]) => {
      this.allPermissions = perms;
    });
  }

  submit(): void {
    const value = this.form.value;

    if (this.data?._id) {
      this.roleService.updateRole(this.data._id, value).subscribe(() => {
        this.dialogRef.close(true);
      });
    } else {
      this.roleService.addRole(value).subscribe(() => {
        this.dialogRef.close(true);
      });
    }
  }
}
