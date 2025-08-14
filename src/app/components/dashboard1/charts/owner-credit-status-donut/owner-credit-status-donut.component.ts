import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgApexchartsModule, ApexChart, ApexLegend, ApexDataLabels } from 'ng-apexcharts';
import { DashboardAnalyticsService, OwnerCreditRequestStatsResponse } from '../../../../services/dashboard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-owner-credit-status-donut',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './owner-credit-status-donut.component.html',
  styleUrls: ['./owner-credit-status-donut.component.css']
})
export class OwnerCreditStatusDonutComponent implements OnInit, OnDestroy {
  private svc = inject(DashboardAnalyticsService);
  private sub?: Subscription;

  loading = true;
  total = 0;
  series: number[] = [0, 0, 0];
  labels = ['Pending', 'Approved', 'Rejected'];

  chart: ApexChart = { type: 'donut', height: 280 };
  legend: ApexLegend = { position: 'bottom' };
  dataLabels: ApexDataLabels = { enabled: true };

  ngOnInit(): void {
    this.sub = this.svc.getOwnerCreditRequestStats().subscribe((res: OwnerCreditRequestStatsResponse) => {
      this.series = [res.status.pending, res.status.approved, res.status.rejected];
      this.total = res.status.total;
      this.loading = false;
    });
  }
  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
