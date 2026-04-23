import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="adm">
      <aside class="adm__side" [class.adm__side--open]="sidebarOpen">
        <div class="adm__brand">
          <div class="adm__logo">BDS</div>
          <span class="adm__brand-text">Admin CMS</span>
        </div>
        <nav class="adm__nav">
          <a routerLink="/admin" routerLinkActive="adm__link--active" [routerLinkActiveOptions]="{exact:true}" class="adm__link" (click)="sidebarOpen=false">
            <span>📊</span><span>Dashboard</span>
          </a>
          <a routerLink="/admin/sites" routerLinkActive="adm__link--active" class="adm__link" (click)="sidebarOpen=false">
            <span>🌐</span><span>Sites</span>
          </a>
          <a routerLink="/admin/sections" routerLinkActive="adm__link--active" class="adm__link" (click)="sidebarOpen=false">
            <span>📄</span><span>Nội dung</span>
          </a>
          <a routerLink="/admin/properties" routerLinkActive="adm__link--active" class="adm__link" (click)="sidebarOpen=false">
            <span>🏠</span><span>Sản phẩm</span>
          </a>
          <a routerLink="/admin/leads" routerLinkActive="adm__link--active" class="adm__link" (click)="sidebarOpen=false">
            <span>📩</span><span>Leads</span>
          </a>
        </nav>
        <div class="adm__foot">
          <a href="/?site_key=duana" target="_blank" class="adm__link"><span>🔗</span><span>Xem Landing Page</span></a>
        </div>
      </aside>

      <main class="adm__main">
        <header class="adm__top">
          <button class="adm__toggle" (click)="sidebarOpen=!sidebarOpen">☰</button>
          <h1 class="adm__page-title">Admin CMS</h1>
        </header>
        <div class="adm__content">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent {
  sidebarOpen = false;
}
