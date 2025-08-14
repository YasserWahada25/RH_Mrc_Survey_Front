import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgApexchartsModule, ApexChart, ApexPlotOptions, ApexFill, ApexStroke, ApexDataLabels } from 'ng-apexcharts';
import { DashboardAnalyticsService, DashboardStats } from '../../../../services/dashboard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-quiz-response-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './quiz-response-chart.component.html',
  styleUrls: ['./quiz-response-chart.component.css'],
})
export class QuizResponseChartComponent implements OnInit, OnDestroy {
  private svc = inject(DashboardAnalyticsService);
  private sub?: Subscription;

  loading = true;
  rate = 0;

  series: number[] = [0];
  chartOptions: {
    chart: ApexChart;
    plotOptions: ApexPlotOptions;
    fill: ApexFill;
    stroke: ApexStroke;
    dataLabels: ApexDataLabels;
    labels: string[];
  } = {
    chart: { type: 'radialBar', height: 300, sparkline: { enabled: false } },
    plotOptions: {
      radialBar: {
        hollow: { size: '58%' },
        dataLabels: {
          name: { show: true, fontSize: '14px' },
          value: { show: true, formatter: (val: number) => `${Math.round(val)}%` }
        }
      }
    },
    fill: { type: 'gradient' },
    stroke: { lineCap: 'round' },
    dataLabels: { enabled: true },
    labels: ['Response Rate']
  };

  ngOnInit(): void {
    this.sub = this.svc.getStats().subscribe((stats: DashboardStats) => {
      this.rate = stats.responseRate;
      this.series = [this.rate];
      this.loading = false;
    });
  }
  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
