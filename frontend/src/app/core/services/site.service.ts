import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SiteConfig, FeaturesConfig } from '../models/interfaces';

const CACHE_KEY = 'bds_site_config';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

@Injectable({ providedIn: 'root' })
export class SiteService {
  private configSubject = new BehaviorSubject<SiteConfig | null>(null);
  config$ = this.configSubject.asObservable();

  get config(): SiteConfig | null {
    return this.configSubject.value;
  }

  /** Load config from cache if still valid */
  loadFromCache(siteKey: string): SiteConfig | null {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const cached = JSON.parse(raw);
      if (cached.siteKey !== siteKey) return null;
      if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      return cached.data;
    } catch {
      return null;
    }
  }

  /** Save config with cache timestamp */
  setConfig(config: SiteConfig): void {
    this.configSubject.next(config);
    this.applyTheme(config);
    this.applySeo(config);

    // Cache to localStorage
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        siteKey: config.site.site_key,
        timestamp: Date.now(),
        data: config,
      }));
    } catch { /* quota exceeded — ignore */ }
  }

  /** Clear cached config */
  clearCache(): void {
    localStorage.removeItem(CACHE_KEY);
  }

  // ---------------------------------------------------------------
  // Theme
  // ---------------------------------------------------------------
  private applyTheme(config: SiteConfig): void {
    const root = document.documentElement;

    // V2 theme config takes priority
    if (config.theme) {
      root.style.setProperty('--color-primary', config.theme.primaryColor);
      root.style.setProperty('--color-secondary', config.theme.secondaryColor);
      if (config.theme.backgroundColor) {
        root.style.setProperty('--bg-primary', config.theme.backgroundColor);
      }
      if (config.theme.textColor) {
        root.style.setProperty('--text-primary', config.theme.textColor);
      }
      if (config.theme.fontFamily && config.theme.fontFamily !== 'Inter') {
        root.style.setProperty('font-family', `'${config.theme.fontFamily}', sans-serif`);
      }
    } else {
      // V1 fallback — from sites table
      if (config.site?.primary_color) {
        root.style.setProperty('--color-primary', config.site.primary_color);
      }
      if (config.site?.secondary_color) {
        root.style.setProperty('--color-secondary', config.site.secondary_color);
      }
    }

    // Title
    const title = config.branding?.siteName || config.site?.name;
    if (title) {
      document.title = title;
    }
  }

  // ---------------------------------------------------------------
  // SEO
  // ---------------------------------------------------------------
  private applySeo(config: SiteConfig): void {
    if (!config.seo) return;

    this.setMeta('description', config.seo.metaDescription);
    this.setMeta('keywords', config.seo.keywords);

    // Open Graph
    this.setMeta('og:title', config.seo.metaTitle || config.site?.name || '', 'property');
    this.setMeta('og:description', config.seo.metaDescription, 'property');
    if (config.seo.ogImage) {
      this.setMeta('og:image', config.seo.ogImage, 'property');
    }

    // Title from SEO config
    if (config.seo.metaTitle) {
      document.title = config.seo.metaTitle;
    }
  }

  private setMeta(name: string, content: string, attr: 'name' | 'property' = 'name'): void {
    if (!content) return;
    let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.content = content;
  }

  // ---------------------------------------------------------------
  // Feature checks
  // ---------------------------------------------------------------
  isFeatureEnabled(feature: keyof FeaturesConfig): boolean {
    return !!this.config?.features?.[feature];
  }

  // ---------------------------------------------------------------
  // Layout
  // ---------------------------------------------------------------
  getHomepageLayout(): string[] {
    return this.config?.layout?.homepage ?? [
      'hero', 'about', 'property-list',
      'amenities', 'gallery', 'location', 'lead-form',
    ];
  }
}
