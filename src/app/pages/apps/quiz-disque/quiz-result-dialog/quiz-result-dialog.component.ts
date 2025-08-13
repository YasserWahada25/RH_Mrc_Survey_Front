import {
  Component,
  Inject,
  OnInit,
  AfterViewInit,
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
  chart: ApexChart & {
    events?: {
      mounted?: () => void;        // ✅ appelé quand le chart est rendu (même sans animation)
      animationEnd?: () => void;   // pour compat
    }
  };
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
  imports: [CommonModule, MatButtonModule, MatSnackBarModule, NgApexchartsModule],
  templateUrl: './quiz-result-dialog.component.html',
  styleUrls: ['./quiz-result-dialog.component.css']
})
export class QuizResultDialogComponent implements OnInit, AfterViewInit {
  plusChartOptions!: ChartOptions;
  minusChartOptions!: ChartOptions;
  diffChartOptions!: ChartOptions;

  @ViewChild('plusChart',  { static: false }) plusChartRef!: ChartComponent;
  @ViewChild('minusChart', { static: false }) minusChartRef!: ChartComponent;
  @ViewChild('diffChart',  { static: false }) diffChartRef!: ChartComponent;

  private chartsReadyCount = 0;
  isSaving = false;          
  private hasSavedOnce = false;

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
      token: string;
    }
  ) {}

  ngOnInit(): void {
    this.plusChartOptions  = { ...this.data.columnChartOptionsPlus  };
    this.minusChartOptions = { ...this.data.columnChartOptionsMinus };
    this.diffChartOptions  = { ...this.data.columnChartOptionsDiff  };

    const EXPORT_W = 1200, EXPORT_H = 600;
    const tune = (opts: ChartOptions) => {
      opts.chart = {
        ...opts.chart,
        width: EXPORT_W,
        height: EXPORT_H,
        background: '#ffffff',
        animations: { enabled: false }  
      };
      opts.dataLabels = { ...opts.dataLabels, style: { fontSize: '16px' } as any };
      return opts;
    };
    this.plusChartOptions  = tune(this.plusChartOptions);
    this.minusChartOptions = tune(this.minusChartOptions);
    this.diffChartOptions  = tune(this.diffChartOptions);

    const markReady = () => {
      this.chartsReadyCount++;
      if (this.chartsReadyCount === 3) this.savePdfOnly();
    };

    const attach = (opts: ChartOptions) => {
      const ev = opts.chart?.events || {};
      opts.chart = { ...(opts.chart || {}), events: { ...ev, mounted: markReady, animationEnd: markReady } };
    };
    attach(this.plusChartOptions);
    attach(this.minusChartOptions);
    attach(this.diffChartOptions);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (!this.hasSavedOnce) this.savePdfOnly();
    }, 1200);
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

  /** Sauvegarde le PDF côté serveur  */
  private savePdfOnly(): void {
    if (this.isSaving || this.hasSavedOnce) return;
    if (!this.plusChartRef || !this.minusChartRef || !this.diffChartRef) return;

    this.isSaving = true;

    Promise.all<DataURIResult>([
      this.plusChartRef.dataURI(),
      this.minusChartRef.dataURI(),
      this.diffChartRef.dataURI()
    ])
      .then(async ([plusRes, minusRes, diffRes]) => {
        const payload = {
          charts: {
            plus:  await this.toDataUrl(plusRes),
            minus: await this.toDataUrl(minusRes),
            diff:  await this.toDataUrl(diffRes)
          },
          scores: { plus: this.data.result.plus, minus: this.data.result.minus },
          token: this.data.token
        };

        this.quizDiscService.savePdfWithCharts(payload).subscribe({
          next: () => {
            this.hasSavedOnce = true;
            this.isSaving = false;
            this.snackBar.open('📄 PDF enregistré pour le RH-admin', 'OK', { duration: 3000 });
          },
          error: (e) => {
            console.error('❌ save-pdf error:', e);
            this.isSaving = false;
            this.snackBar.open('❌ Échec de la sauvegarde du PDF', 'OK', { duration: 4000 });
          }
        });
      })
      .catch(err => {
        console.error('❌ export charts error:', err);
        this.isSaving = false;
        this.snackBar.open('❌ Erreur lors de la préparation des graphiques', 'OK', { duration: 4000 });
      });
  }

  /** Bouton manuel */
  public exportAndSendPdf(): void {
    this.savePdfOnly();
  }

  close(): void {
    this.dialogRef.close();
  }
}
