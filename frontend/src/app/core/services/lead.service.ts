import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { LeadPayload, ApiResponse } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class LeadService {
  private http = inject(HttpClient);

  submitLead(payload: LeadPayload): Observable<{ id: number; message: string }> {
    return this.http
      .post<ApiResponse<{ id: number; message: string }>>('/api/lead.php', payload)
      .pipe(map(res => res.data));
  }
}
