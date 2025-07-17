import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule }              from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgApexchartsModule }        from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexGrid,
  ApexPlotOptions,
  ChartComponent
} from 'ng-apexcharts';
import { Question }                  from 'src/app/services/question.service';
import { ResponseDetailDTO }         from 'src/app/services/response.service';

export type ColumnChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: { categories: string[] };
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  grid: ApexGrid;
  plotOptions: ApexPlotOptions;
};

@Component({
  selector: 'app-question-column-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, NgApexchartsModule],
  templateUrl: './question-column-dialog.component.html',
})
export class QuestionColumnDialogComponent implements OnInit {
  public columnChartOptions!: ColumnChartOptions;
  public question!: Question;
  public responses!: ResponseDetailDTO[];

  constructor(
    private dialogRef: MatDialogRef<QuestionColumnDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: { question: Question; responses: ResponseDetailDTO[] }
  ) {
    this.question  = data.question;
    this.responses = data.responses;
  }

  ngOnInit(): void {
    const counts = this.question.options.map(opt =>
      this.responses.filter(r => {
        const ans = r.answers.find(a => a.questionId === this.question._id);
        if (!ans) return false;
        return Array.isArray(ans.answer)
          ? ans.answer.includes(opt.label)
          : ans.answer === opt.label;
      }).length
    );

    this.columnChartOptions = {
      series: [{ name: 'Utilisateurs', data: counts }],
      chart:  { type: 'bar', height: 300 },
      xaxis:  { categories: this.question.options.map(o => o.label) },
      dataLabels: { enabled: false },
      legend:     { show: false },
      grid:       { show: true },
      plotOptions: { bar: { columnWidth: '50%' } }
    };
  }

  close() {
    this.dialogRef.close();
  }
}
