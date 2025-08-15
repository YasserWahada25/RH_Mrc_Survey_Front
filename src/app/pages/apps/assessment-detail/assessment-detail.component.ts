// src/app/components/assessment-detail/assessment-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

import { AssessmentService, Invitee } from 'src/app/services/assessment.service';

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
    MatIconModule
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

  // Invitations UI
  inviteesAvant: Invitee[] = [];
  inviteesApres: Invitee[] = [];
  inviteesNormal: Invitee[] = [];
  avantEmailsInput = '';
  apresEmailsInput = '';
  normalEmailsInput = '';

  constructor(
    private route: ActivatedRoute,
    private svc:   AssessmentService,
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
      } else {
        this.loadInvitees();
      }
    });
  }

  private loadInvitees() {
    const id = this.assessment._id;

    if (this.assessment.type === 'normal') {
      this.svc.listInvitees(id, 'normal').subscribe(list => {
        this.inviteesNormal = list;
        const uniq = Array.from(new Set(list.map(x => x.email)));
        this.normalEmailsInput = uniq.join(', ');
      });
      return;
    }

    // avant_apres
    this.svc.listInvitees(id, 'avant').subscribe(list => {
      this.inviteesAvant = list;
      const uniqueEmails = Array.from(new Set(list.map(x => x.email)));
      this.apresEmailsInput = uniqueEmails.join(', ');
    });
    this.svc.listInvitees(id, 'apres').subscribe(list => {
      this.inviteesApres = list;
    });
  }

  private parseEmails(input: string): string[] {
    if (!input) return [];
    const arr = input
      .split(/[\s,;]+/g)
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);
    return Array.from(new Set(arr));
  }

  // --- ENVOIS ADMIN ---
  sendAvantInvites() {
    const emails = this.parseEmails(this.avantEmailsInput);
    if (!emails.length) {
      this.snackBar.open('Ajoutez au moins un email pour la phase AVANT.', 'Fermer', { duration: 3500 });
      return;
    }
    this.svc.inviteByEmail(this.assessment._id, 'avant', emails).subscribe({
      next: () => {
        this.snackBar.open('Invitations AVANT envoyées.', 'Fermer', { duration: 3000 });
        this.avantEmailsInput = '';
        this.loadInvitees();
      },
      error: (err) => {
        const msg = err?.error?.error || 'Erreur lors de l’envoi des invitations AVANT.';
        this.snackBar.open(msg, 'Fermer', { duration: 5000 });
      }
    });
  }

  sendApresInvites() {
    const emails = this.parseEmails(this.apresEmailsInput);
    if (!emails.length) {
      this.snackBar.open('Ajoutez au moins un email pour la phase APRÈS.', 'Fermer', { duration: 3500 });
      return;
    }
    this.svc.inviteByEmail(this.assessment._id, 'apres', emails).subscribe({
      next: () => {
        this.snackBar.open('Invitations APRÈS envoyées.', 'Fermer', { duration: 3000 });
        this.loadInvitees();
      },
      error: (err) => {
        const msg = err?.error?.error || 'Erreur lors de l’envoi des invitations APRÈS.';
        this.snackBar.open(msg, 'Fermer', { duration: 5000 });
      }
    });
  }

  sendNormalInvites() {
    const emails = this.parseEmails(this.normalEmailsInput);
    if (!emails.length) {
      this.snackBar.open('Ajoutez au moins un email (phase unique).', 'Fermer', { duration: 3500 });
      return;
    }
    this.svc.inviteByEmail(this.assessment._id, 'normal', emails).subscribe({
      next: () => {
        this.snackBar.open('Invitations envoyées (phase unique).', 'Fermer', { duration: 3000 });
        this.loadInvitees();
      },
      error: (err) => {
        const msg = err?.error?.error || 'Erreur lors de l’envoi des invitations.';
        this.snackBar.open(msg, 'Fermer', { duration: 5000 });
      }
    });
  }

  initAnswers() {
    this.assessment.tasks?.forEach((t: any) => (this.answers[t._id] = null));
  }

  determinePhase() {
    this.svc.findResponses(this.assessment._id, this.userId).subscribe(list => {
      if (this.assessment.type === 'normal') {
        this.phase = list.length ? 'done' : 'normal';
      } else {
        const donePhases = list.map((r: any) => r.phase);
        if (!donePhases.includes('avant')) this.phase = 'avant';
        else if (!donePhases.includes('apres')) this.phase = 'apres';
        else this.phase = 'done';
      }
      this.disabledForm = this.phase === 'done';
    });
  }

  onSubmit() {
    if (this.disabledForm) return;

    const payload = {
      userId: this.userId,
      phase:  this.phase,
      answers: Object.entries(this.answers).map(([taskId, selected]) => ({ taskId, selected }))
    };

    this.svc.submitResponse(this.assessment._id, payload).subscribe({
      next: () => {
        if (this.assessment.type === 'avant_apres') {
          if (this.phase === 'avant') {
            this.snackBar.open('Merci ! Vous répondrez à la phase APRÈS après la formation.', 'Fermer', { duration: 6000 });
          } else if (this.phase === 'apres') {
            this.snackBar.open('Merci ! Vos réponses APRÈS ont été enregistrées.', 'Fermer', { duration: 6000 });
          }
        } else {
          this.snackBar.open('Merci, votre réponse a été enregistrée.', 'Fermer', { duration: 4000 });
        }
        this.determinePhase();
      },
      error: err => {
        const msg = err.error?.error || 'Erreur lors de l’envoi';
        this.snackBar.open(msg, 'Fermer', { duration: 4000 });
      }
    });
  }
}
