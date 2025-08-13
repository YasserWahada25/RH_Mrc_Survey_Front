import { Component } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';

// components
import { AppTopCardsComponent } from '../../../components/dashboard1/top-cards/top-cards.component';
import { AppProductsComponent } from '../../../components/dashboard2/products/products.component';
import { PresenceSidebarComponent } from '../../../components/dashboard1/presence-list/presence-sidebar.component';


@Component({
  selector: 'app-dashboard1',
  standalone: true,
  imports: [
    TablerIconsModule,
    AppTopCardsComponent,
    AppProductsComponent,
    PresenceSidebarComponent    // ✅ add

  ],
  templateUrl: './dashboard1.component.html',
})
export class AppDashboard1Component {
  constructor() {}
}
