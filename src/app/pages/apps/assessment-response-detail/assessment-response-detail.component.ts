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

interface Resp {
  phase: 'avant' | 'apres';
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
  assessment!: any;
  responses: Resp[] = [];
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
        const avant = responses.find((r) => r.phase === 'avant');
        if (avant) {
          this.userInfo = {
            firstName: avant.firstName!,
            lastName: avant.lastName!,
            email: avant.email!,
          };
        }
      },
      error: (err) =>
        this.snack.open(`Erreur de chargement : ${err.message}`, 'OK', {
          duration: 5000,
        }),
    });
  }

  isSelected(
    resp: { answers: Answer[] },
    taskId: string,
    optionId: any 
  ): boolean {
    const ans = resp.answers.find(a => a.taskId == taskId || a.taskId?.toString() == taskId?.toString());
    const result = !!ans && ans.selected?.toString() === optionId?.toString();
    console.log('isSelected:', { taskId, optionId, ans, result });
    return result;
  }

  getSelectedOptionId(resp: any, taskId: string) {
    if (!resp) return null;
    const ans = resp.answers.find((a: any) => a.taskId == taskId || a.taskId?.toString() == taskId?.toString());
    return ans ? ans.selected?.toString() : null;
  }

  getPhaseResponse(phase: 'avant' | 'apres') {
    return this.responses.find((r) => r.phase === phase);
  }

  sendResponses() {
  const aid = this.route.snapshot.paramMap.get('assessmentId')!;
  const uid = this.route.snapshot.paramMap.get('userId')!;
  this.svc.sendResponsesPdf(aid, uid).subscribe({
    next: () =>
      this.snack.open('PDF des réponses envoyé par email', 'OK', { duration: 5000 }),
    error: err =>
      this.snack.open(`Erreur envoi PDF : ${err.message}`, 'OK', { duration: 5000 })
  });
}

}
