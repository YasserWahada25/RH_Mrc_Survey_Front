// src/app/components/assessment-response-detail/assessment-response-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AssessmentService } from 'src/app/services/assessment.service';

interface Answer {
  taskId: string;
  selected: string;
}

// 👇 on inclut 'normal' pour couvrir les assessments à une seule phase
type RespPhase = 'avant' | 'apres' | 'normal';

interface Resp {
  phase: RespPhase;
  answers: Answer[];
  firstName?: string;
  lastName?: string;
  email?: string;
}

@Component({
  selector: 'app-assessment-response-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatRadioModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './assessment-response-detail.component.html',
  styleUrls: ['./assessment-response-detail.component.css'],
})
export class AssessmentResponseDetailComponent implements OnInit {
  assessment!: any;          // contient tasks[], options[], score par task
  responses: Resp[] = [];    // [{ phase:'avant'|'apres'|'normal', answers:[] }]
  userInfo = { firstName: '', lastName: '', email: '' };

  constructor(
    private route: ActivatedRoute,
    private svc: AssessmentService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    const aid = this.route.snapshot.paramMap.get('assessmentId')!;
    const uid = this.route.snapshot.paramMap.get('userId')!;

    forkJoin({
      assessment: this.svc.getById(aid),
      responses: this.svc.findResponses(aid, uid),
    }).subscribe({
      next: ({ assessment, responses }) => {
        this.assessment = assessment;
        this.responses = responses;

        // on prend d'abord 'avant', sinon 'apres', sinon 'normal'
        const first =
          responses.find((r) => r.phase === 'avant') ||
          responses.find((r) => r.phase === 'apres') ||
          responses.find((r) => r.phase === 'normal');

        if (first) {
          this.userInfo = {
            firstName: first.firstName || '',
            lastName:  first.lastName  || '',
            email:     first.email     || '',
          };
        }
      },
      error: (err) =>
        this.snack.open(`Erreur de chargement : ${err.message}`, 'OK', {
          duration: 5000,
        }),
    });
  }

  // ------- Helpers affichage -------
  hasPhase(phase: RespPhase): boolean {
    return !!this.responses.find(r => r.phase === phase);
  }

  // ------- Sélections existantes -------
  isSelected(resp: { answers: Answer[] }, taskId: string, optionId: any): boolean {
    const ans = resp.answers.find(
      (a) => a.taskId == taskId || a.taskId?.toString() == taskId?.toString()
    );
    const result = !!ans && ans.selected?.toString() === optionId?.toString();
    return result;
  }

  getSelectedOptionId(resp: any, taskId: string) {
    if (!resp) return null;
    const ans = resp.answers.find(
      (a: any) => a.taskId == taskId || a.taskId?.toString() == taskId?.toString()
    );
    return ans ? ans.selected?.toString() : null;
  }

  getPhaseResponse(phase: RespPhase) {
    return this.responses.find((r) => r.phase === phase);
  }

  // ------- Calculs Score / Pourcentage -------
  /** Score défini sur la question ; fallback 1 si ancien enregistrement sans score */
  getTaskScore(task: any): number {
    const s = Number(task?.score);
    return Number.isFinite(s) ? s : 1;
  }

  /** La réponse 'resp' est-elle correcte pour 'task' ? */
  private isCorrectForResponse(resp: Resp | undefined, task: any): boolean {
    if (!resp) return false;
    const ans = resp.answers.find(
      (a) => a.taskId == task._id || a.taskId?.toString() == task._id?.toString()
    );
    if (!ans) return false;
    const selected = (ans.selected || '').toString();
    return task.options?.some(
      (o: any) => o.isCorrect && o._id?.toString() === selected
    );
  }

  /** La réponse est-elle correcte pour la phase donnée ? */
  isCorrect(phase: RespPhase, task: any): boolean {
    return this.isCorrectForResponse(this.getPhaseResponse(phase), task);
  }

  /** Score obtenu sur une question pour la phase (score ou 0) */
  getQuestionScore(phase: RespPhase, task: any): number {
    return this.isCorrect(phase, task) ? this.getTaskScore(task) : 0;
  }

  /** Score max total (somme des scores des questions) */
  get maxScore(): number {
    if (!this.assessment?.tasks?.length) return 0;
    return this.assessment.tasks.reduce(
      (sum: number, t: any) => sum + this.getTaskScore(t),
      0
    );
  }

  /** Score total obtenu pour une phase */
  getTotalScore(phase: RespPhase): number {
    if (!this.assessment?.tasks?.length) return 0;
    return this.assessment.tasks.reduce(
      (sum: number, t: any) => sum + this.getQuestionScore(phase, t),
      0
    );
  }

  /** Pourcentage (règle de 3) pour une phase */
  getPercent(phase: RespPhase): number {
    const max = this.maxScore;
    if (max <= 0) return 0;
    const total = this.getTotalScore(phase);
    return Math.round((total / max) * 100);
  }

  // ------- Envoi PDF -------
  sendResponses() {
    const aid = this.route.snapshot.paramMap.get('assessmentId')!;
    const uid = this.route.snapshot.paramMap.get('userId')!;
    this.svc.sendResponsesPdf(aid, uid).subscribe({
      next: () =>
        this.snack.open('PDF des réponses envoyé par email', 'OK', {
          duration: 5000,
        }),
      error: (err) =>
        this.snack.open(`Erreur envoi PDF : ${err.message}`, 'OK', {
          duration: 5000,
        }),
    });
  }
}
