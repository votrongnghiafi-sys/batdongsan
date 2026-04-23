import { Component, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteService } from '../../../../core/services/site.service';
import { AMENITY_ICONS } from '../../../../shared/utils/helpers';

@Component({
  selector: 'app-amenities',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './amenities.component.html',
  styleUrl: './amenities.component.css',
})
export class AmenitiesComponent implements AfterViewInit {
  private siteService = inject(SiteService);

  @ViewChild('sectionRef') sectionRef!: ElementRef;
  isVisible = false;

  get amenities() { return this.siteService.config?.sections?.amenities; }

  getIcon(key: string): string {
    return AMENITY_ICONS[key] || '✨';
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.isVisible = true;
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (this.sectionRef?.nativeElement) {
      observer.observe(this.sectionRef.nativeElement);
    }
  }
}
