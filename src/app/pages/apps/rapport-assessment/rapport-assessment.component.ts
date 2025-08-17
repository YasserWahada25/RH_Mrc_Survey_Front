import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { lastValueFrom } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  Assessment,
  AssessmentService,
  GroupedResponseRow,
} from 'src/app/services/assessment.service';

type TypeAssessment = 'normal' | 'avant_apres';

@Component({
  selector: 'app-rapport-assessment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgApexchartsModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './rapport-assessment.component.html',
  styleUrls: ['./rapport-assessment.component.scss'],
})
export class RapportAssessmentComponent implements OnInit {
  // Sélections
  typeSelected: '' | TypeAssessment = '';
  assessmentsAll: Assessment[] = [];
  assessmentsFiltered: Assessment[] = [];
  assessmentIdSelected = '';

  // États
  loadingAssessments = false;
  loadingStats = false;
  errorMsg = '';

  // Données de base
  assessment?: Assessment;
  respondents: GroupedResponseRow[] = [];

  // KPIs
  kpiParticipants = 0;
  kpiCompleted = 0; // normal: >=1 ; avant_apres: ==2
  kpiAvgNormalPct = 0; // pour type normal
  kpiAvgAvantPct = 0; // pour type 2 phases
  kpiAvgApresPct = 0;

  // Charts options (any pour simplifier)
  donutDistributionOpts: any = null; // Distribution des % (normal) / amélioration (2 phases)
  barAvantApresAvgOpts: any = null; // Moyennes avant vs après
  pieCorrectWrongOpts: any = null; // Global correct / incorrect

  constructor(private svc: AssessmentService) {}

  ngOnInit(): void {
    this.loadAssessments();
  }

  // Charger tous les assessments et laisser l'utilisateur filtrer par type
  loadAssessments() {
    this.loadingAssessments = true;
    this.svc.findAll().subscribe({
      next: (list) => {
        this.assessmentsAll = list || [];
        this.loadingAssessments = false;
        this.applyTypeFilter();
      },
      error: (err) => {
        this.loadingAssessments = false;
        this.errorMsg = err?.message || 'Erreur chargement assessments';
      },
    });
  }

  // Appliquer le filtre sur le type
  applyTypeFilter() {
    if (!this.typeSelected) {
      this.assessmentsFiltered = [];
      this.assessmentIdSelected = '';
      this.assessment = undefined;
      return;
    }
    this.assessmentsFiltered = this.assessmentsAll.filter(
      (a) => a.type === this.typeSelected
    );
    // reset sélection assessment
    this.assessmentIdSelected = '';
    this.assessment = undefined;
  }

  // Quand l'assessment change, recharger les stats
  onAssessmentChange() {
    this.errorMsg = '';
    if (!this.assessmentIdSelected) {
      this.assessment = undefined;
      return;
    }
    this.assessment = this.assessmentsAll.find(
      (a) => a._id === this.assessmentIdSelected
    );
    if (!this.assessment) return;
    this.computeStats();
  }

  // ----- Calculs principaux -----
  // On part de grouped-responses (liste des répondants),
  // puis pour chaque user on charge ses réponses et on calcule les scores localement.

