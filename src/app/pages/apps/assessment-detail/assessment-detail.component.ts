// src/app/pages/apps/assessment-detail/assessment-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AssessmentService } from 'src/app/services/assessment.service';
import { EmailListDialogComponent } from './email-dialog/email-list-dialog.component';

type Phase = 'normal' | 'avant' | 'apres' | 'done';

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
    EmailListDialogComponent,
  ],
  templateUrl: './assessment-detail.component.html',
  styleUrls: ['./assessment-detail.component.css'],
})
export class AssessmentDetailComponent implements OnInit {
  assessment: any;
  answers: Record<string, any> = {};
  userId!: string;
  phase!: Phase;
  disabledForm = false;
  adminMode = false;

  // ✅ Liste des destinataires du 1er envoi (phase AVANT)
  inviteesAvant: Array<{
    email: string;
    userId: string;
    used: boolean;
    hasAvant: boolean;
    hasApres: boolean;
    sentAt?: string;
  }> = [];
  loadingInvitees = false;

  constructor(
    private route: ActivatedRoute,
    private svc: AssessmentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.userId = this.route.snapshot.queryParamMap.get('uid') || '';
    this.adminMode = !this.userId;

    this.svc.getById(id).subscribe((a) => {
      this.assessment = a;
      this.initAnswers();

      if (this.adminMode) {
        this.reloadInviteesAvant(); // 👈 charge la liste pour la phase après
      } else {
        this.determinePhase();
      }
    });
  }

  initAnswers() {
    if (!this.assessment?.tasks) return;
    this.answers = {};
    this.assessment.tasks.forEach((t: any) => (this.answers[t._id] = null));
  }

  determinePhase() {
    this.svc
      .findResponses(this.assessment._id, this.userId)
      .subscribe((list) => {
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

  // ======== ADMIN : gestion des invitations ========

  /** Charge la liste des destinataires de la phase AVANT + statut (✅ si répondu) */
  reloadInviteesAvant() {
    if (!this.assessment?._id || this.assessment.type !== 'avant_apres') return;
    this.loadingInvitees = true;
    this.svc.listInvitees(this.assessment._id, 'avant').subscribe({
      next: (list) => {
        this.inviteesAvant = (list || []).map((x: any) => ({
          email: x.email,
          userId: x.userId,
          used: !!x.used,
          hasAvant: !!x.hasAvant,
          hasApres: !!x.hasApres,
          sentAt: x.sentAt,
        }));
        this.loadingInvitees = false;
      },
      error: () => {
        this.loadingInvitees = false;
        this.snackBar.open('Impossible de charger les destinataires (phase AVANT).', 'Fermer', {
          duration: 4000,
        });
      },
    });
  }

  /** Envoi invitations phase AVANT (dialog vide) */
  sendPhaseAvant() {
    const ref = this.dialog.open(EmailListDialogComponent, {
      width: '520px',
      data: { preset: [] }, // bloc vide au 1er envoi
    });

    ref.afterClosed().subscribe((result: { emails: string[] } | undefined) => {
      if (!result?.emails?.length) return;
      this.svc.inviteByEmail(this.assessment._id, 'avant', result.emails).subscribe({
        next: () => {
          this.snackBar.open('Invitations (phase AVANT) envoyées.', 'Fermer', { duration: 4000 });
          this.reloadInviteesAvant(); // on recharge pour afficher la liste et les ✅ au fur et à mesure
        },
        error: (err) => {
          const msg = err?.error?.error || 'Erreur lors de l’envoi (phase AVANT).';
          this.snackBar.open(msg, 'Fermer', { duration: 5000 });
        },
      });
    });
  }

  /** Envoi invitations phase APRÈS aux mêmes emails que la phase AVANT */
  sendPhaseApres() {
    if (!this.inviteesAvant.length) {
      this.snackBar.open('Aucun destinataire (phase AVANT) à réinviter.', 'Fermer', { duration: 4000 });
      return;
    }
    const emails = this.inviteesAvant.map((x) => x.email);

    // tu peux ouvrir le dialog si tu veux permettre de retirer/ajouter des emails :
    // const ref = this.dialog.open(EmailListDialogComponent, { width:'520px', data: { preset: emails }});
    // ref.afterClosed()...
    // Pour rester simple : on renvoie à tous les emails du 1er envoi.
    this.svc.inviteByEmail(this.assessment._id, 'apres', emails).subscribe({
      next: () => {
        this.snackBar.open('Invitations (phase APRÈS) envoyées.', 'Fermer', { duration: 4000 });
        // Optionnel : tu peux aussi recharger la liste APRÈS si tu crées un affichage dédié
      },
      error: (err) => {
        const msg = err?.error?.error || 'Erreur lors de l’envoi (phase APRÈS).';
        this.snackBar.open(msg, 'Fermer', { duration: 5000 });
      },
    });
  }

  // ======== Utilisateur : soumission ========

  onSubmit() {
    if (this.disabledForm) return;

    const payload = {
      userId: this.userId,
      phase: this.phase,
      answers: Object.entries(this.answers).map(([taskId, selected]) => ({
        taskId,
        selected, // ⚠️ doit être l'ID de l'option
      })),
    };

    this.svc.submitResponse(this.assessment._id, payload).subscribe({
      next: () => {
        if (this.assessment.type === 'avant_apres') {
          if (this.phase === 'avant') {
            this.snackBar.open(
              'Merci pour votre réponse ! Vous recevrez un 2e lien après la formation.',
              'Fermer',
              { duration: 6000 }
            );
          } else if (this.phase === 'apres') {
            this.snackBar.open('Merci pour votre temps ! Vos réponses sont bien reçues.', 'Fermer', {
              duration: 6000,
            });
          }
        } else {
          this.snackBar.open('Merci pour votre réponse ! Votre soumission est enregistrée.', 'Fermer', {
            duration: 4000,
          });
        }
        this.determinePhase();
      },
      error: (err) => {
        const msg = err.error?.error || 'Erreur lors de l’envoi';
        this.snackBar.open(msg, 'Fermer', { duration: 4000 });
      },
    });
  }
}
