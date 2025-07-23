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


interface Option { text: string; score: number; }
interface Task   { description: string; options: Option[]; }

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
    
  ],
  templateUrl: './assessment-wizard-dialog.component.html',
  styles: []
})
export class AssessmentWizardDialogComponent {
  // On renomme titre → name, questions → tasks, label → text, et on ajoute type
  local = {
    name:  '',
    type:  '' as 'normal' | 'avant_apres',
    tasks: [] as Task[]
  };

  // Liste des deux types possibles
  types: Array<'normal'|'avant_apres'> = ['normal', 'avant_apres'];

  constructor(
    private dialogRef: MatDialogRef<AssessmentWizardDialogComponent>
  ) {}

  addTask() {
    this.local.tasks.push({
      description: '',
      options: [{ text: '', score: 1 }]
    });
  }

  removeTask(i: number) {
    this.local.tasks.splice(i, 1);
  }

  addOption(taskIdx: number) {
    this.local.tasks[taskIdx].options.push({ text: '', score: 1 });
  }

  removeOption(taskIdx: number, optIdx: number) {
    this.local.tasks[taskIdx].options.splice(optIdx, 1);
  }

  finish() {
    // renvoie l’objet avec name/type/tasks/options/score
    this.dialogRef.close(this.local);
  }

  cancel() {
    this.dialogRef.close();
  }
}
