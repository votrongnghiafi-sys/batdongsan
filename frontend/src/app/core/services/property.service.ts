import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Property, PaginatedResponse, ApiResponse } from '../models/interfaces';

export interface PropertyFilters {
  projectId: number;
  page?: number;
  perPage?: number;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private http = inject(HttpClient);

  getProperties(filters: PropertyFilters): Observable<PaginatedResponse<Property>> {
    let params = new HttpParams()
      .set('projectId', filters.projectId.toString());

    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.perPage) params = params.set('perPage', filters.perPage.toString());
    if (filters.minPrice) params = params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params = params.set('maxPrice', filters.maxPrice.toString());
    if (filters.bedrooms) params = params.set('bedrooms', filters.bedrooms.toString());
    if (filters.status) params = params.set('status', filters.status);

    return this.http
      .get<ApiResponse<PaginatedResponse<Property>>>('/api/properties.php', { params })
      .pipe(map(res => res.data));
  }
}
