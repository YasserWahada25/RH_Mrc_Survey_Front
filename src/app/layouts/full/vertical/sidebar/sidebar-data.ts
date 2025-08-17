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
    displayName: 'Departement',
    iconName: 'building',
    route: 'apps/departement',
    roles: ['rh_admin'],

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
    displayName: 'Réponses Assessment',
    iconName: 'file-search',
    route: 'apps/assessment-responses',
  },

  {
    displayName: 'Rapport Assessment',
    iconName: 'chart-donut-3',
    route: 'apps/rapport-assessment',
  },
  { navCap: 'Compte' },

  {
    displayName: 'Account Setting',
    iconName: 'user-circle',
    route: 'theme-pages/account-setting',
  },
];
