import { Routes } from '@angular/router';

import { AppChatComponent } from './chat/chat.component';
import { AppEmailComponent } from './email/email.component';
import { DetailComponent } from './email/detail/detail.component';
// import { AppCoursesComponent } from './courses/courses.component';
// import { AppCourseDetailComponent } from './courses/course-detail/course-detail.component';
import { AppEmployeeComponent } from './employee/employee.component';
import { AppBlogsComponent } from './blogs/blogs.component';
import { AppBlogDetailsComponent } from './blogs/details/details.component';
import { AppContactComponent } from './contact/contact.component';
import { AppNotesComponent } from './notes/notes.component';
import { AppTodoComponent } from './todo/todo.component';
// import { AppPermissionComponent } from './permission/permission.component';
import { PermissionComponent } from './permission/permission.component';

import { AppTaskboardComponent } from './taskboard/taskboard.component';

import { DepartementComponent } from './departement/departement.component';
import { FormulaireListComponent } from './formulairelist/formulairelist.component';
import { FormulaireDetailComponent } from './formulaire-detail/formulaire-detail.component';
import { AppReponsesListComponent } from './reponses/reponse-list/reponses-list.component';
import { QuizDisqueComponent } from './quiz-disque/quiz-disque.component';
import { OwnerCreditRequestsComponent } from './owner-credit-requests/owner-credit-requests.component';
import { RapportDoughnutPieComponent } from './rapport-formulaire/doughnut-pie/doughnut-pie.component';
<<<<<<< HEAD
import { authGuard } from '../../guards/auth.guard'; // en haut du fichier
import { AssessmentListComponent } from './assessmentlist/assessmentlist.component';

=======
import { GenerateLinkComponent } from './generate-link/generate-link.component';
import { AuthGuard } from '../../services/auth-guard.service';
>>>>>>> yasser


export const AppsRoutes: Routes = [
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
        path: 'todo',
        component: AppTodoComponent,
        data: {
          title: 'Todo App',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Todo App' },
          ],
        },
      },
      {
        path: 'taskboard',
        component: AppTaskboardComponent,
        data: {
          title: 'Taskboard',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Taskboard' },
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
        path: 'formulaires',
        component: FormulaireListComponent,
        data: {
          title: 'Formulaires',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Formulaires' },
          ],
        },
      },
      {
        path: 'formulaires/:id',
        component: FormulaireDetailComponent,
        data: {
          title: 'Détail Formulaire',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Détail Formulaire' },
          ],
        },
      },
      {
        path: 'reponses',
        component: AppReponsesListComponent,
        data: {
          title: 'Réponses',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Réponses' },
          ],
        },
      },
      {
        path: 'reponses/:formId/:responseId',
        component: FormulaireDetailComponent,
        data: {
          title: 'Détail Réponse',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Détail Réponse' },
          ],
        },
      },
      {
        path: 'rapport-formulaire',
        component: RapportDoughnutPieComponent,
        data: {
          title: 'Rapport Formulaire',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Rapport Formulaire' }
          ]
        }
      },
      {
        path: 'QuizDisque',
        component: QuizDisqueComponent,
        data: {
          title: 'Quiz Disque',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Quiz Disque' },
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
      
      //     {
      //   path: 'quiz-disc/:linkId',
      //   component: QuizDiscFromLinkComponent,
      //   data: {
      //     title: 'Quiz Disc Link',
      //     urls: [
      //       { title: 'Dashboard', url: '/dashboards/dashboard1' },
      //       { title: 'Quiz Disc Link' },
      //     ],
      //   },
      // },

      

      



      {
        path: 'contacts',
        component: AppContactComponent,
        data: {
          title: 'Contacts',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Contacts' },
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