import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  NgApexchartsModule,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexGrid,
  ApexStroke,
  ApexLegend,
  ApexTooltip,
  ApexResponsive
} from 'ng-apexcharts';
import { DashboardAnalyticsService, DashboardStats } from '../../../../services/dashboard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-monthly-trend-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './monthly-trend-chart.component.html',
  styleUrls: ['./monthly-trend-chart.component.css']
})
export class MonthlyTrendChartComponent implements OnInit, OnDestroy {
  private svc = inject(DashboardAnalyticsService);
  private sub?: Subscription;

  loading = true;

  months: string[] = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  sent: number[] = Array(12).fill(0);
  responded: number[] = Array(12).fill(0);

  series = [
    { name: 'Sent', data: this.sent },
    { name: 'Responded', data: this.responded }
  ];

  chartOptions: {
    chart: ApexChart;
    xaxis: ApexXAxis;
    dataLabels: ApexDataLabels;
    grid: ApexGrid;
    stroke: ApexStroke;
    legend: ApexLegend;
    tooltip: ApexTooltip;
    responsive: ApexResponsive[];
  } = {
    chart: { type: 'bar', height: 330, stacked: false },
    xaxis: { categories: this.months },
    dataLabels: { enabled: false },
    grid: { strokeDashArray: 3 },
    stroke: { show: true, width: 2 },
    legend: { position: 'top' },
    tooltip: { shared: true, intersect: false },
    responsive: [{ breakpoint: 576, options: { chart: { height: 300 } } }]
  };

  ngOnInit(): void {
    this.sub = this.svc.getStats().subscribe((stats: DashboardStats) => {
      const sent = Array(12).fill(0);
      const responded = Array(12).fill(0);
      for (const m of stats.monthly || []) {
        const idx = (m.month ?? 1) - 1;
        if (idx >= 0 && idx < 12) {
          sent[idx] = m.sent ?? 0;
          responded[idx] = m.responded ?? 0;
        }
      }
      this.sent = sent;
      this.responded = responded;
      this.series = [
        { name: 'Sent', data: this.sent },
        { name: 'Responded', data: this.responded }
      ];
      this.loading = false;
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
