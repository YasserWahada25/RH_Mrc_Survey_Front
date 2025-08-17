// src/app/pages/apps/apps.routes.ts

import { Routes } from '@angular/router';

import { AppChatComponent } from './chat/chat.component';
import { AppEmailComponent } from './email/email.component';
import { DetailComponent } from './email/detail/detail.component';
import { AppEmployeeComponent } from './employee/employee.component';
import { AppBlogsComponent } from './blogs/blogs.component';
import { AppBlogDetailsComponent } from './blogs/details/details.component';
import { AppNotesComponent } from './notes/notes.component';
import { PermissionComponent } from './permission/permission.component';
import { DepartementComponent } from './departement/departement.component';
import { OwnerCreditRequestsComponent } from './owner-credit-requests/owner-credit-requests.component';
import { AssessmentListComponent } from './assessmentlist/assessmentlist.component';
import { GenerateLinkComponent } from './generate-link/generate-link.component';
import { QuizResultsListRHComponent } from './quiz-results-listRH/quiz-results-listRH.component';
import { AuthGuard } from '../../services/auth-guard.service';
import { AssessmentDetailComponent } from './assessment-detail/assessment-detail.component';
import { GuestLayoutComponent } from './assessment-detail/guest-layout/guest-layout.component';
import { RapportAssessmentComponent } from './rapport-assessment/rapport-assessment.component';


export const AppsRoutes: Routes = [
  // --- 1) Route invitée (guest) pour répondre ---
  {
    path: 'take-assessment/:id',
    component: GuestLayoutComponent,
    children: [
      {
        path: '',
        component: AssessmentDetailComponent,
        data: { guest: true },
      },
    ],
  },

  // --- 2) Routes principales de l’application ---
  {
    path: '',
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'departement',
        component: DepartementComponent,
        data: {
          title: 'Département',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Département' },
          ],
        },
      },
      {
        path: 'chat',
        component: AppChatComponent,
        data: {
          title: 'Chat',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Chat' },
          ],
        },
      },
      {
        path: 'notes',
        component: AppNotesComponent,
        data: {
          title: 'Notes',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Notes' },
          ],
        },
      },
      {
        path: 'email',
        redirectTo: 'email/inbox',
        pathMatch: 'full',
      },
      {
        path: 'email/:type',
        component: AppEmailComponent,
        data: {
          title: 'Email',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Email' },
          ],
        },
        children: [
          {
            path: ':id',
            component: DetailComponent,
            data: {
              title: 'Email Detail',
              urls: [
                { title: 'Dashboard', url: '/dashboards/dashboard1' },
                { title: 'Email Detail' },
              ],
            },
          },
        ],
      },
      
      {
        path: 'permission',
        component: PermissionComponent,
        data: {
          title: 'Roll Base Access',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Roll Base Access' },
          ],
        },
      },
      {
        path: 'assessment',
        component: AssessmentListComponent,
        data: {
          title: 'Assessment',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Assessment' },
          ],
        },
      },
      {
        path: 'assessment/:id',
        component: AssessmentDetailComponent,
        data: {
          title: 'Détail Assessment',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Détail Assessment' },
          ],
        },
      },
      {
        path: 'assessment-responses',
        loadComponent: () =>
          import(
            './assessment-responses-list/assessment-responses-list.component'
          ).then((m) => m.AssessmentResponsesListComponent),
      },
      // ← Nouvelle route pour le détail d’une réponse

      {
        path: 'assessment-responses/:assessmentId/:userId',
        loadComponent: () =>
          import(
            './assessment-response-detail/assessment-response-detail.component'
          ).then((m) => m.AssessmentResponseDetailComponent),
        data: {
          title: 'Détail Réponse',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Détail Réponse' },
          ],
        },
      },

 {
  path: 'rapport-assessment',
  component: RapportAssessmentComponent,
  data: {
    title: 'Rapport Assessment',
    urls: [
      { title: 'Dashboard', url: '/dashboards/dashboard1' },
      { title: 'Rapport Assessment' },
    ],
  },
},

      {
        path: 'quiz-results',
        component: QuizResultsListRHComponent,
        data: {
          title: 'Quiz Disque Results',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Quiz Disque Results' },
          ],
        },
      },
      {
        path: 'CreditRequestOwner',
        component: OwnerCreditRequestsComponent,
        data: {
          title: 'Credit Request List',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Credit Request List' },
          ],
        },
      },
      {
        path: 'generate-links',
        component: GenerateLinkComponent,
        data: {
          title: 'Generate Links Quiz Disque',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Generate Links Quiz Disque' },
          ],
        },
      },
      {
        path: 'blog/post',
        component: AppBlogsComponent,
        data: {
          title: 'Posts',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Posts' },
          ],
        },
      },
      {
        path: 'blog/detail/:id',
        component: AppBlogDetailsComponent,
        data: {
          title: 'Blog Detail',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Blog Detail' },
          ],
        },
      },
      {
        path: 'employee',
        component: AppEmployeeComponent,
        data: {
          title: 'Employee',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Employee' },
          ],
        },
      },
    
    ],
  },
];
