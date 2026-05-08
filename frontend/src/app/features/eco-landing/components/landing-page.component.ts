import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { SiteConfigService } from '../services/site-config.service';
import { ThemeService } from '../services/theme.service';
import { EcoSiteConfig } from '../models/eco-site-config.interface';
import { HeroSectionComponent } from './hero-section/hero-section.component';
import { PropertyCardsComponent } from './property-cards/property-cards.component';
import { AnalyticsDashboardComponent } from './analytics-dashboard/analytics-dashboard.component';
import { MapPreviewComponent } from './map-preview/map-preview.component';
import { AiRecommendationComponent } from './ai-recommendation/ai-recommendation.component';
import { LeadFormComponent } from './lead-form/lead-form.component';

@Component({
  selector: 'eco-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    HeroSectionComponent,
    PropertyCardsComponent,
    AnalyticsDashboardComponent,
    MapPreviewComponent,
    AiRecommendationComponent,
    LeadFormComponent,
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent implements OnInit {
  private configService = inject(SiteConfigService);
  private themeService  = inject(ThemeService);
  private titleService  = inject(Title);
  private metaService   = inject(Meta);
  private cdr           = inject(ChangeDetectorRef);

  config: EcoSiteConfig | null = null;
  loading = true;
  error   = false;

  /** Read siteKey from URL — defaults to eco-2030 */
  private get siteKey(): string {
    return new URLSearchParams(window.location.search).get('site_key') || 'eco-2030';
  }

  ngOnInit(): void {
    this.configService.loadConfig(this.siteKey).subscribe({
      next: (cfg) => {
        if (!cfg) { this.error = true; this.loading = false; this.cdr.detectChanges(); return; }
        this.config = cfg;
        this.themeService.applyTheme(cfg.theme);
        this.applySeo(cfg);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = true;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  /** Feature flag check */
  show(key: string): boolean {
    return this.config?.features?.[key] !== false;
  }

  /** Section enabled check */
  sectionEnabled(key: string): boolean {
    const s = this.config?.sections as unknown as Record<string, { enabled: boolean } | undefined>;
    return s?.[key]?.enabled !== false;
  }

  private applySeo(cfg: EcoSiteConfig): void {
    if (cfg.seo?.metaTitle)       this.titleService.setTitle(cfg.seo.metaTitle);
    if (cfg.seo?.metaDescription) this.metaService.updateTag({ name: 'description', content: cfg.seo.metaDescription });
    if (cfg.seo?.keywords)        this.metaService.updateTag({ name: 'keywords',    content: cfg.seo.keywords });
  }
}
