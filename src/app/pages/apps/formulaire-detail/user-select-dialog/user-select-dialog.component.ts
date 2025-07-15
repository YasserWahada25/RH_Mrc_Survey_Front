// src/app/pages/apps/formulaire-detail/user-select-dialog/user-select-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule }               from '@angular/common';
import { FormsModule }                from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { MatRadioModule }             from '@angular/material/radio';
import { MatButtonModule }            from '@angular/material/button';
import { FormEmailService, UserDTO }  from 'src/app/services/form-email.service';

@Component({
  selector: 'app-user-select-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatRadioModule,
    MatButtonModule
  ],
  templateUrl: './user-select-dialog.component.html',
  styleUrls: ['./user-select-dialog.component.css']
})
export class UserSelectDialogComponent implements OnInit {
  users: UserDTO[] = [];
  selectedUserId?: string;

  constructor(
    private svc: FormEmailService,
    private dialogRef: MatDialogRef<UserSelectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { formId: string }
  ) {}

  ngOnInit() {
    this.svc.getAllUsers().subscribe({
      next: users => this.users = users,
      error: err => console.error('Erreur getAllUsers:', err)
    });
  }

  confirm() {
    if (this.selectedUserId) {
      this.dialogRef.close(this.selectedUserId);
    }
  }
}
