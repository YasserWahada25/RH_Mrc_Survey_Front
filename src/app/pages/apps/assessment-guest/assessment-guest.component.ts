import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AssessmentService } from 'src/app/services/assessment.service';

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
    MatInputModule,
  ],
  templateUrl: './assessment-guest.component.html',
  styleUrls: ['./assessment-guest.component.css'],
})
export class AssessmentGuestComponent implements OnInit {
  assessment!: any;
  answers: Record<string, string | null> = {};
  userId!: string;          // reste utilisé (inclus dans l’URL)
  token: string | null = null; // ✅ nouveau : usage unique
  phase!: Phase;
  disabledForm = false;

  firstName = '';
  lastName = '';
  email = '';
  readOnlyUser = false;

  // ⚠️ utilisé dans le template
  adminMode = false;

  constructor(
    private route: ActivatedRoute,
    private svc: AssessmentService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.userId = this.route.snapshot.queryParamMap.get('uid') || ''; // on garde uid
    this.token = this.route.snapshot.queryParamMap.get('token');       // ✅ on lit le token

    if (!this.token) {
      this.snack.open('Lien invalide : token manquant.', 'Fermer', { duration: 6000 });
      this.disabledForm = true;
      return;
    }
    if (!this.userId) {
      // On peut rester strict ici pour garder la compatibilité avec ton backend qui attend userId
      this.snack.open('Lien invalide : utilisateur manquant.', 'Fermer', { duration: 6000 });
      this.disabledForm = true;
      return;
    }

    this.svc.getById(id).subscribe((a) => {
      this.assessment = a;
      this.initAnswers();
      this.determinePhaseAndLoadUserInfo();
    });
  }

  /** Initialise (ou ré-initialise) le map des réponses à null */
  initAnswers() {
    this.answers = {};
    if (this.assessment?.tasks?.length) {
      this.assessment.tasks.forEach((t: any) => (this.answers[t._id] = null));
    }
  }

  /**
   * Détermine si on est en phase avant/après/done
   * et **ré-initialise** les réponses pour chaque nouvelle phase
   */
  determinePhaseAndLoadUserInfo() {
    this.svc.findResponses(this.assessment._id, this.userId).subscribe((list) => {
      const done = list.map((r: any) => r.phase as Phase);

      if (this.assessment.type === 'normal') {
        this.phase = done.length ? 'done' : 'normal';
        if (this.phase === 'normal') this.initAnswers();
      } else {
        if (!done.includes('avant')) {
          this.phase = 'avant';
          this.initAnswers();
        } else if (!done.includes('apres')) {
          this.phase = 'apres';
          this.initAnswers();
          this.loadUserInfoFromPhaseAvant();
        } else {
          this.phase = 'done';
        }
      }

      this.disabledForm = this.phase === 'done';
    });
  }

  loadUserInfoFromPhaseAvant() {
    this.svc.getUserInfo(this.assessment._id, this.userId).subscribe({
      next: (data) => {
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.email = data.email;
        this.readOnlyUser = true;
      },
      error: (err) => {
        console.warn('❌ Impossible de charger les infos de la phase "avant" :', err);
      },
    });
  }

  onSubmit() {
    if (this.disabledForm) return;
    if (!this.token) {
      this.snack.open('Lien invalide : token manquant.', 'Fermer', { duration: 5000 });
      return;
    }

    // On capture la phase au moment de la soumission
    const currentPhase = this.phase;

    const payload = {
      token: this.token, // ✅ indispensable pour usage unique
      userId: this.userId,
      phase: currentPhase,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      answers: Object.entries(this.answers)
        .filter(([_, selected]) => selected !== null && selected !== undefined)
        .map(([taskId, selected]) => ({ taskId, selected })),
    };

    this.svc.submitResponse(this.assessment._id, payload).subscribe({
      next: () => {
        // On met à jour l'état local (et désactive au besoin)
        this.determinePhaseAndLoadUserInfo();
        this.disabledForm = true;

        // Message + fermeture quand l'utilisateur clique sur "OK"
        if (currentPhase === 'avant') {
          const ref = this.snack.open(
            'Votre première réponse a été enregistrée. Vous pourrez répondre après la formation.',
            'OK'
          );
          ref.onAction().subscribe(() => { try { window.close(); } catch {} });
        } else if (currentPhase === 'apres' || currentPhase === 'normal') {
          const ref = this.snack.open('Merci pour vos réponses.', 'OK');
          ref.onAction().subscribe(() => { try { window.close(); } catch {} });
        }
      },
      error: (err) => {
        const msg = (err?.error?.error || err?.message || '').toString();
        // Messages courants côté backend : "Lien déjà utilisé." / "Token invalide." etc.
        this.snack.open(`Soumission impossible: ${msg || 'Erreur inconnue'}`, 'Fermer', { duration: 6000 });
      },
    });
  }
}
