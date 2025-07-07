import { Routes } from '@angular/router';

import { AppSideForgotPasswordComponent } from './side-forgot-password/side-forgot-password.component';
import { AppSideLoginComponent } from './side-login/side-login.component';
import { AppSideRegisterComponent } from './side-register/side-register.component';
import { ActivateAccountComponent } from './activate-account/activate-account.component';

export const AuthenticationRoutes: Routes = [
  {
    path: '',
    children: [

      {
        path: 'activate/:token',
        component: ActivateAccountComponent,
      },

      {
        path: 'side-forgot-pwd',
        component: AppSideForgotPasswordComponent,
      },
      {
        path: 'login',
        component: AppSideLoginComponent,
      },

      {
        path: 'side-register',
        component: AppSideRegisterComponent,
      },
      {
        path: 'activate/:token',
        loadComponent: () => import('./activate-account/activate-account.component').then(m => m.ActivateAccountComponent)
      },


    ],
  },
];
