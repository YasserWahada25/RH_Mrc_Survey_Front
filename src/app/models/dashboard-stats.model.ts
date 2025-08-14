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
