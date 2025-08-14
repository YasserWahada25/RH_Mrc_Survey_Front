import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  NgApexchartsModule,
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexResponsive,
  ApexFill,
  ApexStroke
} from 'ng-apexcharts';
import { DashboardAnalyticsService, DashboardStats } from '../../../../services/dashboard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-quiz-sent-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './quiz-sent-chart.component.html',
  styleUrls: ['./quiz-sent-chart.component.css'],
})
export class QuizSentChartComponent implements OnInit, OnDestroy {
  private svc = inject(DashboardAnalyticsService);
  private sub?: Subscription;

  loading = true;
  totalSent = 0;
  totalResponded = 0;
  pending = 0;

  series: number[] = [0, 0, 0];
  labels = ['Sent', 'Responded', 'Pending'];

  chartOptions: {
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    legend: ApexLegend;
    responsive: ApexResponsive[];
    fill: ApexFill;
    stroke: ApexStroke;
    labels: string[];
  } = {
    chart: { type: 'donut', height: 280 },
    dataLabels: { enabled: true },
    legend: { position: 'bottom' },
    responsive: [{ breakpoint: 576, options: { chart: { height: 260 }, legend: { position: 'bottom' } } }],
    fill: { type: 'gradient' },
    stroke: { width: 1 },
    labels: this.labels
  };

  ngOnInit(): void {
    this.sub = this.svc.getStats().subscribe((stats: DashboardStats) => {
      this.totalSent = stats.totalSent;
      this.totalResponded = stats.totalResponded;
      this.pending = stats.pending;
      this.series = [this.totalSent, this.totalResponded, this.pending];
      this.loading = false;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
