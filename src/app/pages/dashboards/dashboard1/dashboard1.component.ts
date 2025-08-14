import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';

// components
import { AppTopCardsComponent } from '../../../components/dashboard1/top-cards/top-cards.component';
import { AppProductsComponent } from '../../../components/dashboard2/products/products.component';
import { PresenceSidebarComponent } from '../../../components/dashboard1/presence-list/presence-sidebar.component';
import { QuizSentChartComponent } from '../../../components/dashboard1/charts/quiz-sent-chart/quiz-sent-chart.component';
import { QuizResponseChartComponent } from '../../../components/dashboard1/charts/quiz-response-chart/quiz-response-chart.component';
import { MonthlyTrendChartComponent } from '../../../components/dashboard1/charts/monthly-trend-chart/monthly-trend-chart.component';
import { OwnerCreditStatusDonutComponent } from '../../../components/dashboard1/charts/owner-credit-status-donut/owner-credit-status-donut.component';
import { OwnerCreditStatusTrendComponent } from '../../../components/dashboard1/charts/owner-credit-status-trend/owner-credit-status-trend.component';

// auth
import { AuthService } from '../../../services/authentification.service';

@Component({
  selector: 'app-dashboard1',
  standalone: true,
  imports: [
    CommonModule,
    TablerIconsModule,
    AppTopCardsComponent,
    AppProductsComponent,
    PresenceSidebarComponent,
    // charts (instanciés seulement si *ngIf = true)
    QuizSentChartComponent,
    QuizResponseChartComponent,
    MonthlyTrendChartComponent,
    OwnerCreditStatusDonutComponent,
    OwnerCreditStatusTrendComponent
  ],
  templateUrl: './dashboard1.component.html',
})
export class AppDashboard1Component implements OnInit {
  isRhAdmin = false;
  isOwner = false;
  isEmployee = false;
  isResponsable = false; // NEW

  constructor(private auth: AuthService) {}

  private normalizeRole(user: any): string {
    const role = (user?.role ?? user?.type ?? '')
      .toString()
      .trim()
      .toLowerCase();
    if (role === 'rh_admin' || role === 'rh-admin' || role === 'rhadmin') return 'rh_admin';
    if (role === 'employe' || role === 'employé' || role === 'employee') return 'employee';
    if (role === 'responsable' || role === 'manager') return 'responsable'; // NEW
    return role;
  }

  ngOnInit(): void {
    let me: any = this.auth.getCurrentUser?.() || null;
    if (!me) {
      try { me = JSON.parse(localStorage.getItem('user') || 'null'); } catch {}
    }

    const role = this.normalizeRole(me || {});
    this.isRhAdmin     = role === 'rh_admin';
    this.isOwner       = role === 'owner';
    this.isEmployee    = role === 'employee';
    this.isResponsable = role === 'responsable'; // NEW
  }
}
