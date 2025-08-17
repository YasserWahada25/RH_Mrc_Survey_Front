// src/app/app.routes.ts
import { Routes } from '@angular/router';

// Layouts
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent }  from './layouts/full/full.component';

// Pages
import { AssessmentGuestComponent } from './pages/apps/assessment-guest/assessment-guest.component';

// Guards
import { AuthGuard } from './services/auth-guard.service';

export const routes: Routes = [
  // 0) Route isolée pour les invités (quiz sans header/sidebar)
  {
    path: 'take-assessment/:id',
    component: AssessmentGuestComponent
  },

  // 1) Routes sans layout (auth, landing page)
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: '',
        redirectTo: 'authentication/side-login',
        pathMatch: 'full',
      },
      {
        path: 'authentication/side-login',
        loadComponent: () =>
          import('./pages/authentication/side-login/side-login.component')
            .then(m => m.AppSideLoginComponent),
      },
      {
        path: 'authentication',
        loadChildren: () =>
          import('./pages/authentication/authentication.routes')
            .then(m => m.AuthenticationRoutes),
      },
      {
        path: 'landingpage',
        loadChildren: () =>
          import('./pages/theme-pages/landingpage/landingpage.routes')
            .then(m => m.LandingPageRoutes),
      },
      // (Supprimé : toute route "formulaire" et son composant)
    ],
  },

  // 2) Routes avec layout complet (sidebar, header, footer)
  {
    path: '',
    component: FullComponent,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'starter',
        loadChildren: () =>
          import('./pages/pages.routes').then(m => m.PagesRoutes),
      },
      {
        path: 'dashboards',
        loadChildren: () =>
          import('./pages/dashboards/dashboards.routes').then(m => m.DashboardsRoutes),
      },
      {
        path: 'ui-components',
        loadChildren: () =>
          import('./pages/ui-components/ui-components.routes').then(m => m.UiComponentsRoutes),
      },
      // {
      //   path: 'forms',
      //   loadChildren: () =>
      //     import('./pages/forms/forms.routes').then(m => m.FormsRoutes),
      // },
      {
        path: 'charts',
        loadChildren: () =>
          import('./pages/charts/charts.routes').then(m => m.ChartsRoutes),
      },
      {
        path: 'apps',
        loadChildren: () =>
          import('./pages/apps/apps.routes').then(m => m.AppsRoutes),
      },
      {
        path: 'widgets',
        loadChildren: () =>
          import('./pages/widgets/widgets.routes').then(m => m.WidgetsRoutes),
      },
      // {
      //   path: 'tables',
      //   loadChildren: () =>
      //     import('./pages/tables/tables.routes').then(m => m.TablesRoutes),
      // },
      // {
      //   path: 'datatable',
      //   loadChildren: () =>
      //     import('./pages/datatable/datatable.routes').then(m => m.DatatablesRoutes),
      // },
      {
        path: 'theme-pages',
        loadChildren: () =>
          import('./pages/theme-pages/theme-pages.routes').then(m => m.ThemePagesRoutes),
      },
      // (Supprimé : /formulaire/:id et tout ce qui est lié aux questions/réponses)
    ],
  },

  // 3) Catch-all
  {
    path: '**',
    redirectTo: 'authentication/error',
  },
];
