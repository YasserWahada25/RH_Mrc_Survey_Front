// src/app/pages/apps/formulaire-detail/formulaire-detail.component.ts

import { Component, OnInit }                    from '@angular/core';
import { ActivatedRoute }                       from '@angular/router';
import { CommonModule }                         from '@angular/common';
import { FormsModule }                          from '@angular/forms';
import { MatCardModule }                        from '@angular/material/card';
import { MatDividerModule }                     from '@angular/material/divider';
import { MatFormFieldModule }                   from '@angular/material/form-field';
import { MatInputModule }                       from '@angular/material/input';
import { MatCheckboxModule }                    from '@angular/material/checkbox';
import { MatRadioModule }                       from '@angular/material/radio';
import { MatButtonModule }                      from '@angular/material/button';
import { MatIconModule }                        from '@angular/material/icon';
import { MatButtonToggleModule }                from '@angular/material/button-toggle';
import { MatDialogModule, MatDialog }           from '@angular/material/dialog';

import { forkJoin, of }                         from 'rxjs';
import { switchMap, map }                       from 'rxjs/operators';

import { FormulaireService }                    from 'src/app/services/formulaire.service';
import { SectionService }                       from 'src/app/services/section.service';
import { QuestionService }                      from 'src/app/services/question.service';
import { FormEmailService }                     from 'src/app/services/form-email.service';
import { UserSelectDialogComponent }            from './user-select-dialog/user-select-dialog.component';
import { ResponseService, ResponseDetailDTO }   from 'src/app/services/response.service';

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
    MatButtonToggleModule,
    MatDialogModule,
    UserSelectDialogComponent
  ],
  templateUrl: './formulaire-detail.component.html',
  styleUrls: ['./formulaire-detail.component.scss']
})
export class FormulaireDetailComponent implements OnInit {
  formData!: any;
  sections: Array<any & { questions: any[] }> = [];
  answers: Record<string, any> = {};
  isGuestView = false;
  isReadOnlyView = false;

  constructor(
    private route: ActivatedRoute,
    private formSvc: FormulaireService,
    private secSvc: SectionService,
    private qSvc: QuestionService,
    private dialog: MatDialog,
    private emailSvc: FormEmailService,
    private respSvc: ResponseService
  ) {}

  ngOnInit(): void {
    const formId = this.route.snapshot.paramMap.get('formId') ?? this.route.snapshot.paramMap.get('id')!;
    const responseId = this.route.snapshot.paramMap.get('responseId');
    const token      = this.route.snapshot.queryParamMap.get('token');

    if (responseId) {
      this.isReadOnlyView = true;
       this.loadResponseView(formId, responseId);
    }
    else if (token) {
      this.isGuestView = true;
      this.loadGuestView(formId, token);
    } else {
      this.loadOwnerView(formId);
    }
  }

  private loadOwnerView(id: string): void {
    this.route.paramMap.pipe(
      switchMap(() => this.formSvc.getById(id)),
      switchMap(form => {
        this.formData = form;
        return this.secSvc.findByFormulaire(id);
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

  private loadGuestView(id: string, token: string): void {
    this.formSvc.getByToken(id, token).subscribe({
      next: ({ form, sections }) => {
        this.formData = form;
        this.sections = sections;
        this.initAnswers();
      },
      error: () => alert('Lien invalide ou expiré')
    });
  }

  private loadResponseView(formId: string, responseId: string): void {
    this.respSvc.getResponse(formId, responseId).subscribe({
      next: (resp: ResponseDetailDTO) => {
        this.formData = resp.formulaire;
        this.secSvc.findByFormulaire(formId).pipe(
          switchMap(secs =>
            secs.length
              ? forkJoin(secs.map(sec =>
                  this.qSvc.findBySection(sec._id!).pipe(
                    map(qs => ({ ...sec, questions: qs }))
                  )
                ))
              : of([])
          )
        ).subscribe(secs => {
          this.sections = secs;
          this.initAnswers();
          resp.answers.forEach(a => {
            this.answers[a.questionId] = a.answer;
          });
        });
      },
      error: () => alert('Réponse introuvable')
    });
  }

  private initAnswers(): void {
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

  onCheckboxChange(questionId: string, label: string, checked: boolean): void {
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
        this.emailSvc.sendFormEmail(this.formData._id, userId).subscribe({
          next: () => alert('Email envoyé !'),
          error: err => alert('Erreur envoi e-mail : ' + err.message)
        });
      }
    });
  }

  openQrScanner(): void {
    alert('Scanner QR non implémenté.');
  }

  submitResponses(): void {
    const userId = this.isGuestView ? 'guest' : 'owner';
    const answersArray = Object.entries(this.answers).map(
      ([questionId, answer]) => {
        const sec = this.sections.find(s =>
          s.questions.some((q: any) => q._id === questionId)
        )!;
        return {
          sectionId: sec._id,
          questionId,
          answer
        };
      }
    );
    this.respSvc.create(this.formData._id, userId, answersArray)
      .subscribe(() => alert('Réponses enregistrées !'));
  }
}
