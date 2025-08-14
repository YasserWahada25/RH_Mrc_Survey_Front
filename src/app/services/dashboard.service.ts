import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface MonthlyPoint {
      month: number;
      sent: number;
      responded: number;
}
export interface DashboardStats {
      totalSent: number;
      totalResponded: number;
      pending: number;
      responseRate: number;
      monthly: MonthlyPoint[];
}

// ... keep existing imports
export interface OwnerCreditStatus {
      pending: number;
      approved: number;
      rejected: number;
      total: number;
}
export interface OwnerCreditMonthly {
      months: number[];           // 1..12
      pending: number[];          // length 12
      approved: number[];         // length 12
      rejected: number[];         // length 12
}
export interface OwnerCreditRequestStatsResponse {
      status: OwnerCreditStatus;
      monthly: OwnerCreditMonthly;
}



@Injectable({ providedIn: 'root' })
export class DashboardAnalyticsService {

      private http = inject(HttpClient);
      private baseUrl = 'http://localhost:3033/api/dashboard-analytics';

      // inside the class DashboardAnalyticsService
      private ownerUrl = `${this.baseUrl}/credit-requests`; // -> http://localhost:3033/api/dashboard-analytics/credit-requests

      getOwnerCreditRequestStats() {
            return this.http.get<OwnerCreditRequestStatsResponse>(`${this.ownerUrl}/stats`);
      }

      getStats(): Observable<DashboardStats> {
            return this.http.get<DashboardStats>(`${this.baseUrl}/stats`).pipe(
                  map((s: any) => ({
                        totalSent: s?.totalSent ?? 0,
                        totalResponded: s?.totalResponded ?? 0,
                        pending: Math.max(0, (s?.totalSent ?? 0) - (s?.totalResponded ?? 0)),
                        responseRate: s?.responseRate ?? 0,
                        monthly: Array.isArray(s?.monthly) ? s.monthly : [],
                  }))
            );
      }
}
