<<<<<<< HEAD
import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { FormulaireDetailComponent } from './pages/apps/formulaire-detail/formulaire-detail.component';
import { AuthGuard } from './services/auth-guard.service';

export const routes: Routes = [
=======
// src/app/app.routes.ts

import { Routes } from '@angular/router';

// Layouts
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent }  from './layouts/full/full.component';

import { AssessmentGuestComponent }     from './pages/apps/assessment-guest/assessment-guest.component';

export const routes: Routes = [
  // 0) Route isolée pour les invités (quiz sans header/sidebar)
  {
    path: 'take-assessment/:id',
    component: AssessmentGuestComponent
  },

  // 1) Routes sans layout (auth, landing page)
>>>>>>> omar-dev
  {
    path: '',
    component: BlankComponent,
    children: [
<<<<<<< HEAD
      { path: '', redirectTo: 'authentication/side-login', pathMatch: 'full' },
=======
      {
        path: '',
        redirectTo: 'authentication/side-login',
        pathMatch: 'full'
      },
>>>>>>> omar-dev
      {
        path: 'authentication/side-login',
        loadComponent: () =>
          import('./pages/authentication/side-login/side-login.component')
            .then(m => m.AppSideLoginComponent)
<<<<<<< HEAD
      },
      {
        path: 'quiz-disc/:token',
        loadComponent: () =>
          import('./pages/apps/quiz-disc-public/quiz-disc-public.component')
            .then(m => m.QuizDiscPublicComponent)
=======
>>>>>>> omar-dev
      },
      {
        path: 'authentication',
        loadChildren: () =>
          import('./pages/authentication/authentication.routes')
            .then(m => m.AuthenticationRoutes)
      },
      {
        path: 'landingpage',
        loadChildren: () =>
          import('./pages/theme-pages/landingpage/landingpage.routes')
            .then(m => m.LandingPageRoutes)
      }
    ]
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
<<<<<<< HEAD
          import('./pages/pages.routes').then(m => m.PagesRoutes),
=======
          import('./pages/pages.routes').then(m => m.PagesRoutes)
>>>>>>> omar-dev
      },
      {
        path: 'dashboards',
        loadChildren: () =>
<<<<<<< HEAD
          import('./pages/dashboards/dashboards.routes').then(m => m.DashboardsRoutes),
=======
          import('./pages/dashboards/dashboards.routes').then(m => m.DashboardsRoutes)
>>>>>>> omar-dev
      },
      {
        path: 'ui-components',
        loadChildren: () =>
<<<<<<< HEAD
          import('./pages/ui-components/ui-components.routes').then(m => m.UiComponentsRoutes),
=======
          import('./pages/ui-components/ui-components.routes').then(m => m.UiComponentsRoutes)
>>>>>>> omar-dev
      },
      {
        path: 'forms',
        loadChildren: () =>
<<<<<<< HEAD
          import('./pages/forms/forms.routes').then(m => m.FormsRoutes),
=======
          import('./pages/forms/forms.routes').then(m => m.FormsRoutes)
>>>>>>> omar-dev
      },
      {
        path: 'charts',
        loadChildren: () =>
<<<<<<< HEAD
          import('./pages/charts/charts.routes').then(m => m.ChartsRoutes),
=======
          import('./pages/charts/charts.routes').then(m => m.ChartsRoutes)
>>>>>>> omar-dev
      },
      {
        path: 'apps',
        loadChildren: () =>
<<<<<<< HEAD
          import('./pages/apps/apps.routes').then(m => m.AppsRoutes),
        canLoad: [AuthGuard]
=======
          import('./pages/apps/apps.routes').then(m => m.AppsRoutes)
>>>>>>> omar-dev
      },
      {
        path: 'widgets',
        loadChildren: () =>
<<<<<<< HEAD
          import('./pages/widgets/widgets.routes').then(m => m.WidgetsRoutes),
=======
          import('./pages/widgets/widgets.routes').then(m => m.WidgetsRoutes)
      },
      {
        path: 'tables',
        loadChildren: () =>
          import('./pages/tables/tables.routes').then(m => m.TablesRoutes)
      },
      {
        path: 'datatable',
        loadChildren: () =>
          import('./pages/datatable/datatable.routes').then(m => m.DatatablesRoutes)
>>>>>>> omar-dev
      },
      {
        path: 'theme-pages',
        loadChildren: () =>
<<<<<<< HEAD
          import('./pages/theme-pages/theme-pages.routes').then(m => m.ThemePagesRoutes),
      },
      {
        path: 'formulaire/:id',
        component: FormulaireDetailComponent,
        data: {
          title: 'Détail Formulaire',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Formulaire' }
          ]
        }
      }
    ],
=======
          import('./pages/theme-pages/theme-pages.routes').then(m => m.ThemePagesRoutes)
      },


    ]
>>>>>>> omar-dev
  },

  // 3) Catch-all
  {
    path: '**',
    redirectTo: 'authentication/error'
  }
];
