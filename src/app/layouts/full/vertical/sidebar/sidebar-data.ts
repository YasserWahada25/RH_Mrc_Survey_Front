import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  { navCap: 'Home' },
  {
    displayName: 'Home',
    iconName: 'aperture',
    route: '/dashboards/dashboard1',
  },

  { navCap: 'Apps' },

  {
    displayName: 'Credit Request List',
    iconName: 'layout',
    route: 'apps/CreditRequestOwner',
    roles: ['owner'],
  },
  {
    displayName: 'Generate Links Quiz Disque',
    iconName: 'link',
    route: 'apps/generate-links',
    roles: ['rh_admin'],
  },
  {
    displayName: 'Quiz Disque Results',
    iconName: 'clipboard-list',
    route: 'apps/quiz-results',
    roles: ['rh_admin'],
  },
  {
    displayName: 'Calendar',
    iconName: 'calendar-event',
    route: 'apps/calendar',
  },
  {
    displayName: 'Contacts',
    iconName: 'phone',
    route: 'apps/contacts',
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

  { navCap: 'Compte' },
  {
    displayName: 'Account Setting',
    iconName: 'user-circle',
    route: 'theme-pages/account-setting',
  },
];
