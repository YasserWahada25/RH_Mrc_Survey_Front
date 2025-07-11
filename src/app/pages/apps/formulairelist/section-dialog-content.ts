// src/app/pages/apps/formulairelist/section-dialog-content.ts

import { Component, Inject, Optional } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule
} from '@angular/material/dialog';
import { CommonModule }           from '@angular/common';
import { FormsModule }            from '@angular/forms';
import { MatFormFieldModule }     from '@angular/material/form-field';
import { MatInputModule }         from '@angular/material/input';
import { MatButtonModule }        from '@angular/material/button';
import { MatIconModule }          from '@angular/material/icon';
import { MatCheckboxModule }      from '@angular/material/checkbox';
import { MatSelectModule }        from '@angular/material/select';

import { SectionService }         from 'src/app/services/section.service';
import { QuestionService }        from 'src/app/services/question.service';
import { forkJoin }               from 'rxjs';

export interface Option {
  label: string;
  score: number;
}

export interface QuestionData {
  texte: string;
  obligatoire: boolean;
  inputType: string;
  options: Option[];
}

@Component({
  selector: 'app-section-dialog-content',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule
  ],
  templateUrl: './section-dialog-content.html',
  styleUrls: ['./section-dialog-content.css']
})
export class SectionDialogContentComponent {
  localSection = { titre: '' };
  questions: QuestionData[] = [];
  inputTypes = ['texte','liste','case_a_cocher','bouton_radio','evaluation'];

  constructor(
    private dialogRef: MatDialogRef<SectionDialogContentComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { formulaireId: string },
    private secSvc: SectionService,
    private qSvc: QuestionService
  ) {}

  addQuestion(): void {
    this.questions.push({
      texte: '',
      obligatoire: false,
      inputType: this.inputTypes[0],
      options: []
    });
  }

  removeQuestion(i: number): void {
    this.questions.splice(i, 1);
  }

  addOption(q: QuestionData): void {
    q.options.push({ label: '', score: 1 });
  }

  removeOption(q: QuestionData, oi: number): void {
    q.options.splice(oi, 1);
  }

  finish(): void {
    this.secSvc
      .create({ titre: this.localSection.titre, formulaire: this.data.formulaireId })
      .subscribe(section => {
        const calls = this.questions.map(q =>
          this.qSvc.create({
            texte: q.texte,
            obligatoire: q.obligatoire,
            inputType: q.inputType,
            score: 0,
            options: q.options,
            section: section._id
          })
        );
        forkJoin(calls).subscribe(() => this.dialogRef.close());
      });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
