import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { EcoHavenConfig } from '../models/eco-haven.interface';

@Injectable({ providedIn: 'root' })
export class EcoHavenConfigService {
  private http = inject(HttpClient);
  private _config = new BehaviorSubject<EcoHavenConfig | null>(null);

  config$ = this._config.asObservable();
  get config(): EcoHavenConfig | null { return this._config.value; }

  load(configPath = '/assets/configs/eco-haven.config.json'): Observable<EcoHavenConfig> {
    return this.http.get<EcoHavenConfig>(configPath).pipe(
      tap(cfg => this._config.next(cfg))
    );
  }
}
