// src/app/pages/apps/assessment-detail/assessment-detail.component.ts

import { Component, OnInit }        from '@angular/core';
import { CommonModule }             from '@angular/common';
import { FormsModule }              from '@angular/forms';
import { MatCardModule }            from '@angular/material/card';
import { MatRadioModule }           from '@angular/material/radio';
import { MatButtonModule }          from '@angular/material/button';
import { MatDividerModule }         from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ActivatedRoute }           from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AssessmentService }        from 'src/app/services/assessment.service';
import { UserSelectDialogComponent } from './selectuser/user-select-dialog.component';

type Phase = 'normal'|'avant'|'apres'|'done';

@Component({
  selector: 'app-assessment-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatRadioModule,
    MatButtonModule,
    MatDividerModule,
    MatDialogModule,
     MatSnackBarModule,   
    UserSelectDialogComponent
  ],
  templateUrl: './assessment-detail.component.html',
  styleUrls: ['./assessment-detail.component.css']
})
export class AssessmentDetailComponent implements OnInit {
  assessment: any;
  answers: Record<string, any> = {};
  userId!: string;
  phase!: Phase;
  disabledForm = false;
  adminMode = false;

  constructor(
    private route: ActivatedRoute,
    private svc:   AssessmentService,
    private dialog: MatDialog, 
    private snackBar: MatSnackBar 
  ) {}

  ngOnInit() {
    const id    = this.route.snapshot.paramMap.get('id')!;
    this.userId = this.route.snapshot.queryParamMap.get('uid') || '';
    this.adminMode = !this.userId;

    this.svc.getById(id).subscribe(a => {
      this.assessment = a;
      this.initAnswers();
      if (!this.adminMode) {
        this.determinePhase();
      }
    });
  }

  initAnswers() {
    this.assessment.tasks.forEach((t: any) => {
      this.answers[t._id] = null;
    });
  }

  determinePhase() {
    this.svc.findResponses(this.assessment._id, this.userId)
      .subscribe(list => {
        if (this.assessment.type === 'normal') {
          this.phase = list.length ? 'done' : 'normal';
        } else {
          const donePhases = list.map(r => r.phase);
          if (!donePhases.includes('avant')) this.phase = 'avant';
          else if (!donePhases.includes('apres')) this.phase = 'apres';
          else this.phase = 'done';
        }
        this.disabledForm = this.phase === 'done';
      });
  }

  sendByEmail() {
    this.dialog.open(UserSelectDialogComponent, { width: '400px' })
      .afterClosed()
      .subscribe(userId => {
        if (!userId) return;
        this.svc.sendByEmail(this.assessment._id, userId).subscribe();
      });
  }

  // onSubmit() {
  //   if (this.disabledForm) return;
  //   const payload = {
  //     userId: this.userId,
  //     phase:  this.phase,
  //     answers: Object.entries(this.answers)
  //       .map(([taskId, selected]) => ({ taskId, selected }))
  //   };
  //   this.svc.submitResponse(this.assessment._id, payload)
  //     .subscribe(() => this.determinePhase());
  // }
   onSubmit() {
    if (this.disabledForm) return;

    const payload = {
      userId: this.userId,
      phase:  this.phase,
      answers: Object.entries(this.answers)
        .map(([taskId, selected]) => ({ taskId, selected }))
    };

    this.svc.submitResponse(this.assessment._id, payload)
      .subscribe({
        next: () => {
          // 1) Affiche le message adapté
          if (this.assessment.type === 'avant_apres') {
            if (this.phase === 'avant') {
              this.snackBar.open(
                'Merci pour votre réponse ! Vous avez une deuxième chance de répondre via ce même lien.',
                'Fermer',
                { duration: 6000 }
              );
            } else if (this.phase === 'apres') {
              this.snackBar.open(
                'Merci pour votre temps ! Vos réponses sont bien reçues.',
                'Fermer',
                { duration: 6000 }
              );
            }
          } else {
            this.snackBar.open(
              'Merci pour votre réponse ! Votre soumission est enregistrée.',
              'Fermer',
              { duration: 4000 }
            );
          }

          // 2) On recalcul la phase et désactive si besoin
          this.determinePhase();
        },
        error: err => {
          const msg = err.error?.error || 'Erreur lors de l’envoi';
          this.snackBar.open(msg, 'Fermer', { duration: 4000 });
        }
      });
  }
}
