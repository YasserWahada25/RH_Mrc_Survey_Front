import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { QuizService } from 'src/app/services/quiz.service';
import { Lot } from 'src/app/models/quiz.model';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexTooltip,
  ApexDataLabels,
  ApexPlotOptions,
  NgApexchartsModule,
  ApexLegend
} from 'ng-apexcharts';

import { QuizResultDialogComponent } from './quiz-result-dialog/quiz-result-dialog.component';

export type ChartOptions = {
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

@Component({
  selector: 'app-quiz-disque',
  templateUrl: './quiz-disque.component.html',
  styleUrls: ['./quiz-disque.component.css'] ,

  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatRadioModule,
    NgApexchartsModule,
    MatDialogModule
  ]
})
export class QuizDisqueComponent implements OnInit {
  lots: Lot[] = [];
  answers: { plusIndex: number | null; minusIndex: number | null }[] = [];
  result: { plus: { [score: number]: number }; minus: { [score: number]: number } } | null = null;
  scorePercentagesPlus: { [score: number]: number } = {};
  scorePercentagesMinus: { [score: number]: number } = {};

  public columnChartOptionsPlus: ChartOptions;
  public columnChartOptionsMinus: ChartOptions;
  public columnChartOptionsDiff: ChartOptions;

  constructor(private quizService: QuizService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.quizService.getAllLots().subscribe({
      next: (data: Lot[]) => {
        this.lots = data;
        this.answers = this.lots.map(() => ({ plusIndex: null, minusIndex: null }));
      },
      error: (err) => {
        console.error('Erreur chargement lots :', err);
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

  submitQuiz() {
    const formattedAnswers = this.answers.map((ans, i) => ({
      lotId: this.lots[i].id,
      plusIndex: ans.plusIndex ?? -1,
      minusIndex: ans.minusIndex ?? -1
    }));

    this.quizService.submitAnswers(formattedAnswers).subscribe({
      next: (res: any) => {
        this.result = res;
        this.calculateScorePercentages();

        // ✅ ouverture de la popup avec les données du quiz
        this.dialog.open(QuizResultDialogComponent, {
          width: '80%',
          data: {
            result: this.result,
            columnChartOptionsPlus: this.columnChartOptionsPlus,
            columnChartOptionsMinus: this.columnChartOptionsMinus,
            columnChartOptionsDiff: this.columnChartOptionsDiff,
            scorePercentagesPlus: this.scorePercentagesPlus,
            scorePercentagesMinus: this.scorePercentagesMinus
          }
        });
      },
      error: (err) => {
        console.error('Erreur soumission :', err);
        alert('Erreur soumission quiz');
      }
    });
  }

  calculateScorePercentages() {
    if (!this.result) return;

    const totalPlus = [1, 2, 3, 4].reduce((sum, i) => sum + (this.result!.plus[i] || 0), 0);
    const totalMinus = [1, 2, 3, 4].reduce((sum, i) => sum + (this.result!.minus[i] || 0), 0);

    const dataPlus: number[] = [];
    const dataMinus: number[] = [];

    for (let i = 1; i <= 4; i++) {
      const plus = totalPlus ? Math.round((this.result.plus[i] ?? 0) * 100 / totalPlus) : 0;
      const minus = totalMinus ? Math.round((this.result.minus[i] ?? 0) * 100 / totalMinus) : 0;

      this.scorePercentagesPlus[i] = plus;
      this.scorePercentagesMinus[i] = minus;

      dataPlus.push(plus);
      dataMinus.push(minus);
    }

    this.columnChartOptionsPlus = this.createFinalChartOptions('Scores +', dataPlus);
    this.columnChartOptionsMinus = this.createFinalChartOptions('Scores -', dataMinus);

    const dataDiff: number[] = dataPlus.map((val, idx) => val - dataMinus[idx]);
    this.columnChartOptionsDiff = this.createDiffChartOptions('Écart + / -', dataDiff);
  }

  createFinalChartOptions(title: string, data: number[]): ChartOptions {
    const colors = ['#FF4C4C', '#FFD700', '#4CAF50', '#2196F3'];
    const labels = ['D', 'I', 'S', 'C'];

    return {
      series: [
        {
          name: title,
          data: data.map((val, idx) => ({
            x: labels[idx],
            y: val,
            fillColor: colors[idx % colors.length]
          }))
        }
      ],
      chart: {
        type: 'bar',
        height: 300
      },
      xaxis: {
        categories: labels
      },
      yaxis: {
        min: 0,
        max: 100,
        title: { text: 'Pourcentage (%)' }
      },
      tooltip: {
        enabled: true
      },
      dataLabels: {
        enabled: true
      },
      plotOptions: {
        bar: {
          columnWidth: '50%',
          distributed: true
        }
      }
    };
  }

  createDiffChartOptions(title: string, data: number[]): ChartOptions {
    const labels = ['D', 'I', 'S', 'C'];
    const colors = data.map(val => val >= 0 ? '#4CAF50' : '#F44336');

    return {
      series: [
        {
          name: title,
          data: data.map((val, idx) => ({
            x: labels[idx],
            y: val,
            fillColor: colors[idx]
          }))
        }
      ],
      chart: {
        type: 'bar',
        height: 300
      },
      xaxis: {
        categories: labels
      },
      yaxis: {
        min: -100,
        max: 100,
        title: { text: 'Écart (%)' }
      },
      tooltip: {
        enabled: true
      },
      dataLabels: {
        enabled: true,
        formatter: function (val: number) {
          return val + '%';
        }
      },
      plotOptions: {
        bar: {
          columnWidth: '50%',
          distributed: true
        }
      },
      colors: colors
    };
  }
}
