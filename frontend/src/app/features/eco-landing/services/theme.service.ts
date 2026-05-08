import { Injectable, inject } from '@angular/core';
import { SiteConfigService } from './site-config.service';
import { EcoTheme } from '../models/eco-site-config.interface';

/**
 * ThemeService
 * Maps EcoTheme config into CSS custom properties on :root.
 * All components reference var(--color-primary) etc. — no hardcoded colors.
 *
 * CSS variable mapping:
 *   theme.primaryColor     → --color-primary
 *   theme.secondaryColor   → --color-secondary
 *   theme.accentColor      → --color-accent
 *   theme.textColor        → --color-text
 *   theme.backgroundColor  → --color-bg
 *   theme.borderRadius     → --radius-lg
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private configService = inject(SiteConfigService);

  /** Call once after config is loaded */
  applyTheme(theme: EcoTheme): void {
    const root = document.documentElement;
    root.style.setProperty('--color-primary',   theme.primaryColor);
    root.style.setProperty('--color-secondary', theme.secondaryColor);
    root.style.setProperty('--color-accent',    theme.accentColor);
    root.style.setProperty('--color-text',      theme.textColor);
    root.style.setProperty('--color-bg',        theme.backgroundColor);
    root.style.setProperty('--radius-lg',       theme.borderRadius);

    // Derived tokens
    root.style.setProperty('--color-primary-10', theme.primaryColor + '1A'); // 10% alpha
    root.style.setProperty('--color-primary-20', theme.primaryColor + '33'); // 20% alpha
    root.style.setProperty('--glass-bg',   'rgba(255,255,255,0.65)');
    root.style.setProperty('--glass-border', 'rgba(255,255,255,0.4)');
  }

  applyFromConfig(): void {
    const theme = this.configService.config?.theme;
    if (theme) this.applyTheme(theme);
  }
}
