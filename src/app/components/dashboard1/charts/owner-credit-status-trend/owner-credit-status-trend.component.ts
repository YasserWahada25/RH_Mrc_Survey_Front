import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  NgApexchartsModule,
  ApexChart, ApexXAxis, ApexLegend, ApexDataLabels, ApexGrid, ApexTooltip
} from 'ng-apexcharts';
import { DashboardAnalyticsService, OwnerCreditRequestStatsResponse } from '../../../../services/dashboard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-owner-credit-status-trend',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './owner-credit-status-trend.component.html',
  styleUrls: ['./owner-credit-status-trend.component.css']
})
export class OwnerCreditStatusTrendComponent implements OnInit, OnDestroy {
  private svc = inject(DashboardAnalyticsService);
  private sub?: Subscription;

  loading = true;
  months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  series = [
    { name: 'Pending',  data: Array(12).fill(0) },
    { name: 'Approved', data: Array(12).fill(0) },
    { name: 'Rejected', data: Array(12).fill(0) }
  ];

  chart: ApexChart = { type: 'bar', height: 330, stacked: true };
  xaxis: ApexXAxis = { categories: this.months };
  legend: ApexLegend = { position: 'top' };
  dataLabels: ApexDataLabels = { enabled: false };
  grid: ApexGrid = { strokeDashArray: 3 };
  tooltip: ApexTooltip = { shared: true, intersect: false };

  ngOnInit(): void {
    this.sub = this.svc.getOwnerCreditRequestStats().subscribe((res: OwnerCreditRequestStatsResponse) => {
      // Map months (1..12) to names
      const m = res.monthly;
      this.series = [
        { name: 'Pending',  data: m.pending },
        { name: 'Approved', data: m.approved },
        { name: 'Rejected', data: m.rejected }
      ];
      this.loading = false;
    });
  }
  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
