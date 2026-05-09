import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteService } from '../../../../core/services/site.service';
import { scrollToSection } from '../../../../shared/utils/helpers';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent {
  private siteService = inject(SiteService);

  /**
   * Hero config source priority:
   * 1. sections_config.hero (V4 — Page Builder merged output)
   * 2. sections.hero (V1 — old site_sections table fallback)
   */
  get hero(): any {
    return this.siteService.config?.sections_config?.['hero']
      || this.siteService.config?.sections?.hero;
  }

  // ── Status badge ──
  get statusLabel(): string {
    const s = this.hero?.status;
    if (s === 'selling') return 'Đang mở bán';
    if (s === 'upcoming') return 'Sắp ra mắt';
    if (s === 'sold_out') return 'Đã bán hết';
    // V1 fallback: check project.status if hero.status not set
    const ps = this.siteService.config?.project?.status;
    if (ps === 'selling') return 'Đang mở bán';
    if (ps === 'upcoming') return 'Sắp ra mắt';
    if (ps === 'sold_out') return 'Đã bán hết';
    return 'Đang mở bán';
  }

  // ── Location ──
  get location(): string {
    return this.hero?.location
      || this.siteService.config?.project?.location
      || '';
  }

  // ── Background ──
  get bgStyle(): string {
    return this.hero?.backgroundImage
      ? `url(${this.hero.backgroundImage})`
      : 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0d0d2b 100%)';
  }

  // ── CTA Phone ──
  get ctaPhone(): string {
    return this.hero?.ctaPhone
      || this.siteService.config?.contact?.phone
      || this.siteService.config?.site?.phone
      || '';
  }

  // ── Stats (with defaults matching section-templates.ts) ──
  get stat1Value(): string { return this.hero?.stat1Value ?? '100+'; }
  get stat1Label(): string { return this.hero?.stat1Label ?? 'Căn hộ'; }
  get stat2Value(): string { return this.hero?.stat2Value ?? '5★'; }
  get stat2Label(): string { return this.hero?.stat2Label ?? 'Tiện ích'; }
  get stat3Value(): string { return this.hero?.stat3Value ?? '24/7'; }
  get stat3Label(): string { return this.hero?.stat3Label ?? 'An ninh'; }

  get hasStats(): boolean {
    return !!(this.stat1Value || this.stat2Value || this.stat3Value);
  }

  scrollToContact(): void {
    scrollToSection('section-contact');
  }
}
