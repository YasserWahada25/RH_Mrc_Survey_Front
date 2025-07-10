// src/app/pages/apps/formulaire-view/formulaire-view.component.ts
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule }           from '@angular/common';
import { FormsModule }            from '@angular/forms';
import { MatCardModule }          from '@angular/material/card';
import { MatDividerModule }       from '@angular/material/divider';
import { MatFormFieldModule }     from '@angular/material/form-field';
import { MatInputModule }         from '@angular/material/input';
import { MatCheckboxModule }      from '@angular/material/checkbox';
import { MatRadioModule }         from '@angular/material/radio';
import { MatButtonModule }        from '@angular/material/button';
import { MatButtonToggleModule }  from '@angular/material/button-toggle';

import { FormulaireService, Formulaire } from 'src/app/services/formulaire.service';
import { SectionService, Section }       from 'src/app/services/section.service';
import { QuestionService, Question }     from 'src/app/services/question.service';

import { forkJoin, of }      from 'rxjs';
import { switchMap, map }    from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';

export interface ViewDialogData { formulaireId: string; }

@Component({
  selector: 'app-formulaire-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatRadioModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,

  ],
  templateUrl: './formulaire-view.component.html',
  styleUrls: ['./formulaire-view.component.css']
})
export class FormulaireViewComponent implements OnInit {
  formData!: Formulaire;
  sections: (Section & { questions: Question[] })[] = [];
  answers: Record<string, any> = {};

  constructor(
    private dialogRef: MatDialogRef<FormulaireViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ViewDialogData,
    private formSvc: FormulaireService,
    private secSvc: SectionService,
    private qSvc: QuestionService
  ) {}

  ngOnInit() {
    this.formSvc.getById(this.data.formulaireId).pipe(
      switchMap(form => {
        this.formData = form;
        return this.secSvc.findByFormulaire(form._id!);
      }),
      switchMap(secs => {
        if (!secs.length) return of([]);
        const calls = secs.map(sec =>
          this.qSvc.findBySection(sec._id!).pipe(
            map(qs => ({ ...sec, questions: qs }))
          )
        );
        return forkJoin(calls);
      })
    ).subscribe(secs => {
      this.sections = secs;
      this.initAnswers();
    });
  }

  /** Initialise l’objet answers pour chaque question */
  private initAnswers() {
    this.sections.forEach(sec =>
      sec.questions.forEach(q => {
        if (q.inputType === 'case_a_cocher') {
          this.answers[q._id!] = [];
        } else {
          this.answers[q._id!] = null;
        }
      })
    );
  }

  /** Ferme la fenêtre */
  close() {
    this.dialogRef.close();
  }

  /** Met à jour un tableau de réponses pour les checkboxes */
  onCheckboxChange(questionId: string, label: string, checked: boolean) {
    if (!Array.isArray(this.answers[questionId])) {
      this.answers[questionId] = [];
    }
    const arr: string[] = this.answers[questionId];
    if (checked) {
      if (!arr.includes(label)) arr.push(label);
    } else {
      const idx = arr.indexOf(label);
      if (idx > -1) arr.splice(idx, 1);
    }
  }
}