  computeStats() {
    if (!this.assessment) return;
    this.loadingStats = true;
    this.kpiParticipants = 0;
    this.kpiCompleted = 0;
    this.kpiAvgNormalPct = 0;
    this.kpiAvgAvantPct = 0;
    this.kpiAvgApresPct = 0;

    // 1) récupérer les lignes correspondantes à l'assessment
    this.svc.getGroupedResponses().subscribe({
      next: (rows) => {
        this.respondents = rows.filter(
          (r) => r.assessmentId === this.assessment!._id
        );
        this.kpiParticipants = this.respondents.length;

        // Completed:
        if (this.assessment!.type === 'normal') {
          this.kpiCompleted = this.respondents.filter(
            (r) => r.phaseCount >= 1
          ).length;
        } else {
          this.kpiCompleted = this.respondents.filter(
            (r) => r.phaseCount === 2
          ).length;
        }

        // 2) charger toutes les réponses de tous les users -> calcul local
        const tasks = this.assessment!.tasks || [];
        const maxScore =
          tasks.reduce((s: number, t: any) => s + (Number(t?.score) || 0), 0) ||
          0;

        // Conso mémoire/light : on itère en série (simple) ou en parallèle (plus rapide).
        // Ici on fait en parallèle :
        const perUserPromises = this.respondents.map(async (r) => {
          const list = await lastValueFrom(
            this.svc.findResponses(this.assessment!._id, r.userId)
          );
          return { row: r, responses: list || [] };
        });

        Promise.all(perUserPromises)
          .then((userRespList) => {
            // Aggregats
            let sumNormalPct = 0;
            let countNormal = 0;

            let sumAvantPct = 0;
            let countAvant = 0;
            let sumApresPct = 0;
            let countApres = 0;

            let totalCorrect = 0;
            let totalWrong = 0;

            // pour "normal" : distribution des pourcentages (4 classes)
            const bins = [0, 0, 0, 0]; // [0-25[, [25-50[, [50-75[, [75-100]
            // pour "avant_apres" : amélioration
            let improved = 0,
              same = 0,
              worse = 0;

            const isCorrect = (resp: any, task: any): boolean => {
              if (!resp) return false;
              const ans = resp.answers?.find(
                (a: any) =>
                  a.taskId == task._id ||
                  a.taskId?.toString() == task._id?.toString()
              );
              if (!ans) return false;
              const sel = (ans.selected || '').toString();
              return task.options?.some(
                (o: any) => o.isCorrect && o._id?.toString() === sel
              );
            };

            const totalCorrectWrongForResp = (resp: any) => {
              let c = 0,
                w = 0;
              for (const t of tasks) {
                if (isCorrect(resp, t)) c++;
                else w++;
              }
              return { c, w };
            };

            const pctForResp = (resp: any) => {
              if (!maxScore) return 0;
              const score = tasks.reduce(
                (s: number, t: any) =>
                  s + (isCorrect(resp, t) ? Number(t.score) || 0 : 0),
                0
              );
              return Math.round((score / maxScore) * 100);
            };

            for (const { responses } of userRespList) {
              if (this.assessment!.type === 'normal') {
                const respNormal = responses.find(
                  (r: any) => r.phase === 'normal'
                );
                if (respNormal) {
                  const { c, w } = totalCorrectWrongForResp(respNormal);
                  totalCorrect += c;
                  totalWrong += w;

                  const pct = pctForResp(respNormal);
                  sumNormalPct += pct;
                  countNormal++;

                  // bins
                  if (pct < 25) bins[0]++;
                  else if (pct < 50) bins[1]++;
                  else if (pct < 75) bins[2]++;
                  else bins[3]++;
                }
              } else {
                const respAvant = responses.find(
                  (r: any) => r.phase === 'avant'
                );
                const respApres = responses.find(
                  (r: any) => r.phase === 'apres'
                );

                if (respAvant) {
                  const { c, w } = totalCorrectWrongForResp(respAvant);
                  totalCorrect += c;
                  totalWrong += w;
                  const pctA = pctForResp(respAvant);
                  sumAvantPct += pctA;
                  countAvant++;
                }
                if (respApres) {
                  const { c, w } = totalCorrectWrongForResp(respApres);
                  totalCorrect += c;
                  totalWrong += w;
                  const pctB = pctForResp(respApres);
                  sumApresPct += pctB;
                  countApres++;
                }

                if (respAvant && respApres) {
                  const pA = pctForResp(respAvant);
                  const pB = pctForResp(respApres);
                  if (pB > pA) improved++;
                  else if (pB === pA) same++;
                  else worse++;
                }
              }
            }

            // KPIs finaux
            if (this.assessment!.type === 'normal') {
              this.kpiAvgNormalPct = countNormal
                ? Math.round(sumNormalPct / countNormal)
                : 0;
            } else {
              this.kpiAvgAvantPct = countAvant
                ? Math.round(sumAvantPct / countAvant)
                : 0;
              this.kpiAvgApresPct = countApres
                ? Math.round(sumApresPct / countApres)
                : 0;
            }

            // Charts
            if (this.assessment!.type === 'normal') {
              this.donutDistributionOpts = {
                series: bins,
                chart: { type: 'donut', height: 300, toolbar: { show: false } },
                labels: ['0–24%', '25–49%', '50–74%', '75–100%'],
                legend: { position: 'bottom' },
                dataLabels: { enabled: false },
              };
            } else {
              this.barAvantApresAvgOpts = {
                series: [
                  {
                    name: 'Moyenne',
                    data: [this.kpiAvgAvantPct, this.kpiAvgApresPct],
                  },
                ],
                chart: { type: 'bar', height: 320, toolbar: { show: false } },
                plotOptions: { bar: { borderRadius: 6, columnWidth: '40%' } },
                xaxis: { categories: ['Avant', 'Après'] },
                dataLabels: { enabled: false },
                yaxis: { max: 100, tickAmount: 5 },
              };
              this.donutDistributionOpts = {
                series: [improved, same, worse],
                chart: { type: 'donut', height: 300, toolbar: { show: false } },
                labels: ['Amélioré', 'Identique', 'Moins bien'],
                legend: { position: 'bottom' },
                dataLabels: { enabled: false },
              };
            }

            this.pieCorrectWrongOpts = {
              series: [totalCorrect, totalWrong],
              chart: { type: 'pie', height: 300, toolbar: { show: false } },
              labels: ['Correct', 'Incorrect'],
              legend: { position: 'bottom' },
              dataLabels: { enabled: false },
            };

            this.loadingStats = false;
          })
          .catch((err) => {
            this.loadingStats = false;
            this.errorMsg = err?.message || 'Erreur de calcul';
          });
      },
      error: (err) => {
        this.loadingStats = false;
        this.errorMsg = err?.message || 'Erreur grouped-responses';
      },
    });
  }
}
