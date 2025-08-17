import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';

interface Option {
  text: string;
  isCorrect: boolean;
}
interface Task {
  description: string;
  options: Option[];
  score: number;
}

@Component({
  selector: 'app-assessment-wizard-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'fr-FR' }],
  templateUrl: './assessment-wizard-dialog.component.html',
  styles: [],
})
export class AssessmentWizardDialogComponent {
  local = {
    name: '',
    type: '' as 'normal' | 'avant_apres',
    tasks: [] as Task[],
    startDate: null as Date | null,
    endDate: null as Date | null,
    company: '',
    trainerName: '',
  };

  types: Array<'normal' | 'avant_apres'> = ['normal', 'avant_apres'];

  // Aujourd’hui à minuit (pour [min] et comparaisons)
  readonly today: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  constructor(
    private dialogRef: MatDialogRef<AssessmentWizardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: { assessment?: any }
  ) {
    // Préremplissage en mode ÉDITION
    if (data?.assessment) {
      const a = data.assessment;
      this.local = {
        name: a.name || '',
        type: (a.type || 'normal') as 'normal' | 'avant_apres',
        tasks: (a.tasks || []).map((t: any) => ({
          description: t.description,
          score: typeof t.score === 'number' ? t.score : 1,
          options: (t.options || []).map((o: any) => ({
            text: o.text,
            isCorrect: !!o.isCorrect,
          })),
        })),
        startDate: a.startDate ? new Date(a.startDate) : null,
        endDate: a.endDate ? new Date(a.endDate) : null,
        company: a.company || '',
        trainerName: a.trainerName || '',
      };
    }
  }

  get dialogTitle() {
    return this.data?.assessment ? 'Modifier un assessment' : 'Créer un assessment';
  }
  get primaryLabel() {
    return this.data?.assessment ? 'Mettre à jour' : 'Enregistrer';
  }

  private atMidnight(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  get minEndDate(): Date {
    return this.local.startDate ? this.atMidnight(this.local.startDate) : this.today;
  }

  // validation bouton Enregistrer (dates seulement pour avant_apres)
  get areDatesValid(): boolean {
    if (this.local.type !== 'avant_apres') return true;
    const s = this.local.startDate ? this.atMidnight(this.local.startDate) : null;
    const e = this.local.endDate ? this.atMidnight(this.local.endDate) : null;
    if (!s || !e) return false;
    return s >= this.today && e >= s;
  }

  // erreurs affichées
  get startBeforeToday(): boolean {
    const s = this.local.startDate;
    return !!s && this.atMidnight(s) < this.today;
  }
  get endBeforeStart(): boolean {
    const s = this.local.startDate;
    const e = this.local.endDate;
    return !!e && !!s && this.atMidnight(e) < this.atMidnight(s);
  }

  onTypeChange() {
    if (this.local.type === 'avant_apres' && !this.local.startDate) {
      this.local.startDate = new Date(this.today);
    }
    if (this.local.type !== 'avant_apres') {
      this.local.startDate = null;
      this.local.endDate = null;
    }
  }

  addTask() {
    this.local.tasks.push({
      description: '',
      options: [{ text: '', isCorrect: false }],
      score: 1,
    });
  }
  removeTask(i: number) {
    this.local.tasks.splice(i, 1);
  }
  addOption(taskIdx: number) {
    this.local.tasks[taskIdx].options.push({ text: '', isCorrect: false });
  }
  removeOption(taskIdx: number, optIdx: number) {
    this.local.tasks[taskIdx].options.splice(optIdx, 1);
  }

  finish() {
    this.dialogRef.close(this.local);
  }
  cancel() {
    this.dialogRef.close();
  }
}
