import { Routes } from '@angular/router';

export const routes: Routes = [
  // Landing page (default — existing multi-site system)
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/components/landing.component').then(m => m.LandingComponent),
  },
  // Eco 2030 — futuristic eco real estate landing page
  {
    path: 'eco-2030',
    loadComponent: () =>
      import('./features/eco-landing/components/landing-page.component').then(m => m.LandingPageComponent),
    title: 'Eco Smart Living 2030',
  },
  // EcoHaven — SaaS sidebar dashboard layout
  {
    path: 'eco-haven',
    loadComponent: () =>
      import('./features/eco-haven/eco-haven-layout.component').then(m => m.EcoHavenLayoutComponent),
    title: 'EcoHaven — Smart Green Investing',
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
      // V6: /admin/sections route removed — sections managed by Page Builder
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
      {
        path: 'builder',
        loadComponent: () =>
          import('./features/admin/pages/page-builder.component').then(m => m.PageBuilderComponent),
      },
    ],
  },
];
