import { Component, OnInit }              from '@angular/core';
import { CommonModule }                   from '@angular/common';
import { FormsModule }                    from '@angular/forms';
import { MatCardModule }                  from '@angular/material/card';
import { MatRadioModule }                 from '@angular/material/radio';
import { MatButtonModule }                from '@angular/material/button';
import { MatDividerModule }               from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute }                 from '@angular/router';
import { MatFormFieldModule }             from '@angular/material/form-field';
import { MatInputModule }                 from '@angular/material/input';

import { AssessmentService }              from 'src/app/services/assessment.service';

type Phase = 'normal' | 'avant' | 'apres' | 'done';

@Component({
  selector: 'app-assessment-guest',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatRadioModule,
    MatButtonModule,
    MatDividerModule,
    MatSnackBarModule, 
    MatFormFieldModule, 
    MatInputModule     
  ],
  templateUrl: './assessment-guest.component.html',
  styleUrls: ['./assessment-guest.component.css']
})
export class AssessmentGuestComponent implements OnInit {
  assessment: any;
  answers: Record<string, any> = {};
  userId!: string;
  phase!: Phase;
  disabledForm = false;

  firstName = '';
  lastName  = '';
  email     = '';
  readOnlyUser = false;

  constructor(
    private route: ActivatedRoute,
    private svc:   AssessmentService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    const id    = this.route.snapshot.paramMap.get('id')!;
    this.userId = this.route.snapshot.queryParamMap.get('uid')!;

    this.svc.getById(id).subscribe(a => {
      this.assessment = a;
      this.initAnswers();
      this.determinePhaseAndLoadUserInfo();
    });
  }

  initAnswers() {
    this.assessment.tasks.forEach((t: any) => this.answers[t._id] = null);
  }

  determinePhaseAndLoadUserInfo() {
    this.svc.findResponses(this.assessment._id, this.userId)
      .subscribe(list => {
        if (this.assessment.type === 'normal') {
          this.phase = list.length ? 'done' : 'normal';
        } else {
          const done = list.map((r: any) => r.phase as Phase);
          if (!done.includes('avant')) {
            this.phase = 'avant';
          } else if (!done.includes('apres')) {
            this.phase = 'apres';
            // ⚠️ On est en phase "après", il faut charger les infos utilisateur
            this.loadUserInfoFromPhaseAvant();
          } else {
            this.phase = 'done';
          }
        }

        this.disabledForm = (this.phase === 'done');
      });
  }

  loadUserInfoFromPhaseAvant() {
    this.svc.getUserInfo(this.assessment._id, this.userId).subscribe({
      next: (data) => {
        this.firstName = data.firstName;
        this.lastName  = data.lastName;
        this.email     = data.email;
        this.readOnlyUser = true;
      },
      error: (err) => {
        console.warn('❌ Impossible de charger les infos de la phase "avant" :', err);
      }
    });
  }

  onSubmit() {
    if (this.disabledForm) return;

    const oldPhase = this.phase;

    const payload = {
      userId:    this.userId,
      phase:     this.phase,
      firstName: this.firstName,
      lastName:  this.lastName,
      email:     this.email,
      answers: Object.entries(this.answers)
        .map(([taskId, selected]) => ({ taskId, selected }))
    };

    this.svc.submitResponse(this.assessment._id, payload)
      .subscribe(() => {
        this.determinePhaseAndLoadUserInfo();

        if (this.assessment.type !== 'normal') {
          if (oldPhase === 'avant') {
            this.snack.open(
              'Merci pour votre réponse. Vous pourrez répondre une deuxième fois après la formation via ce même lien.',
              'Fermer',
              { duration: 5000 }
            );
          } else if (oldPhase === 'apres') {
            this.snack.open(
              'Merci pour votre temps. Vos réponses ont bien été reçues.',
              'Fermer',
              { duration: 3000 }
            );
          }
        } else {
          this.snack.open(
            'Merci pour votre réponse.',
            'Fermer',
            { duration: 3000 }
          );
        }
      });
  }
}
