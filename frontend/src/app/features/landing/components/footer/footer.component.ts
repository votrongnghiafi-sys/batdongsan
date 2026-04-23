import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteService } from '../../../../core/services/site.service';
import { scrollToSection } from '../../../../shared/utils/helpers';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  private siteService = inject(SiteService);

  get site() { return this.siteService.config?.site; }
  get contact() { return this.siteService.config?.sections?.contact; }
  currentYear = new Date().getFullYear();

  scrollTo(id: string): void {
    scrollToSection(id);
  }
}
