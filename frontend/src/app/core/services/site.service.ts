import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SiteConfig } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class SiteService {
  private configSubject = new BehaviorSubject<SiteConfig | null>(null);
  config$ = this.configSubject.asObservable();

  get config(): SiteConfig | null {
    return this.configSubject.value;
  }

  setConfig(config: SiteConfig): void {
    this.configSubject.next(config);
    this.applyTheme(config);
  }

  private applyTheme(config: SiteConfig): void {
    const root = document.documentElement;
    if (config.site?.primary_color) {
      root.style.setProperty('--color-primary', config.site.primary_color);
    }
    if (config.site?.secondary_color) {
      root.style.setProperty('--color-secondary', config.site.secondary_color);
    }
    if (config.site?.name) {
      document.title = config.site.name;
    }
  }
}
