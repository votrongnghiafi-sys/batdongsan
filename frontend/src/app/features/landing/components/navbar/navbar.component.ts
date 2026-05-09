import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteService } from '../../../../core/services/site.service';
import { SiteConfig, NavigationItem } from '../../../../core/models/interfaces';
import { scrollToSection } from '../../../../shared/utils/helpers';

/** A top-level nav entry that may have children (dropdown) */
export interface NavGroup {
  item: NavigationItem;
  children: NavigationItem[];
}

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

  /** Flat list of all visible nav items */
  navItems: NavigationItem[] = [];

  /** Grouped: top-level items with their children */
  navGroups: NavGroup[] = [];

  /** Track which dropdown is open (for click-based toggle on mobile) */
  openDropdown: string | null = null;

  /** Hardcoded fallback — used when no navigation config exists (V1 compat) */
  private readonly defaultItems: NavigationItem[] = [
    { key: 'about',      label: 'Giới thiệu', anchor: '#section-about' },
    { key: 'properties', label: 'Bảng giá',   anchor: '#section-properties' },
    { key: 'amenities',  label: 'Tiện ích',   anchor: '#section-amenities' },
    { key: 'gallery',    label: 'Thư viện',   anchor: '#section-gallery' },
    { key: 'location',   label: 'Vị trí',     anchor: '#section-location' },
    { key: 'contact',    label: 'Liên hệ',    anchor: '#section-contact' },
  ];

  // ── V2+ getters (branding → site fallback) ──

  get logoUrl(): string {
    return this.config?.branding?.logoUrl
      || this.config?.site?.logo_url
      || '';
  }

  get siteName(): string {
    return this.config?.branding?.siteName
      || this.config?.site?.name
      || 'BDS';
  }

  get phone(): string {
    return this.config?.contact?.phone
      || this.config?.site?.phone
      || '';
  }

  ngOnInit(): void {
    this.siteService.config$.subscribe(c => {
      this.config = c;
      this.buildNavItems(c);
    });
  }

  ngOnDestroy(): void {}

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 50;
  }

  /** Close dropdown when clicking outside */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.navbar__dropdown-wrap')) {
      this.openDropdown = null;
    }
  }

  /**
   * Build nav items and groups from config.
   * Priority:
   * 1. navigation.items[] (V5 — custom per-site menu with parentId)
   * 2. Auto-generate from sections + layout (V1 backward compat)
   */
  private buildNavItems(c: SiteConfig | null): void {
    if (!c) return;

    // V5: Use navigation config if available
    if (c.navigation?.items?.length) {
      this.navItems = c.navigation.items.filter(i => i.visible !== false);
    } else if (c.sections) {
      // V1 fallback: auto-generate from sections
      const keys = new Set(Object.keys(c.sections));
      if (c.project) keys.add('properties');
      keys.add('contact');
      this.navItems = this.defaultItems.filter(i => keys.has(i.key));
    } else {
      this.navItems = this.defaultItems;
    }

    // Build parent/child groups
    this.navGroups = this.buildGroups(this.navItems);
  }

  /**
   * Group flat items into NavGroup[] based on parentId.
   * parentId = 0 or undefined → top-level
   * parentId > 0 → child of the item at (parentId - 1) index in the FULL items array
   */
  private buildGroups(items: NavigationItem[]): NavGroup[] {
    // Get the full items list (including hidden) for correct parentId indexing
    const allItems = this.config?.navigation?.items || items;

    const topLevel = items.filter(i => !i.parentId || i.parentId === 0);
    const groups: NavGroup[] = [];

    for (const parent of topLevel) {
      const parentIdx = allItems.findIndex(a => a.key === parent.key);
      const children = items.filter(i =>
        i.parentId === parentIdx + 1 && i.visible !== false
      );
      groups.push({ item: parent, children });
    }

    return groups;
  }

  /** Navigate to anchor or open external link */
  navigate(item: NavigationItem): void {
    const anchor = item.anchor || '';

    if (anchor.startsWith('http://') || anchor.startsWith('https://')) {
      window.open(anchor, '_blank', 'noopener');
    } else if (anchor.startsWith('#')) {
      scrollToSection(anchor.replace('#', ''));
    } else {
      scrollToSection('section-' + item.key);
    }

    this.menuOpen = false;
    this.openDropdown = null;
  }

  /** Toggle dropdown (for mobile / click interaction) */
  toggleDropdown(key: string, event: Event): void {
    event.stopPropagation();
    this.openDropdown = this.openDropdown === key ? null : key;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    if (!this.menuOpen) {
      this.openDropdown = null;
    }
  }
}
