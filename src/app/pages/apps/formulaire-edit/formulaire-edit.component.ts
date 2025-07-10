import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatButtonModule }    from '@angular/material/button';
import { MatIconModule }      from '@angular/material/icon';
import { MatCheckboxModule }  from '@angular/material/checkbox';
import { MatSelectModule }    from '@angular/material/select';
import { MatCardModule }      from '@angular/material/card';
import { MatDividerModule }   from '@angular/material/divider';

import { forkJoin, of }       from 'rxjs';
import { switchMap, map }     from 'rxjs/operators';

import {
  FormulaireService,
  Formulaire,
} from 'src/app/services/formulaire.service';
import { SectionService, Section }   from 'src/app/services/section.service';
import { QuestionService, Question } from 'src/app/services/question.service';

export interface EditDialogData {
  formulaireId: string;
}

interface SectionData extends Section {
  questions: Question[];
}

@Component({
  selector: 'app-formulaire-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    MatDividerModule,
  ],
  templateUrl: './formulaire-edit.component.html',
})
export class FormulaireEditComponent implements OnInit {
  // champs du formulaire
  formData: Partial<Formulaire> = {
    titre: '',
    description: '',
    type: 'quiz 360',
  };

  // sections + leurs questions
  sections: SectionData[] = [];
  inputTypes = [
    'texte',
    'date',
    'liste',
    'case_a_cocher',
    'bouton_radio',
    'evaluation',
    'spinner',
  ];

  constructor(
    private dialogRef: MatDialogRef<FormulaireEditComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: EditDialogData,
    private formSvc: FormulaireService,
    private secSvc: SectionService,
    private qSvc: QuestionService
  ) {}

 ngOnInit(): void {
    // 1) Charger le formulaire
    this.formSvc.getById(this.data.formulaireId)
      .pipe(
        switchMap(form => {
          this.formData = { ...form };
          // 2) Récupérer les sections liées
          return this.secSvc.findByFormulaire(form._id!);
        }),
        switchMap(secs => {
          if (!secs.length) return of([] as SectionData[]);
          // 3) Pour chaque section, récupérer ses questions
          const observables = secs.map(sec =>
            this.qSvc.findBySection(sec._id!).pipe(
         //     switchMap(qs =>of({ ...sec, questions: qs } as SectionData)  )
              map(qs => ({ ...sec, questions: qs } as SectionData))
            
            )
          );
          return forkJoin(observables);
        })
      )
    //  .subscribe(all => {this.sections = all; });
      .subscribe({
    next: all => this.sections = all,
    error: err => console.error('Erreur chargement sections/questions', err)
  });
  }

  /** Enregistre juste le formulaire lui-même */
  save(): void {
    const id = this.data.formulaireId;
    this.formSvc.update(id, this.formData).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => this.dialogRef.close(false)
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
