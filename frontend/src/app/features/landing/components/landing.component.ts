import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SiteService } from '../../../core/services/site.service';
import { SiteConfig, ApiResponse } from '../../../core/models/interfaces';
import { NavbarComponent } from './navbar/navbar.component';
import { HeroComponent } from './hero/hero.component';
import { AboutComponent } from './about/about.component';
import { AmenitiesComponent } from './amenities/amenities.component';
import { PropertyListComponent } from './property-list/property-list.component';
import { GalleryComponent } from './gallery/gallery.component';
import { LocationComponent } from './location/location.component';
import { LeadFormComponent } from './lead-form/lead-form.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    HeroComponent,
    AboutComponent,
    AmenitiesComponent,
    PropertyListComponent,
    GalleryComponent,
    LocationComponent,
    LeadFormComponent,
    FooterComponent,
  ],
  template: `
    <!-- Loading -->
    @if (loading) {
      <div class="loading-screen">
        <div class="loading-spinner"></div>
        <span class="loading-text">Đang tải...</span>
      </div>
    }

    <!-- Error -->
    @if (error && !loading) {
      <div class="error-screen">
        <span class="error-screen__icon">⚠️</span>
        <h2 class="error-screen__title">Không thể tải trang</h2>
        <p class="error-screen__message">{{ error }}</p>
        <button class="error-screen__btn" (click)="reload()">Thử lại</button>
      </div>
    }

    <!-- Landing page — Dynamic Layout -->
    @if (config && !loading) {
      <app-navbar />
      <main>
        @for (section of layout; track section) {
          @switch (section) {
            @case ('hero') {
              @if (config.sections.hero) { <app-hero /> }
            }
            @case ('about') {
              @if (config.sections.about) { <app-about /> }
            }
            @case ('property-list') {
              @if (config.project && isFeature('propertyFilter')) { <app-property-list /> }
            }
            @case ('amenities') {
              @if (config.sections.amenities) { <app-amenities /> }
            }
            @case ('gallery') {
              @if (config.sections.gallery && isFeature('gallery')) { <app-gallery /> }
            }
            @case ('location') {
              @if (config.sections.location && isFeature('map')) { <app-location /> }
            }
            @case ('lead-form') {
              @if (isFeature('leadForm')) { <app-lead-form /> }
            }
          }
        }
        <app-footer />
      </main>
    }
  `,
})
export class LandingComponent implements OnInit {
  private http = inject(HttpClient);
  private siteService = inject(SiteService);
  private cdr = inject(ChangeDetectorRef);

  config: SiteConfig | null = null;
  loading = true;
  error: string | null = null;
  layout: string[] = [];

  ngOnInit(): void {
    const params = new URLSearchParams(window.location.search);
    const siteKey = params.get('site_key') || 'duana';

    // Try loading from cache first
    const cached = this.siteService.loadFromCache(siteKey);
    if (cached) {
      this.applyConfig(cached);
    }

    // Always fetch fresh data (will update cache)
    // Use V2 endpoint if available, fallback to V1
    const url = `/api/sites/by-domain.php?site_key=${encodeURIComponent(siteKey)}`;

    this.http.get<ApiResponse<SiteConfig>>(url).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.applyConfig(response.data);
        } else if (!cached) {
          // Fallback to V1 API
          this.loadV1Fallback(siteKey);
          return;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        // V2 endpoint not available — fallback to V1
        if (!cached) {
          this.loadV1Fallback(siteKey);
        } else {
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
    });
  }

  /** Fallback to old V1 API endpoint */
  private loadV1Fallback(siteKey: string): void {
    const url = `/api/site.php?site_key=${encodeURIComponent(siteKey)}`;
    this.http.get<ApiResponse<SiteConfig>>(url).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.applyConfig(response.data);
        } else {
          this.error = 'Site not found.';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.error || err?.message || 'Unable to connect to server.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private applyConfig(config: SiteConfig): void {
    this.config = config;
    this.layout = this.siteService.getHomepageLayout();

    // If layout comes from config, use it; otherwise use service default
    if (config.layout?.homepage?.length) {
      this.layout = config.layout.homepage;
    }

    this.siteService.setConfig(config);
  }

  /** Check if a feature is enabled (defaults to true if not configured) */
  isFeature(feature: string): boolean {
    if (!this.config?.features) return true; // V1: no features config = all enabled
    return this.config.features[feature] !== false;
  }

  reload(): void {
    this.siteService.clearCache();
    window.location.reload();
  }
}
