import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteService } from '../../../../core/services/site.service';
import { SiteConfig, SiteSections } from '../../../../core/models/interfaces';
import { scrollToSection } from '../../../../shared/utils/helpers';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  private siteService = inject(SiteService);

  config: SiteConfig | null = null;
  scrolled = false;
  menuOpen = false;

  navItems: { key: string; label: string }[] = [];

  private readonly allItems = [
    { key: 'about', label: 'Giới thiệu' },
    { key: 'properties', label: 'Bảng giá' },
    { key: 'amenities', label: 'Tiện ích' },
    { key: 'gallery', label: 'Thư viện' },
    { key: 'location', label: 'Vị trí' },
    { key: 'contact', label: 'Liên hệ' },
  ];

  ngOnInit(): void {
    this.siteService.config$.subscribe(c => {
      this.config = c;
      if (c?.sections) {
        // Always show properties if project exists
        const keys = new Set(Object.keys(c.sections));
        if (c.project) keys.add('properties');
        keys.add('contact'); // always show contact
        this.navItems = this.allItems.filter(i => keys.has(i.key));
      }
    });
  }

  ngOnDestroy(): void {}

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 50;
  }

  navigate(key: string): void {
    scrollToSection('section-' + key);
    this.menuOpen = false;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
}
