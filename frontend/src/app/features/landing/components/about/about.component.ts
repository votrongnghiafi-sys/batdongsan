import { Component, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteService } from '../../../../core/services/site.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent implements AfterViewInit {
  private siteService = inject(SiteService);

  @ViewChild('sectionRef') sectionRef!: ElementRef;
  isVisible = false;

  /**
   * V8: Merge sections_config (Page Builder) with sections (V1 legacy).
   * Priority: sections_config fields > sections fields.
   */
  get about() {
    const v1 = this.siteService.config?.sections?.about;
    const v4 = this.siteService.config?.sections_config?.['about'] as Record<string, unknown> | undefined;

    if (!v1 && !v4) return null;

    return {
      title: (v4?.['title'] as string) || v1?.title || '',
      description: (v4?.['description'] as string) || v1?.description || '',
      highlights: (v4?.['highlights'] as string[])?.length
        ? (v4!['highlights'] as string[]).filter(h => h.trim())
        : v1?.highlights || [],
    };
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.isVisible = true;
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (this.sectionRef?.nativeElement) {
      observer.observe(this.sectionRef.nativeElement);
    }
  }
}
