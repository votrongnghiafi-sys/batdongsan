import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { SiteConfigMap } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  private extract<T>(obs: Observable<any>): Observable<T> {
    return obs.pipe(map((r: any) => r.data));
  }

  // =============================================================
  // Dashboard
  // =============================================================
  getDashboard(): Observable<any> {
    return this.extract(this.http.get('/api/admin/dashboard.php'));
  }

  // =============================================================
  // Sites
  // =============================================================
  getSites(): Observable<any[]> {
    return this.extract(this.http.get('/api/admin/sites.php'));
  }
  createSite(data: any): Observable<any> {
    return this.extract(this.http.post('/api/admin/sites.php', data));
  }
  updateSite(data: any): Observable<any> {
    return this.extract(this.http.put('/api/admin/sites.php', data));
  }
  deleteSite(id: number): Observable<any> {
    return this.extract(this.http.delete(`/api/admin/sites.php?id=${id}`));
  }

  // =============================================================
  // Site Configs (V2 SaaS)
  // =============================================================

  /** Get all config groups for a site */
  getSiteConfigs(siteId: number): Observable<SiteConfigMap> {
    return this.extract(this.http.get(`/api/admin/config.php?site_id=${siteId}`));
  }

  /** Get single config group */
  getSiteConfig(siteId: number, key: string): Observable<any> {
    return this.extract(this.http.get(`/api/admin/config.php?site_id=${siteId}&key=${key}`));
  }

  /** Update multiple config groups at once (partial merge) */
  updateSiteConfigs(siteId: number, configs: Partial<SiteConfigMap>): Observable<any> {
    return this.extract(this.http.put('/api/admin/config.php', {
      site_id: siteId,
      configs,
    }));
  }

  /** Update a single config group (partial merge) */
  updateSiteConfig(siteId: number, key: string, value: any): Observable<any> {
    return this.extract(this.http.put('/api/admin/config.php', {
      site_id: siteId,
      config_key: key,
      config_value: value,
    }));
  }

  // =============================================================
  // Sections & Project
  // =============================================================
  getSections(siteId: number): Observable<any> {
    return this.extract(this.http.get(`/api/admin/sections.php?site_id=${siteId}`));
  }
  saveSection(data: any): Observable<any> {
    return this.extract(this.http.post('/api/admin/sections.php', data));
  }
  deleteSection(id: number, siteId: number): Observable<any> {
    return this.extract(this.http.delete(`/api/admin/sections.php?id=${id}&site_id=${siteId}`));
  }
  saveProject(data: any): Observable<any> {
    return this.extract(this.http.put('/api/admin/sections.php', data));
  }

  // =============================================================
  // Properties
  // =============================================================
  getProperties(projectId?: number): Observable<any> {
    const url = projectId ? `/api/admin/properties.php?project_id=${projectId}` : '/api/admin/properties.php';
    return this.extract(this.http.get(url));
  }
  createProperty(data: any): Observable<any> {
    return this.extract(this.http.post('/api/admin/properties.php', data));
  }
  updateProperty(data: any): Observable<any> {
    return this.extract(this.http.put('/api/admin/properties.php', data));
  }
  deleteProperty(id: number): Observable<any> {
    return this.extract(this.http.delete(`/api/admin/properties.php?id=${id}`));
  }

  // =============================================================
  // Leads
  // =============================================================
  getLeads(siteId?: number, status?: string): Observable<any> {
    let params = new HttpParams();
    if (siteId) params = params.set('site_id', siteId);
    if (status) params = params.set('status', status);
    return this.extract(this.http.get('/api/admin/leads.php', { params }));
  }
  markLeadRead(id: number): Observable<any> {
    return this.extract(this.http.put('/api/admin/leads.php', { action: 'mark_read', id }));
  }
  markAllLeadsRead(siteId?: number): Observable<any> {
    return this.extract(this.http.put('/api/admin/leads.php', { action: 'mark_all_read', site_id: siteId || 0 }));
  }
  deleteLead(id: number): Observable<any> {
    return this.extract(this.http.delete(`/api/admin/leads.php?id=${id}`));
  }
}
