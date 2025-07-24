// src/app/layouts/full/vertical/sidebar/sidebar-data.ts

import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  { navCap: 'Home' },
  {
    displayName: 'Home',
    iconName:    'aperture',
    route:       '/dashboards/dashboard1',
  },
  {
    displayName: 'eCommerce',
    iconName:    'shopping-cart',
    route:       '/dashboards/dashboard2',
  },

  { navCap: 'Apps' },
  {
    displayName: 'Quiz Disque',
    iconName:    'checklist',
    route:       'apps/QuizDisque',
    roles:       ['owner']

  },
  {
    displayName: 'Credit Request List',
    iconName:    'layout',
    route:       'apps/CreditRequestOwner',
    roles:       ['owner']
  },
  {
    displayName: 'Generate Links Quiz Disque',
    iconName:    'link',
    route:       'apps/generate-links',
    roles:       ['rh_admin']


  },
  {
    displayName: 'Calendar',
    iconName:    'calendar-event',
    route:       'apps/calendar',
  },
  {
    displayName: 'Contacts',
    iconName:    'phone',
    route:       'apps/contacts',
  },
  {
    displayName: 'Departement',
    iconName:    'building',
    route:       'apps/departement',
  },
  {
    displayName: 'Employee',
    iconName:    'brand-ctemplar',
    route:       'apps/employee',
  },
  {
    displayName: 'Notes',
    iconName:    'note',
    route:       'apps/notes',
  },
  {
    displayName: 'Assessment',
    iconName:    'file-invoice',
    route:       'apps/assessment',
  },
  {
    displayName: 'Formulaires',
    iconName:    'file-invoice',
    route:       'apps/formulaires',
  },
  {
    displayName: 'Réponses',
    iconName:    'message-2',
    route:       'apps/reponses',
  },
  {
    displayName: 'Rapport Formulaire',
    iconName:    'chart-donut-3',
    route:       'apps/rapport-formulaire',
  },
  {
    displayName: 'ToDo',
    iconName:    'edit',
    route:       'apps/todo',
  },

  { navCap: 'Pages' },
  {
    displayName: 'Account Setting',
    iconName:    'user-circle',
    route:       'theme-pages/account-setting',
  },
  {
    displayName: 'Roll Base Access',
    iconName:    'lock-access',
    route:       'apps/permission',
  },
  {
    displayName: 'Pricing',
    iconName:    'currency-dollar',
    route:       'theme-pages/pricing',
  },
  {
    displayName: 'FAQ',
    iconName:    'help',
    route:       'theme-pages/faq',
  },
];
