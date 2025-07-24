import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Home',
  },
  {
    displayName: 'Home',
    iconName: 'aperture',
    route: '/dashboards/dashboard1',
  },
  {
    displayName: 'eCommerce',
    iconName: 'shopping-cart',
    route: '/dashboards/dashboard2',
  },
  {
    navCap: 'Apps',
  },
  {
    displayName: 'Quiz Disque',
    iconName: 'checklist',  
    route: 'apps/QuizDisque',
  },
    {
    displayName: 'Credit Request List',
    iconName: 'layout',  
    route: 'apps/CreditRequestOwner',
  },

    {
    displayName: 'Generate Links Quiz Disque',
    iconName: 'link',  
    route: 'apps/generate-links',
  },
     {
        displayName: 'Departement',
        iconName: 'building',
        route: 'apps/departement',
      },
  {
    displayName: 'Employee',
    iconName: 'brand-ctemplar',
    route: 'apps/employee',
  },
  {
    displayName: 'Notes',
    iconName: 'note',
    route: 'apps/notes',
  },
    {
    displayName: 'Assessment',
    iconName: 'file-invoice',
    route: 'apps/assessment',
  },
  {
    displayName: 'Formulaires',
    iconName: 'file-invoice',
    route: 'apps/formulaires',
  },
{
  displayName: 'Réponses',
  iconName: 'message-2',   
  route: 'apps/reponses',
},
  {
    displayName: 'Rapport Formulaire',
    iconName: 'chart-donut-3',
    route: 'apps/rapport-formulaire',
  },
  {
    navCap: 'Compte',
  },
    {
    displayName: 'Account Setting',
    iconName: 'user-circle',
    route: 'theme-pages/account-setting',
  },
];
