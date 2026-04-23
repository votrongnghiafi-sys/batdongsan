import { Routes } from '@angular/router';

export const routes: Routes = [
  // Landing page (default)
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/components/landing.component').then(m => m.LandingComponent),
  },
  // Admin CMS
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/pages/dashboard.component').then(m => m.AdminDashboardComponent),
      },
      {
        path: 'sites',
        loadComponent: () =>
          import('./features/admin/pages/sites.component').then(m => m.AdminSitesComponent),
      },
      {
        path: 'sections',
        loadComponent: () =>
          import('./features/admin/pages/sections.component').then(m => m.AdminSectionsComponent),
      },
      {
        path: 'properties',
        loadComponent: () =>
          import('./features/admin/pages/properties.component').then(m => m.AdminPropertiesComponent),
      },
      {
        path: 'leads',
        loadComponent: () =>
          import('./features/admin/pages/leads.component').then(m => m.AdminLeadsComponent),
      },
    ],
  },
];
