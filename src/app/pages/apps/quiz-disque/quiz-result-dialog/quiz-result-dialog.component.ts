import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { NgApexchartsModule } from 'ng-apexcharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  styleUrls: ['./quiz-result-dialog.component.css']
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

  async downloadPDF(): Promise<void> {
    const doc = new jsPDF('p', 'mm', 'a4');

    let y = 10;
    doc.setFontSize(18);
    doc.text('🧠 Résultat du Quiz DISC', 10, y);
    y += 10;

    // Résultats textuels
    doc.setFontSize(12);
    for (let score = 1; score <= 5; score++) {
      const plus = this.data.result.plus[score] || 0;
      const minus = this.data.result.minus[score] || 0;
      const pctPlus = this.data.scorePercentagesPlus[score] || 0;
      const pctMinus = this.data.scorePercentagesMinus[score] || 0;

      doc.text(`Score ${score} : + ${plus} fois (${pctPlus}%) | - ${minus} fois (${pctMinus}%)`, 10, y);
      y += 7;
    }

    // Ajoute un espacement avant les graphiques
    y += 10;

    // Fonction utilitaire pour capturer un graphique en image
    const addChartImage = async (chartId: string, title: string) => {
      const element = document.getElementById(chartId);
      if (!element) return;

      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 180;
      const imgProps = doc.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      if (y + pdfHeight > 280) {
        doc.addPage();
        y = 10;
      }

      doc.setFontSize(14);
      doc.text(title, 10, y);
      y += 5;

      doc.addImage(imgData, 'PNG', 10, y, pdfWidth, pdfHeight);
      y += pdfHeight + 10;
    };

    await addChartImage('chart-plus', 'Adapté (Scores +)');
    await addChartImage('chart-minus', 'Naturel (Scores -)');
    await addChartImage('chart-diff', 'Delta (+ / -)');

    doc.save('resultat-quiz.pdf');
  }

  close(): void {
    this.dialogRef.close();
  }
}
