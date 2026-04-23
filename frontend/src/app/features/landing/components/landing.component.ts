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

    <!-- Landing page -->
    @if (config && !loading) {
      <app-navbar />
      <main>
        <app-hero />

        @if (config.sections.about) {
          <app-about />
        }

        @if (config.project) {
          <app-property-list />
        }

        @if (config.sections.amenities) {
          <app-amenities />
        }

        @if (config.sections.gallery) {
          <app-gallery />
        }

        @if (config.sections.location) {
          <app-location />
        }

        <app-lead-form />

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

  ngOnInit(): void {
    // Build the API URL
    const params = new URLSearchParams(window.location.search);
    const siteKey = params.get('site_key') || 'duana';
    const url = `/api/site.php?site_key=${encodeURIComponent(siteKey)}`;

    // Direct HTTP call — keeps it simple and avoids observable chain issues
    this.http.get<ApiResponse<SiteConfig>>(url).subscribe({
      next: (response) => {
        console.log('[BDS] API response:', response);
        if (response.success && response.data) {
          this.config = response.data;
          this.siteService.setConfig(response.data);
          this.loading = false;
        } else {
          this.error = 'Site not found.';
          this.loading = false;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[BDS] API error:', err);
        this.error = err?.error?.error || err?.message || 'Unable to connect to server.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  reload(): void {
    window.location.reload();
  }
}
