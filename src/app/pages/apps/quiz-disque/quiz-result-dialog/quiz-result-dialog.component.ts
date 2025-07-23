import {
  Component,
  Inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
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
import { QuizDiscPublicService } from 'src/app/services/quiz-disc-public.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart & { events?: { animationEnd: () => void } };
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
  selector: 'app-quiz-result-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatSnackBarModule,
    NgApexchartsModule
  ],
  templateUrl: './quiz-result-dialog.component.html',
  styleUrls: ['./quiz-result-dialog.component.css']
})
export class QuizResultDialogComponent implements OnInit {
  plusChartOptions!: ChartOptions;
  minusChartOptions!: ChartOptions;
  diffChartOptions!: ChartOptions;

  @ViewChild('plusChart',  { static: false }) plusChartRef!: ChartComponent;
  @ViewChild('minusChart', { static: false }) minusChartRef!: ChartComponent;
  @ViewChild('diffChart',  { static: false }) diffChartRef!: ChartComponent;

  private chartsReadyCount = 0;

  constructor(
    private quizDiscService: QuizDiscPublicService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<QuizResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      result: { plus: Record<number, number>; minus: Record<number, number>; email?: string };
      columnChartOptionsPlus: ChartOptions;
      columnChartOptionsMinus: ChartOptions;
      columnChartOptionsDiff: ChartOptions;
      scorePercentagesPlus: Record<number, number>;
      scorePercentagesMinus: Record<number, number>;
    }
  ) {}

  ngOnInit(): void {
    this.plusChartOptions  = { ...this.data.columnChartOptionsPlus };
    this.minusChartOptions = { ...this.data.columnChartOptionsMinus };
    this.diffChartOptions  = { ...this.data.columnChartOptionsDiff };

    const markReady = () => {
      this.chartsReadyCount++;
      if (this.chartsReadyCount === 3) {
        this.exportAndSendPdf();
      }
    };

    this.plusChartOptions.chart.events  = {
      ...this.plusChartOptions.chart.events,
      animationEnd: markReady
    };
    this.minusChartOptions.chart.events = {
      ...this.minusChartOptions.chart.events,
      animationEnd: markReady
    };
    this.diffChartOptions.chart.events  = {
      ...this.diffChartOptions.chart.events,
      animationEnd: markReady
    };
  }

  /** Convertit un Blob en data URI base64 */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror   = reject;
      reader.readAsDataURL(blob);
    });
  }

  /** Exporte les charts en images puis envoie le PDF par mail */
  public exportAndSendPdf(): void {
    Promise.all<DataURIResult>([
      this.plusChartRef.dataURI(),
      this.minusChartRef.dataURI(),
      this.diffChartRef.dataURI()
    ])
    .then(async ([plusRes, minusRes, diffRes]) => {
      const plusImg  = plusRes.imgURI  ?? await this.blobToBase64(plusRes.blob!);
      const minusImg = minusRes.imgURI ?? await this.blobToBase64(minusRes.blob!);
      const diffImg  = diffRes.imgURI  ?? await this.blobToBase64(diffRes.blob!);

      if (!plusImg || !minusImg || !diffImg) {
        this.snackBar.open(
          '⚠️ Impossible de récupérer toutes les images de graphique',
          'OK',
          { duration: 4000 }
        );
        return;
      }

      const payload = {
        email: this.data.result.email ?? 'no-reply@exemple.com',
        charts: { plus: plusImg, minus: minusImg, diff: diffImg },
        scores: { plus: this.data.result.plus, minus: this.data.result.minus }
      };

      this.quizDiscService.sendResultPdfByEmail(payload).subscribe({
        next: () => {
          this.snackBar.open('📩 Résultat envoyé par mail', 'OK', { duration: 4000 });
        },
        error: err => {
          console.error('❌ Erreur backend :', err);
          this.snackBar.open('❌ Échec de l’envoi du mail', 'OK', { duration: 4000 });
        }
      });
    })
    .catch(err => {
      console.error('❌ Erreur lors de la génération du PDF :', err);
      this.snackBar.open('❌ Erreur lors de la préparation du PDF', 'OK', { duration: 4000 });
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
