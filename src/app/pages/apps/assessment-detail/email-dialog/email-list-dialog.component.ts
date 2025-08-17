// src/app/pages/apps/assessment-detail/email-list-dialog.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-email-list-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Envoyer par email</h2>

    <div class="content">
      <mat-form-field appearance="outline" class="w100">
        <mat-label>Adresses email (une par ligne)</mat-label>
        <textarea
          matInput
          rows="10"
          [(ngModel)]="emailsRaw"
          (input)="parseAndValidate()"
          placeholder="exemple1@domaine.com
exemple2@domaine.com"></textarea>
        <div class="hint">
          {{ validCount }} adresse(s) valide(s)
          <ng-container *ngIf="invalidLines.length">
            — {{ invalidLines.length }} ligne(s) invalide(s)
          </ng-container>
        </div>
      </mat-form-field>

      <div *ngIf="invalidLines.length" class="errors">
        <strong>Lignes invalides :</strong>
        <div class="small">
          {{ invalidLines.join(', ') }}
        </div>
      </div>
    </div>

    <div class="actions">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button
        mat-flat-button
        color="primary"
        (click)="onConfirm()"
        [disabled]="!validCount || invalidLines.length > 0"
      >
        Envoyer
      </button>
    </div>
  `,
  styles: [`
    .w100 { width: 100%; }
    .content { padding: 0 24px 8px; }
    .actions { display: flex; justify-content: flex-end; gap: 8px; padding: 8px 24px 16px; }
    .hint { font-size: 12px; color: rgba(0,0,0,.6); margin-top: 4px; }
    .errors { color: #b00020; margin-top: 8px; }
    .small { font-size: 12px; }
  `]
})
export class EmailListDialogComponent {
  emailsRaw = '';
  validCount = 0;
  invalidLines: number[] = [];

  constructor(private dialogRef: MatDialogRef<EmailListDialogComponent>) {}

  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  parseAndValidate(): { emails: string[]; invalid: number[] } {
    const lines = (this.emailsRaw || '')
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const invalid: number[] = [];
    const valid: string[] = [];

    lines.forEach((line, idx) => {
      if (this.emailRegex.test(line)) {
        valid.push(line.toLowerCase());
      } else {
        invalid.push(idx + 1); // numéro de ligne 1-based
      }
    });

    // déduplication
    const unique = Array.from(new Set(valid));

    this.validCount = unique.length;
    this.invalidLines = invalid;

    return { emails: unique, invalid };
  }

  onConfirm() {
    const { emails, invalid } = this.parseAndValidate();
    if (invalid.length) return;
    if (!emails.length) return;
    this.dialogRef.close({ emails });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
