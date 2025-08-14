import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { NgApexchartsModule, ChartComponent } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexTooltip,
  ApexDataLabels,
  ApexPlotOptions,
  ApexLegend
} from 'ng-apexcharts';

import { QuizDiscPublicService, BeneficiaireInfo } from 'src/app/services/quiz-disc-public.service';
import { QuizService } from 'src/app/services/quiz.service';
import { Lot } from 'src/app/models/quiz.model';

type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  colors?: string[];
  legend?: ApexLegend;
};

type DataURIResult = { imgURI?: string; blob?: Blob };

@Component({
  selector: 'app-quiz-disc-public',
  styleUrls: ['./quiz-disc-public.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressBarModule,
    NgApexchartsModule
  ],
  templateUrl: './quiz-disc-public.component.html',
})
export class QuizDiscPublicComponent implements OnInit {
  token = '';
  beneficiaireEmail = '';
  beneficiaireNom = '';
  beneficiairePrenom = '';
  beneficiaireSociete = '';
  beneficiaireAge: number | null = null;
  beneficiaireMessage = '';

  lots: Lot[] = [];
  answers: { plusIndex: number | null; minusIndex: number | null }[] = [];
  isInvalidLink = false;
  errorMessage = '';
  quizSubmitted = false;

  currentLotIndex = 0;

  // ✅ Hôte d’export (charts invisibles à l’écran)
  expChartsVisible = false;
  plusChartExp?: ChartOptions;
  minusChartExp?: ChartOptions;
  diffChartExp?: ChartOptions;
  @ViewChild('plusExp',  { static: false }) plusExpRef!: ChartComponent;
  @ViewChild('minusExp', { static: false }) minusExpRef!: ChartComponent;
  @ViewChild('diffExp',  { static: false }) diffExpRef!: ChartComponent;

  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService,
    private publicService: QuizDiscPublicService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';

