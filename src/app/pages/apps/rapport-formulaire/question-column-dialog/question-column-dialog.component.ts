import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexGrid,
  ApexPlotOptions,
  ApexTooltip
} from 'ng-apexcharts';
import { Question } from 'src/app/services/question.service';
import { ResponseDetailDTO } from 'src/app/services/response.service';

export type ColumnChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: { categories: string[] };
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  grid: ApexGrid;
  plotOptions: ApexPlotOptions;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-question-column-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, NgApexchartsModule],
  templateUrl: './question-column-dialog.component.html',
})
export class QuestionColumnDialogComponent implements OnInit {
  public columnChartOptions: ColumnChartOptions[] = [];
  public question!: Question;
  public responses!: ResponseDetailDTO[];

  constructor(
    private dialogRef: MatDialogRef<QuestionColumnDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: { question: Question; responses: ResponseDetailDTO[] }
  ) {
    this.question = data.question;
    this.responses = data.responses;
  }

  ngOnInit(): void {
    const makeOpts = (counts: number[], labels: string[]) => ({
      series: [{ name: 'Utilisateurs', data: counts }],
      chart: { type: 'bar', height: 300 },
      xaxis: { categories: labels },
      dataLabels: { enabled: false },
      legend: { show: false },
      grid: { show: true },
      plotOptions: { bar: { columnWidth: '50%' } },
      tooltip: {
        y: {
          title: { formatter: () => 'Utilisateurs' },
          formatter: val => `${val}`
        }
      }
    } as ColumnChartOptions);

    if (this.question.inputType === 'evaluation') {
      // pour chaque proposition, un chart 1–5
      this.columnChartOptions = this.question.options.map((opt, idx) => {
        const counts = [1, 2, 3, 4, 5].map(rating =>
          this.responses.filter(resp => {
            const ans = resp.answers.find(a => a.questionId === this.question._id);
            return ans?.answer instanceof Array && ans.answer[idx] === rating;
          }).length
        );
        return makeOpts(counts, ['1','2','3','4','5']);
      });
    } else {
      // ancien comportement pour les autres types
      const counts = this.question.options.map(opt =>
        this.responses.filter(r => {
          const ans = r.answers.find(a => a.questionId === this.question._id);
          if (!ans) return false;
          return Array.isArray(ans.answer)
            ? ans.answer.includes(opt.label)
            : ans.answer === opt.label;
        }).length
      );
      const labels = this.question.options.map(o => o.label);
      this.columnChartOptions = [ makeOpts(counts, labels) ];
    }
  }

  close() {
    this.dialogRef.close();
  }
}
