import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EcoHavenConfigService } from './services/eco-haven-config.service';
import { EcoHavenConfig } from './models/eco-haven.interface';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { PropertyListComponent } from './components/property-list/property-list.component';
import { FeatureSectionComponent } from './components/feature-section/feature-section.component';
import { DashboardPanelComponent } from './components/dashboard-panel/dashboard-panel.component';

@Component({
  selector: 'eco-haven-layout',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    TopbarComponent,
    HeroComponent,
    PropertyListComponent,
    FeatureSectionComponent,
    DashboardPanelComponent,
  ],
  templateUrl: './eco-haven-layout.component.html',
  styleUrl: './eco-haven-layout.component.scss',
})
export class EcoHavenLayoutComponent implements OnInit {
  private configService = inject(EcoHavenConfigService);
  private cdr = inject(ChangeDetectorRef);

  config: EcoHavenConfig | null = null;
  loading = true;

  ngOnInit(): void {
    this.configService.load().subscribe({
      next: (cfg: EcoHavenConfig) => { this.config = cfg; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
    });
  }
}
