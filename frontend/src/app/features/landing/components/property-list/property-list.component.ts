import { Component, inject, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteService } from '../../../../core/services/site.service';
import { PropertyService, PropertyFilters } from '../../../../core/services/property.service';
import { Property, PaginatedResponse } from '../../../../core/models/interfaces';
import { formatPrice, formatArea } from '../../../../shared/utils/helpers';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-list.component.html',
  styleUrl: './property-list.component.css',
})
export class PropertyListComponent implements OnInit, AfterViewInit {
  private siteService = inject(SiteService);
  private propertyService = inject(PropertyService);

  @ViewChild('sectionRef') sectionRef!: ElementRef;
  isVisible = false;

  properties: Property[] = [];
  totalPages = 0;
  currentPage = 1;
  loading = false;
  perPage = 6;

  // Filters
  selectedBedrooms: number | null = null;
  bedroomOptions = [1, 2, 3, 4, 5];

  formatPrice = formatPrice;
  formatArea = formatArea;

  ngOnInit(): void {
    this.loadProperties();
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.isVisible = true;
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    if (this.sectionRef?.nativeElement) {
      observer.observe(this.sectionRef.nativeElement);
    }
  }

  loadProperties(): void {
    const projectId = this.siteService.config?.project?.id;
    if (!projectId) return;

    this.loading = true;

    const filters: PropertyFilters = {
      projectId,
      page: this.currentPage,
      perPage: this.perPage,
    };

    if (this.selectedBedrooms) {
      filters.bedrooms = this.selectedBedrooms;
    }

    this.propertyService.getProperties(filters).subscribe({
      next: (res) => {
        this.properties = res.items;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  filterByBedrooms(bedrooms: number | null): void {
    this.selectedBedrooms = bedrooms;
    this.currentPage = 1;
    this.loadProperties();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadProperties();
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
