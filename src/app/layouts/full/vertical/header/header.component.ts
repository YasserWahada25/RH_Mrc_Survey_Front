import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { MatDialog } from '@angular/material/dialog';
import { navItems } from '../sidebar/sidebar-data';
import { TranslateService } from '@ngx-translate/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { AuthService } from 'src/app/services/authentification.service';


interface notifications {
  id: number;
  img: string;
  title: string;
  subtitle: string;
}

interface profiledd {
  id: number;
  img: string;
  title: string;
  subtitle: string;
  link: string;
}

interface apps {
  id: number;
  img: string;
  title: string;
  subtitle: string;
  link: string;
}

interface quicklinks {
  id: number;
  title: string;
  link: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    NgScrollbarModule,
    TablerIconsModule,
    MaterialModule,
  ],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent {
  userName: string = '';
  userRole: string = '';
  userEmail: string = '';
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleMobileFilterNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  showFiller = false;

  public selectedLanguage: any = {
    language: 'Français',
    code: 'fr',
    type: 'fr',
    icon: '/assets/images/flag/icon-flag-fr.svg',
  };

  public languages: any[] = [
     {
      language: 'Français',
      code: 'fr',
      icon: '/assets/images/flag/icon-flag-fr.svg',
    },
    {
      
      language: 'English',
      code: 'en',
      type: 'US',
      icon: '/assets/images/flag/icon-flag-en.svg',
    },
    {
      language: 'Español',
      code: 'es',
      icon: '/assets/images/flag/flag-for-spain-svgrepo-com.svg',
    },
   
    {
      language: 'German',
      code: 'de',
      icon: '/assets/images/flag/flag-for-germany-svgrepo-com.svg',
    },
    {
    language: 'العربية',
    code: 'ar',
     icon: '/assets/images/flag/flag-for-tunisia.svg', 
  },
  ];

  constructor(
    private vsidenav: CoreService,
    public dialog: MatDialog,
    private translate: TranslateService,
    private authService: AuthService
  ) {
    
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.nom;
      this.userRole = user.type;
      this.userEmail = user.email;
    }
    translate.setDefaultLang('en');
  }

  openDialog() {
    const dialogRef = this.dialog.open(AppSearchDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  changeLanguage(lang: any): void {
    this.translate.use(lang.code);
    this.selectedLanguage = lang;
  }

  notifications: notifications[] = [
    {
      id: 1,
      img: '/assets/images/profile/user-1.jpg',
      title: 'Roman Joined thes Team!',
      subtitle: 'Congratulate him',
    },
    {
      id: 2,
      img: '/assets/images/profile/user-2.jpg',
      title: 'New message received',
      subtitle: 'Salma sent you new message',
    },
    {
      id: 3,
      img: '/assets/images/profile/user-3.jpg',
      title: 'New Payment received',
      subtitle: 'Check your earnings',
    },
    {
      id: 4,
      img: '/assets/images/profile/user-4.jpg',
      title: 'Jolly completed tasks',
      subtitle: 'Assign her new tasks',
    },
    {
      id: 5,
      img: '/assets/images/profile/user-5.jpg',
      title: 'Roman Joined the Team!',
      subtitle: 'Congratulatse him',
    },
  ];

  profiledd: profiledd[] = [
    {
      id: 1,
      img: '/assets/images/svgs/icon-account.svg',
      title: 'My Profile',
      subtitle: 'Account Settings',
      link: '/',
    },
    {
      id: 2,
      img: '/assets/images/svgs/icon-inbox.svg',
      title: 'My Inbox',
      subtitle: 'Messages & Email',
      link: '/apps/email/inbox',
    },
    {
      id: 3,
      img: '/assets/images/svgs/icon-tasks.svg',
      title: 'My Tasks',
      subtitle: 'To-do and Daily Tasks',
      link: '/apps/taskboard',
    },
  ];

  apps: apps[] = [
  {
    id: 1,
    img: '/assets/images/svgs/icon-dd-chat.svg',
    title: 'Quiz Disque',
    subtitle: 'Quiz DISC Test',
    link: '/apps/QuizDisque',
  },
  {
    id: 2,
    img: '/assets/images/svgs/icon-dd-cart.svg',
    title: 'Credit Request',
    subtitle: 'Gestion des crédits',
    link: '/apps/CreditRequestOwner',
  },
  {
    id: 3,
    img: '/assets/images/svgs/icon-dd-application.svg',
    title: 'Generate Links',
    subtitle: 'Liens Quiz DISC',
    link: '/apps/generate-links',
  },
  {
    id: 6,
    img: '/assets/images/svgs/icon-dd-application.svg',
    title: 'Departement',
    subtitle: 'Gestion des départements',
    link: '/apps/departement',
  },
  {
    id: 7,
    img: '/assets/images/svgs/icon-dd-application.svg',
    title: 'Employee',
    subtitle: 'Gestion des employés',
    link: '/apps/employee',
  },
  {
    id: 9,
    img: '/assets/images/svgs/icon-dd-chat.svg',
    title: 'Assessment',
    subtitle: 'Évaluations',
    link: '/apps/assessment',
  },
  {
    id: 10,
    img: '/assets/images/svgs/imagess.png',
    title: 'Formulaires',
    subtitle: 'Formulaires personnalisés',
    link: '/apps/formulaires',
  },
  {
    id: 11,
    img: '/assets/images/svgs/icon-dd-message-box.svg',
    title: 'Réponses',
    subtitle: 'Réponses aux formulaires',
    link: '/apps/reponses',
  },
  {
    id: 12,
    img: '/assets/images/svgs/icon-pie.svg',
    title: 'Rapport Formulaire',
    subtitle: 'Statistiques & rapports',
    link: '/apps/rapport-formulaire',
  }
];

  quicklinks: quicklinks[] = [
    {
      id: 1,
      title: 'Pricing Page',
      link: '/theme-pages/pricing',
    },
    {
      id: 2,
      title: 'Authentication Design',
      link: '/authentication/login',
    },
    {
      id: 3,
      title: 'Register Now',
      link: '/authentication/side-register',
    },
    {
      id: 4,
      title: '404 Error Page',
      link: '/authentication/error',
    },
    {
      id: 5,
      title: 'Notes App',
      link: '/apps/notes',
    },
    {
      id: 6,
      title: 'Employee App',
      link: '/apps/employee',
    },
    {
      id: 7,
      title: 'Todo Application',
      link: '/apps/todo',
    },
    {
      id: 8,
      title: 'Treeview',
      link: '/theme-pages/treeview',
    },
  ];
}

@Component({
  selector: 'search-dialog',
  standalone: true,
  imports: [RouterModule, MaterialModule, TablerIconsModule, FormsModule],
  templateUrl: 'search-dialog.component.html',
})
export class AppSearchDialogComponent {
  searchText: string = '';
  navItems = navItems;

  navItemsData = navItems.filter((navitem) => navitem.displayName);

  // filtered = this.navItemsData.find((obj) => {
  //   return obj.displayName == this.searchinput;
  // });
}
