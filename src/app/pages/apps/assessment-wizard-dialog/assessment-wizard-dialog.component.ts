// src/app/pages/apps/assessment-wizard-dialog/assessment-wizard-dialog.component.ts

import { Component }                     from '@angular/core';
import { CommonModule }                  from '@angular/common';
import { FormsModule }                   from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule }            from '@angular/material/form-field';
import { MatInputModule }                from '@angular/material/input';
import { MatSelectModule }               from '@angular/material/select';
import { MatButtonModule }               from '@angular/material/button';
import { MatIconModule }                 from '@angular/material/icon';
import { MatDividerModule }              from '@angular/material/divider';
import { MatCheckboxModule }             from '@angular/material/checkbox'; // ✅ Ajouté

interface Option {
  text: string;
  score: number;
  isCorrect: boolean; // ✅ Ajouté
}

interface Task {
  description: string;
  options: Option[];
}

@Component({
  selector: 'app-assessment-wizard-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCheckboxModule // ✅ Ajouté
  ],
  templateUrl: './assessment-wizard-dialog.component.html',
  styles: []
})
export class AssessmentWizardDialogComponent {
  local = {
    name: '',
    type: '' as 'normal' | 'avant_apres',
    tasks: [] as Task[],
    startDate: '',
    endDate: ''
  };

  types: Array<'normal' | 'avant_apres'> = ['normal', 'avant_apres'];

  constructor(
    private dialogRef: MatDialogRef<AssessmentWizardDialogComponent>
  ) {}

  addTask() {
    this.local.tasks.push({
      description: '',
      options: [{ text: '', score: 1, isCorrect: false }] // ✅ Ajouté
    });
  }

  removeTask(i: number) {
    this.local.tasks.splice(i, 1);
  }

  addOption(taskIdx: number) {
    this.local.tasks[taskIdx].options.push({ text: '', score: 1, isCorrect: false }); // ✅ Ajouté
  }

  removeOption(taskIdx: number, optIdx: number) {
    this.local.tasks[taskIdx].options.splice(optIdx, 1);
  }

  finish() {
    this.dialogRef.close(this.local);
  }

  cancel() {
    this.dialogRef.close();
  }
}
