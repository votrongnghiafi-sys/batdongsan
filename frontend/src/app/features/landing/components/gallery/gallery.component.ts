import { Component, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteService } from '../../../../core/services/site.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css',
})
export class GalleryComponent implements AfterViewInit {
  private siteService = inject(SiteService);

  @ViewChild('sectionRef') sectionRef!: ElementRef;
  isVisible = false;
  lightboxIdx: number | null = null;

  get gallery() { return this.siteService.config?.sections?.gallery; }
  get images() { return this.gallery?.images || []; }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.isVisible = true;
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    if (this.sectionRef?.nativeElement) {
      observer.observe(this.sectionRef.nativeElement);
    }
  }

  openLightbox(idx: number): void { this.lightboxIdx = idx; }
  closeLightbox(): void { this.lightboxIdx = null; }

  prevImage(): void {
    if (this.lightboxIdx !== null) {
      this.lightboxIdx = this.lightboxIdx > 0 ? this.lightboxIdx - 1 : this.images.length - 1;
    }
  }

  nextImage(): void {
    if (this.lightboxIdx !== null) {
      this.lightboxIdx = this.lightboxIdx < this.images.length - 1 ? this.lightboxIdx + 1 : 0;
    }
  }
}
