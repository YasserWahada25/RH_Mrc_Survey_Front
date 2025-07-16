// src/app/pages/apps/formulaire-detail/formulaire-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { forkJoin, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

import { FormulaireService } from 'src/app/services/formulaire.service';
import { SectionService }    from 'src/app/services/section.service';
import { QuestionService }   from 'src/app/services/question.service';
import { FormEmailService }  from 'src/app/services/form-email.service';
import { UserSelectDialogComponent } from './user-select-dialog/user-select-dialog.component';
import { ResponseService, ResponseDetailDTO } from 'src/app/services/response.service';

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
  sectionMaxScore:    { [sectionId: string]: number } = {};
  sectionClientScore: { [sectionId: string]: number } = {};
  questionMaxScore:    { [questionId: string]: number } = {};
  questionClientScore: { [questionId: string]: number } = {};
  answers: Record<string, any> = {};
  isGuestView = false;
  isReadOnlyView = false;
  clientScore    = 0;
  formTotalScore = 0;

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
    const formId     = this.route.snapshot.paramMap.get('formId')
                    ?? this.route.snapshot.paramMap.get('id')!;
    const responseId = this.route.snapshot.paramMap.get('responseId');
    const token      = this.route.snapshot.queryParamMap.get('token');

    if (responseId) {
      this.isReadOnlyView = true;
      this.loadResponseView(formId, responseId);
    } else if (token) {
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
      switchMap(secs => secs.length
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
        // 1) Stockage des scores globaux
        this.clientScore    = resp.score;
        this.formTotalScore = resp.totalScore;

        // 2) Chargement des données du formulaire
        this.formData = resp.formulaire;

        // 3) Récupération des sections et de leurs questions
        this.secSvc.findByFormulaire(formId).pipe(
          switchMap(secs => secs.length
            ? forkJoin(secs.map(sec =>
                this.qSvc.findBySection(sec._id!).pipe(
                  map(qs => ({ ...sec, questions: qs }))
                )
              ))
            : of([])
          )
        ).subscribe(secs => {
          // 4) Initialisation des réponses et préremplissage
          this.sections = secs;
          this.initAnswers();
          resp.answers.forEach(a => {
            this.answers[a.questionId] = a.answer;
          });
          // 5) Calcul des scores max et client par section
          this.computeSectionMaxScores();
          this.computeSectionClientScores();

          this.computeQuestionScores();
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

  /** Calcul du score total possible par section */
  private computeSectionMaxScores(): void {
    this.sectionMaxScore = {};
    this.sections.forEach(sec => {
      let sum = 0;
      sec.questions.forEach((q: any) => {
        let max = 0;
        switch (q.inputType) {
          case 'texte':
            max = 0;
            break;
          case 'liste':
          case 'bouton_radio':
            max = Math.max(...q.options.map((o: any) => o.score));
            break;
          case 'case_a_cocher':
            max = q.options.reduce((s: number, o: any) => s + o.score, 0);
            break;
          case 'evaluation':
            max = q.options.length * 5;
            break;
        }
        sum += max;
      });
      this.sectionMaxScore[sec._id] = sum;
    });
  }

  /** Calcul du score obtenu par l’utilisateur par section */
  private computeSectionClientScores(): void {
    this.sectionClientScore = {};
    this.sections.forEach(sec => {
      let sum = 0;
      sec.questions.forEach((q: any) => {
        const ans = this.answers[q._id];
        let actual = 0;
        switch (q.inputType) {
          case 'texte':
            actual = 0;
            break;
          case 'liste':
          case 'bouton_radio':
            const opt = q.options.find((o: any) => o.label === ans);
            actual = opt ? opt.score : 0;
            break;
          case 'case_a_cocher':
            if (Array.isArray(ans)) {
              actual = q.options
                .filter((o: any) => ans.includes(o.label))
                .reduce((s: number, o: any) => s + o.score, 0);
            }
            break;
          case 'evaluation':
            if (Array.isArray(ans)) {
              actual = ans.reduce((s: number, v: any) =>
                typeof v === 'number' ? s + v : s, 0);
            }
            break;
        }
        sum += actual;
      });
      this.sectionClientScore[sec._id] = sum;
    });
  }

  //calcul score par question 
  private computeQuestionScores(): void {
  this.questionMaxScore    = {};
  this.questionClientScore = {};
  this.sections.forEach(sec => {
    sec.questions.forEach((q: any) => {
      let max = 0, actual = 0;
      const ans = this.answers[q._id];

      switch (q.inputType) {
        case 'texte':
          max = actual = 0;
          break;

        case 'liste':
        case 'bouton_radio':
          max = Math.max(...q.options.map((o: any) => o.score));
          const opt = q.options.find((o: any) => o.label === ans);
          actual = opt ? opt.score : 0;
          break;

        case 'case_a_cocher':
          max = q.options.reduce((s: number, o: any) => s + o.score, 0);
          if (Array.isArray(ans)) {
            actual = q.options
              .filter((o: any) => ans.includes(o.label))
              .reduce((s: number, o: any) => s + o.score, 0);
          }
          break;

        case 'evaluation':
          max = q.options.length * 5;
          if (Array.isArray(ans)) {
            actual = ans.reduce(
              (s: number, v: any) => (typeof v === 'number' ? s + v : s),
              0
            );
          }
          break;
      }

      this.questionMaxScore[q._id]    = max;
      this.questionClientScore[q._id] = actual;
    });
  });
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
        this.emailSvc.sendFormEmail(this.formData._id, userId)
          .subscribe({
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
    if (!this.validateMandatory()) {
      return alert('Veuillez répondre à toutes les questions obligatoires.');
    }
    const userId = this.isGuestView ? 'guest' : 'owner';
    const answersArray = Object.entries(this.answers).map(
      ([questionId, answer]) => {
        const sec = this.sections.find(s =>
          s.questions.some((q: any) => q._id === questionId)
        )!;
        return { sectionId: sec._id, questionId, answer };
      }
    );
    this.respSvc.create(this.formData._id, userId, answersArray)
      .subscribe(() => alert('Réponses enregistrées !'));
  }

  /** Validation des questions obligatoires */
  validateMandatory(): boolean {
    return this.sections.every(sec =>
      sec.questions.every((q: any) => {
        if (!q.obligatoire) return true;
        const ans = this.answers[q._id];
        switch (q.inputType) {
          case 'case_a_cocher':
            return Array.isArray(ans) && ans.length > 0;
          case 'evaluation':
            return Array.isArray(ans) && ans.every(v => typeof v === 'number' && v > 0);
          default:
            return ans != null && ans !== '';
        }
      })
    );
  }
}