    this.publicService.getBeneficiaireInfo(this.token).subscribe({
      next: (data: BeneficiaireInfo | any) => {
        if (data?.status === 'used') {
          this.isInvalidLink = true;
          this.errorMessage = data.message || 'Ce lien a déjà été utilisé ou est invalide.';
          return;
        }

        // mapping infos bénéficiaire
        this.beneficiaireEmail = data.email || '';
        this.beneficiaireNom = data.nom || '';
        this.beneficiairePrenom = data.prenom || '';
        this.beneficiaireSociete = data.societe || '';
        this.beneficiaireAge = data.age ?? null;
        this.beneficiaireMessage = data.message || '';

        this.quizService.getAllLots().subscribe({
          next: (lots) => {
            this.lots = lots;
            this.answers = lots.map(() => ({ plusIndex: null, minusIndex: null }));
            this.currentLotIndex = 0;
          }
        });
      },
      error: () => {
        this.isInvalidLink = true;
        this.errorMessage = 'Ce lien a déjà été utilisé ou est invalide.';
      }
    });
  }

  setPlus(lotIndex: number, questionIndex: number) {
    const current = this.answers[lotIndex];
    if (current.minusIndex === questionIndex) current.minusIndex = null;
    current.plusIndex = questionIndex;
  }

  setMinus(lotIndex: number, questionIndex: number) {
    const current = this.answers[lotIndex];
    if (current.plusIndex === questionIndex) current.plusIndex = null;
    current.minusIndex = questionIndex;
  }

  lotCompleted = (lotIndex: number) => {
    const a = this.answers?.[lotIndex];
    return !!a && a.plusIndex !== null && a.minusIndex !== null;
  };

  allLotsCompleted = () =>
    this.answers?.length > 0 && this.answers.every(a => a.plusIndex !== null && a.minusIndex !== null);

  goToLot(i: number) { if (i >= 0 && i < this.lots.length) this.currentLotIndex = i; }
  nextLot() { if (this.lotCompleted(this.currentLotIndex) && this.currentLotIndex < this.lots.length - 1) this.currentLotIndex++; }
  prevLot() { if (this.currentLotIndex > 0) this.currentLotIndex--; }

  // ---------- Charts ----------
  createChartOptions(title: string, data: number[], labels: string[], isDiff = false): ChartOptions {
    const baseColors = ['#FF4C4C', '#FFD700', '#4CAF50', '#2196F3']; // D, I, S, C
    const series: ApexAxisChartSeries = [{
      name: title,
      data: data.map((val, idx) => ({ x: labels[idx], y: val, fillColor: baseColors[idx % baseColors.length] }))
    }];

    return {
      series,
      chart: { type: 'bar', height: 300, toolbar: { show: false }, animations: { enabled: false } },
      xaxis: { categories: labels },
      yaxis: { min: isDiff ? -100 : 0, max: 100, title: { text: '  Pourcentage (%)  ' } },
      tooltip: { enabled: true },
      dataLabels: { enabled: true, formatter: (val: number) => `${val}%` },
      plotOptions: { bar: { columnWidth: '50%', distributed: true } },
      colors: baseColors
    };
  }

  private tuneForExport(opts: ChartOptions): ChartOptions {
    const EXPORT_W = 1200, EXPORT_H = 600;
    return {
      ...opts,
      chart: { ...(opts.chart || {}), width: EXPORT_W, height: EXPORT_H, background: '#ffffff', animations: { enabled: false } },
      dataLabels: { ...(opts.dataLabels || {}), style: { fontSize: '16px' } as any }
    };
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  private async toDataUrl(res: DataURIResult): Promise<string> {
    if (res.imgURI) return res.imgURI;
    if (res.blob)   return await this.blobToBase64(res.blob);
    throw new Error('Aucune image exportée par le chart');
  }

  private exportChartsAndSave(scores: { plus: any; minus: any }) {
    if (!this.plusExpRef || !this.minusExpRef || !this.diffExpRef) return;

    Promise.all<DataURIResult>([
      this.plusExpRef.dataURI(),
      this.minusExpRef.dataURI(),
      this.diffExpRef.dataURI()
    ])
      .then(async ([plusRes, minusRes, diffRes]) => {
        const payload = {
          charts: {
            plus:  await this.toDataUrl(plusRes),
            minus: await this.toDataUrl(minusRes),
            diff:  await this.toDataUrl(diffRes)
          },
          scores,
          token: this.token
        };

        this.publicService.savePdfWithCharts(payload).subscribe({
          next: () => {
            this.quizSubmitted = true;      // masque le questionnaire + affiche le message succès
            this.expChartsVisible = false;  // on peut cacher l’hôte d’export
          },
          error: (e) => {
            console.error('❌ save-pdf error:', e);
            this.expChartsVisible = false;
            alert('❌ Échec de la génération du rapport.');
          }
        });
      })
      .catch(err => {
        console.error('❌ export charts error:', err);
        this.expChartsVisible = false;
        alert('❌ Erreur lors de la préparation des graphiques.');
      });
  }

  // ---------- Soumission ----------
  submitQuiz() {
    const formattedAnswers = this.answers.map((ans, i) => ({
      lotId: this.lots[i].id,
      plusIndex: ans.plusIndex ?? -1,
      minusIndex: ans.minusIndex ?? -1,
    }));

    this.publicService.submitQuiz(this.token, formattedAnswers, this.beneficiaireEmail).subscribe({
      next: (res: any) => {
        if (!res || !res.plus || !res.minus) {
          alert('Erreur : Résultat vide ou invalide');
          return;
        }

        // Préparer les 3 jeux de données (comme avant)
        const labels = ['D', 'I', 'S', 'C'];
        const totalPlus  = [1,2,3,4].reduce((s,i)=> s + (res.plus[i]  || 0), 0) || 1;
        const totalMinus = [1,2,3,4].reduce((s,i)=> s + (res.minus[i] || 0), 0) || 1;
        const dataPlus   = [1,2,3,4].map(i => Math.round(((res.plus[i]  || 0) * 100) / totalPlus));
        const dataMinus  = [1,2,3,4].map(i => Math.round(((res.minus[i] || 0) * 100) / totalMinus));
        const dataDiff   = dataPlus.map((v, i) => v - dataMinus[i]);

        // Options des charts (taille fixe HD pour export)
        this.plusChartExp  = this.tuneForExport(this.createChartOptions('Scores +', dataPlus,  labels));
        this.minusChartExp = this.tuneForExport(this.createChartOptions('Scores -', dataMinus, labels));
        this.diffChartExp  = this.tuneForExport(this.createChartOptions('Écart + / -', dataDiff, labels, true));

        // Monter l’hôte hors-écran puis exporter
        this.expChartsVisible = true;
        setTimeout(() => this.exportChartsAndSave({ plus: res.plus, minus: res.minus }), 400);
      },
      error: () => {
        alert('Erreur lors de la soumission du quiz.');
      },
    });
  }

  // utils
  completedLotsCount() {
    return this.answers?.filter(a => a.plusIndex !== null && a.minusIndex !== null).length || 0;
  }
  progressPercent() {
    if (!this.answers?.length) return 0;
    return Math.round((this.completedLotsCount() / this.answers.length) * 100);
  }
}
