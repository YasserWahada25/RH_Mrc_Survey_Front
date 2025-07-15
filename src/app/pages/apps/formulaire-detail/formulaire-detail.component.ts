import { Component, OnInit }         from '@angular/core';
import { ActivatedRoute }            from '@angular/router';
import { CommonModule }              from '@angular/common';
import { FormsModule }               from '@angular/forms';
import { MatCardModule }             from '@angular/material/card';
import { MatDividerModule }          from '@angular/material/divider';
import { MatFormFieldModule }        from '@angular/material/form-field';
import { MatInputModule }            from '@angular/material/input';
import { MatCheckboxModule }         from '@angular/material/checkbox';
import { MatRadioModule }            from '@angular/material/radio';
import { MatButtonModule }           from '@angular/material/button';
import { MatIconModule }             from '@angular/material/icon';
import { MatButtonToggleModule }     from '@angular/material/button-toggle';

import { FormulaireService }         from 'src/app/services/formulaire.service';
import { SectionService }            from 'src/app/services/section.service';
import { QuestionService }           from 'src/app/services/question.service';
import { forkJoin, of }              from 'rxjs';
import { switchMap, map }            from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { UserSelectDialogComponent } from './user-select-dialog/user-select-dialog.component';
import { FormEmailService } from 'src/app/services/form-email.service';

@Component({
  selector: 'app-formulaire-detail',
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
    MatIconModule,
    MatButtonToggleModule
  ],
  templateUrl: './formulaire-detail.component.html',
  styleUrls: ['./formulaire-detail.component.scss']
})
export class FormulaireDetailComponent implements OnInit {
  formData!: any;
  sections: Array<any & { questions: any[] }> = [];
  answers: Record<string, any> = {};

  constructor(
    private route: ActivatedRoute,
    private formSvc: FormulaireService,
    private secSvc: SectionService,
    private qSvc: QuestionService,
    private dialog: MatDialog,
    private emailSvc: FormEmailService
  ) {}

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id')!;
        return this.formSvc.getById(id);
      }),
      switchMap(form => {
        this.formData = form;
        return this.secSvc.findByFormulaire(form._id!);
      }),
      switchMap(secs => {
        if (!secs.length) return of([]);
        return forkJoin(
          secs.map(sec =>
            this.qSvc.findBySection(sec._id!).pipe(
              map(qs => ({ ...sec, questions: qs }))
            )
          )
        );
      })
    ).subscribe(secs => {
      this.sections = secs;
      this.initAnswers();
    });
  }

  private initAnswers() {
    this.sections.forEach(sec =>
      sec.questions.forEach((q: any) => {
        if (q.inputType === 'case_a_cocher') {
          this.answers[q._id] = [];
        } else if (q.inputType === 'evaluation') {
          this.answers[q._id] = Array(q.options.length).fill(null);
        } else {
          this.answers[q._id] = null;
        }
      })
    );
  }

  /** Gère les changments de case à cocher */
  onCheckboxChange(questionId: string, label: string, checked: boolean) {
    const arr: string[] = this.answers[questionId] || [];
    if (checked) {
      if (!arr.includes(label)) arr.push(label);
    } else {
      const idx = arr.indexOf(label);
      if (idx > -1) arr.splice(idx, 1);
    }
    this.answers[questionId] = arr;
  }

openMailDialog(): void {
  const ref = this.dialog.open(UserSelectDialogComponent, {
    width: '400px',
    data: { formId: this.formData._id }
  });

  ref.afterClosed().subscribe((userId: string) => {
    if (userId) {
      this.emailSvc.sendFormEmail(this.formData._id, userId)
        .subscribe({
          next: () => alert('Email envoyé !'),
          error: err => alert('Erreur envoi e-mail : ' + err.message)
        });
    }
  });
}
}
