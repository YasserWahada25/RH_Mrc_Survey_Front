// src/app/pages/apps/formulaire-wizard/formulaire-wizard.component.ts

import { Component, OnInit, Inject, Optional } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { CommonModule }               from '@angular/common';
import { FormsModule }                from '@angular/forms';
import { MatFormFieldModule }         from '@angular/material/form-field';
import { MatInputModule }             from '@angular/material/input';
import { MatButtonModule }            from '@angular/material/button';
import { MatIconModule }              from '@angular/material/icon';
import { MatCheckboxModule }          from '@angular/material/checkbox';
import { MatSelectModule }            from '@angular/material/select';
import { MatDividerModule }           from '@angular/material/divider';

import { forkJoin, of, Observable }   from 'rxjs';
import { switchMap, map }             from 'rxjs/operators';

import { FormulaireService }          from 'src/app/services/formulaire.service';
import { SectionService, Section }    from 'src/app/services/section.service';
import {
  QuestionService,
  Question,
  SurveyOption,
} from 'src/app/services/question.service';

export interface QuestionData {
  _id?: string;
  texte: string;
  obligatoire: boolean;
  inputType: string;
  score: number;
  options: SurveyOption[];
}

export interface SectionData {
  _id?: string;
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
    MatDividerModule,
  ],
  templateUrl: './formulaire-wizard.component.html',
  styleUrls: ['./formulaire-wizard.component.css'],
})
export class FormulaireWizardComponent implements OnInit {
  // 1) Titre + description du formulaire
  localForm: { titre: string; description: string } = {
    titre: '',
    description: '',
  };

  // 2) Sections et questions
  sections: SectionData[] = [];
  inputTypes = [
    'texte',
    'liste',
    'case_a_cocher',
    'bouton_radio',
    'evaluation',
    'spinner',
  ];

  constructor(
    private dialogRef: MatDialogRef<FormulaireWizardComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { formulaireId?: string },
    private formSvc: FormulaireService,
    private secSvc: SectionService,
    private qSvc: QuestionService
  ) {}

  ngOnInit(): void {
    if (this.data.formulaireId) {
      // mode Édition : charger tout
      this.formSvc
        .getById(this.data.formulaireId)
        .pipe(
          switchMap(form => {
            this.localForm = {
              titre: form.titre,
              description: form.description || '',
            };
            return this.secSvc.findByFormulaire(form._id!);
          }),
          switchMap((secs: Section[]) => {
            if (!secs.length) return of([] as SectionData[]);
            const secsWithQs$ = secs.map(sec =>
              this.qSvc
                .findBySection(sec._id!)
                .pipe(
                  map((qs: Question[]) => ({
                    _id: sec._id,
                    titre: sec.titre,
                    questions: qs.map(q => ({
                      _id:         q._id,
                      texte:       q.texte,
                      obligatoire: q.obligatoire,
                      inputType:   q.inputType,
                      score:       q.score,
                      options:     q.options,
                    })),
                  } as SectionData))
                )
            );
            return forkJoin(secsWithQs$);
          })
        )
        .subscribe(fullSecs => {
          this.sections = fullSecs;
        });
    } else {
      // mode Création : une section vide
      this.sections = [{ titre: '', questions: [] }];
    }
  }

  // Ajout / suppression dynamiques
  addSection(): void {
    this.sections.push({ titre: '', questions: [] });
  }
  removeSection(si: number): void {
    this.sections.splice(si, 1);
  }
  addQuestion(si: number): void {
    this.sections[si].questions.push({
      texte:       '',
      obligatoire: false,
      inputType:   this.inputTypes[0],
      score:       0,
      options:     [],
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

  // Création ou mise à jour en fonction du mode
   finish(): void {
    const payload = {
      titre:       this.localForm.titre,
      description: this.localForm.description,
      type:        'quiz 360'
    };
    // 1) Crée ou met à jour le formulaire
    const save$ = this.data.formulaireId
      ? this.formSvc.update(this.data.formulaireId, payload)
      : this.formSvc.create(payload);

    save$
      .pipe(
        switchMap(form => {
          const fid = form._id!;
          // 2) sections : on crée ou met à jour
          const secCalls = this.sections.map(secData => {
            const dto = { titre: secData.titre, formulaire: fid };
            return secData._id
              ? this.secSvc.update(secData._id, dto)
              : this.secSvc.create(dto);
          });
          return forkJoin(secCalls) as Observable<Section[]>;
        }),
        switchMap((savedSecs: Section[]) => {
          // 3) questions : pour chaque section rechargée, on reprend l'array this.sections
          const qCalls: Observable<Question>[] = [];
          savedSecs.forEach((secModel, si) => {
            const secData = this.sections[si];
            secData.questions.forEach(qData => {
              const qDto = {
                texte:       qData.texte,
                obligatoire: qData.obligatoire,
                inputType:   qData.inputType,
                score:       qData.score,
                options:     qData.options,
                section:     secModel._id!
              };
              if (qData._id) {
                qCalls.push(this.qSvc.update(qData._id, qDto));
              } else {
                qCalls.push(this.qSvc.create(qDto));
              }
            });
          });
          return forkJoin(qCalls);
        })
      )
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: err => console.error('Échec save wizard', err)
      });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
