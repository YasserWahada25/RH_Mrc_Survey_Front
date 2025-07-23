import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';
import { AuthGuard } from '../services/auth-guard.service'; 



export const PagesRoutes: Routes = [
  {
    path: '',
    component: StarterComponent,
    canActivate: [AuthGuard],          
    data: {
      title: 'Starter Page',
    },
  },
];
