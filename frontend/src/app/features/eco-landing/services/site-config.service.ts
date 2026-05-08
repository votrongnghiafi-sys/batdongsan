import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError, map } from 'rxjs';
import { EcoSiteConfig } from '../models/eco-site-config.interface';

/**
 * SiteConfigService — V2 Database-driven
 *
 * Loads config from PHP/MySQL API:
 *   GET /api/eco/site-config.php?site_key={siteKey}
 *
 * Response envelope: { success: boolean, data: EcoSiteConfig }
 *
 * To switch back to JSON file for offline dev, change the URL to:
 *   /assets/configs/${siteKey}.site.json
 * and remove the `.pipe(map(res => res.data))` unwrapping.
 */
@Injectable({ providedIn: 'root' })
export class SiteConfigService {
  private http = inject(HttpClient);

  private _config = new BehaviorSubject<EcoSiteConfig | null>(null);

  /** Observable config stream — components can subscribe directly */
  config$ = this._config.asObservable();

  get config(): EcoSiteConfig | null {
    return this._config.value;
  }

  /**
   * Load config from MySQL via PHP API.
   * API: GET /api/eco/site-config.php?site_key=eco-2030
   *
   * Returns an Observable<EcoSiteConfig> that resolves once.
   * The BehaviorSubject is updated so all subscribers get the new config.
   */
  loadConfig(siteKey: string): Observable<EcoSiteConfig> {
    const url = `/api/eco/site-config.php?site_key=${encodeURIComponent(siteKey)}`;

    return this.http
      .get<{ success: boolean; data: EcoSiteConfig }>(url)
      .pipe(
        map(response => {
          if (!response?.success || !response?.data) {
            throw new Error(`[SiteConfigService] API returned error for siteKey: ${siteKey}`);
          }
          return response.data;
        }),
        tap(config => this._config.next(config)),
        catchError(err => {
          console.error('[SiteConfigService] Failed to load config:', err?.message ?? err);
          return throwError(() => err);
        })
      );
  }

  /** Check if a feature flag is enabled */
  isFeatureEnabled(key: string): boolean {
    return this._config.value?.features?.[key] !== false;
  }

  /** Check if a section is enabled */
  isSectionEnabled(sectionKey: keyof EcoSiteConfig['sections']): boolean {
    return this._config.value?.sections?.[sectionKey]?.enabled !== false;
  }
}
