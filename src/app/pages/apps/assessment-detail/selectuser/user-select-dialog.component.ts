// src/app/pages/apps/assessment-detail/user-select-dialog.component.ts

import { Component, OnInit }                 from '@angular/core';
import { CommonModule }                      from '@angular/common';
import { FormsModule }                       from '@angular/forms';
import { MatDialogModule, MatDialogRef }     from '@angular/material/dialog';
import { MatRadioModule }                    from '@angular/material/radio';
import { MatButtonModule }                   from '@angular/material/button';

import { UserService }        from 'src/app/services/user.service';

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
})
export class UserSelectDialogComponent implements OnInit {
  users: any[] = [];
  selectedUserId?: string;

  constructor(
    private svc: UserService,
    private dialogRef: MatDialogRef<UserSelectDialogComponent>
  ) {}

  ngOnInit() {
    this.svc.getAllUsers().subscribe(list => this.users = list);
  }

  confirm() {
    this.dialogRef.close(this.selectedUserId);
  }
}
