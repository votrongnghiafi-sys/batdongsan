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

  get hero() { return this.siteService.config?.sections?.hero; }
  get project() { return this.siteService.config?.project; }

  get statusLabel(): string {
    const s = this.project?.status;
    if (s === 'selling') return 'Đang mở bán';
    if (s === 'upcoming') return 'Sắp ra mắt';
    return 'Đã bán hết';
  }

  get bgStyle(): string {
    return this.hero?.backgroundImage
      ? `url(${this.hero.backgroundImage})`
      : 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0d0d2b 100%)';
  }

  scrollToContact(): void {
    scrollToSection('section-contact');
  }
}
