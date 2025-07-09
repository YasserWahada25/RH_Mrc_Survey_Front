// src/app/pages/apps/formulaire-wizard/formulaire-wizard.component.ts

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
import { MatDividerModule }       from '@angular/material/divider';

import { FormulaireService }      from 'src/app/services/formulaire.service';
import { SectionService }         from 'src/app/services/section.service';
import {
  QuestionService,
  Question,
  Option as OptionModel
} from 'src/app/services/question.service';
import { forkJoin, Observable }   from 'rxjs';

// on conserve QuestionData et SectionData, en utilisant OptionModel pour les options
export interface QuestionData {
  texte: string;
  obligatoire: boolean;
  inputType: string;
  options: OptionModel[];
}

export interface SectionData {
  titre: string;
  questions: QuestionData[];
}

@Component({
  selector: 'app-formulaire-wizard',
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
    MatSelectModule,
    MatDividerModule
  ],
  templateUrl: './formulaire-wizard.component.html',
  styleUrls: ['./formulaire-wizard.component.css']
})
export class FormulaireWizardComponent {
  // Données du formulaire
  localForm = {
    titre: '',
    description: ''
  };

  // Sections, questions et options
  sections: SectionData[] = [];
  inputTypes = ['texte','liste','case_a_cocher','bouton_radio','evaluation','spinner'];

  constructor(
    private dialogRef: MatDialogRef<FormulaireWizardComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private formSvc: FormulaireService,
    private secSvc: SectionService,
    private qSvc: QuestionService
  ) {
    this.addSection();
  }

  addSection(): void {
    this.sections.push({ titre: '', questions: [] });
  }
  removeSection(si: number): void {
    this.sections.splice(si, 1);
  }
  addQuestion(si: number): void {
    this.sections[si].questions.push({
      texte: '',
      obligatoire: false,
      inputType: this.inputTypes[0],
      options: []
    });
  }
  removeQuestion(si: number, qi: number): void {
    this.sections[si].questions.splice(qi, 1);
  }
  addOption(si: number, qi: number): void {
    this.sections[si].questions[qi].options.push({ label: '', score: 0 });
  }
  removeOption(si: number, qi: number, oi: number): void {
    this.sections[si].questions[qi].options.splice(oi, 1);
  }

  finish(): void {
    // 1) Créer le formulaire
    this.formSvc.create({
      titre: this.localForm.titre,
      description: this.localForm.description,
      type: 'quiz 360'
    }).subscribe(form => {
      const formulaireId = form._id;

      // 2) Créer les sections
      forkJoin(
        this.sections.map(sec =>
          this.secSvc.create({ titre: sec.titre, formulaire: formulaireId })
        )
      ).subscribe(createdSecs => {
        // 3) Créer toutes les questions pour chaque section
        const calls: Observable<Question>[] = [];
        createdSecs.forEach((cs, si) => {
          this.sections[si].questions.forEach(q =>
            calls.push(
              this.qSvc.create({
                texte: q.texte,
                obligatoire: q.obligatoire,
                inputType: q.inputType,
                score: 0,
                options: q.options,
                section: cs._id
              })
            )
          );
        });
        forkJoin(calls).subscribe(() => this.dialogRef.close());
      });
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
