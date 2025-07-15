import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as html2pdf from 'html2pdf.js';
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
import { MatButtonModule } from '@angular/material/button';
import { NgApexchartsModule } from 'ng-apexcharts';

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
  selector: 'app-quiz-result-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    NgApexchartsModule
  ],
  templateUrl: './quiz-result-dialog.component.html',
  styleUrls: ['./quiz-result-dialog.component.css'] // 🔁 utilise CSS simple
})
export class QuizResultDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<QuizResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      result: { plus: any; minus: any };
      columnChartOptionsPlus: ChartOptions;
      columnChartOptionsMinus: ChartOptions;
      columnChartOptionsDiff: ChartOptions;
      scorePercentagesPlus: { [key: number]: number };
      scorePercentagesMinus: { [key: number]: number };
    }
  ) {}

  // downloadPDF(): void {
  //   const element = document.getElementById('resultContent');
  //   if (element) {
  //     const opt = {
  //       margin: 0.5,
  //       filename: 'resultat-quiz.pdf',
  //       image: { type: 'jpeg', quality: 0.98 },
  //       html2canvas: { scale: 2 },
  //       jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  //     };
  //     html2pdf().set(opt).from(element).save();
  //   }
  // }

  close(): void {
    this.dialogRef.close();
  }
}
