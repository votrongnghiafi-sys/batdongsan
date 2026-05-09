import { Component, inject, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, switchMap, finalize, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { SiteService } from '../../../../core/services/site.service';
import { PropertyService, PropertyFilters } from '../../../../core/services/property.service';
import { Property } from '../../../../core/models/interfaces';
import { formatPrice, formatArea } from '../../../../shared/utils/helpers';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-list.component.html',
  styleUrl: './property-list.component.css',
})
export class PropertyListComponent implements OnInit, AfterViewInit, OnDestroy {
  private siteService = inject(SiteService);
  private propertyService = inject(PropertyService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('sectionRef') sectionRef!: ElementRef;
  isVisible = false;

  properties: Property[] = [];
  totalPages = 0;
  currentPage = 1;
  loading = false;
  perPage = 6;

  // Filters
  selectedBedrooms: number | null = null;
  bedroomOptions: number[] = [];

  // V8: Reactive filter stream + cleanup
  private filterSubject = new Subject<PropertyFilters>();
  private destroy$ = new Subject<void>();

  formatPrice = formatPrice;
  formatArea = formatArea;

  ngOnInit(): void {
    // V8: Read builder config (sections_config.property-list) for limit
    const sc = this.siteService.config?.sections_config?.['property-list'] as Record<string, unknown> | undefined;
    if (sc?.['limit']) {
      this.perPage = sc['limit'] as number;
    }

    // V8: Set up reactive filter pipeline — debounced & cancellable
    this.filterSubject.pipe(
      debounceTime(150),                      // Prevent rapid-fire clicks
      distinctUntilChanged((a, b) =>           // Skip duplicate filters
        a.bedrooms === b.bedrooms && a.page === b.page
      ),
      switchMap(filters => {                   // Cancel previous in-flight request
        this.loading = true;
        this.cdr.detectChanges();
        return this.propertyService.getProperties(filters).pipe(
          finalize(() => {
            this.loading = false;
            this.cdr.detectChanges();
          })
        );
      }),
      takeUntil(this.destroy$),
    ).subscribe({
      next: (res) => {
        this.properties = res.items;
        this.totalPages = res.totalPages;

        // V8: Auto-detect available bedroom options from initial full load
        if (this.selectedBedrooms === null && this.bedroomOptions.length === 0) {
          this.extractBedroomOptions(res.items);
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.properties = [];
        this.totalPages = 0;
        this.cdr.detectChanges();
      },
    });

    // Trigger initial load
    this.emitFilter();
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.isVisible = true;
          this.cdr.detectChanges();
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    if (this.sectionRef?.nativeElement) {
      observer.observe(this.sectionRef.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Build current filter and emit to the reactive stream */
  private emitFilter(): void {
    const projectId = this.siteService.config?.project?.id
      || (this.siteService.config as any)?.project_data?.id;
    if (!projectId) return;

    const filters: PropertyFilters = {
      projectId,
      page: this.currentPage,
      perPage: this.perPage,
    };

    if (this.selectedBedrooms !== null) {
      filters.bedrooms = this.selectedBedrooms;
    }

    this.filterSubject.next(filters);
  }

  /** V8: Extract unique bedroom counts from data to build dynamic filter buttons */
  private extractBedroomOptions(items: Property[]): void {
    const set = new Set<number>();
    for (const item of items) {
      if (item.bedrooms) set.add(item.bedrooms);
    }
    this.bedroomOptions = Array.from(set).sort((a, b) => a - b);
  }

  filterByBedrooms(bedrooms: number | null): void {
    this.selectedBedrooms = bedrooms;
    this.currentPage = 1;
    this.emitFilter();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.emitFilter();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'available': return 'Còn trống';
      case 'reserved': return 'Đã giữ chỗ';
      case 'sold': return 'Đã bán';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    return 'prop-card__status--' + status;
  }
}
