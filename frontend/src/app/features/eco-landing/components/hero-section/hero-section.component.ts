import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EcoHeroSection, EcoStats, EcoContact, EcoBranding } from '../../models/eco-site-config.interface';

@Component({
  selector: 'eco-hero-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
})
export class HeroSectionComponent {
  @Input() section!: EcoHeroSection;
  @Input() stats!: EcoStats;
  @Input() contact!: EcoContact;
  @Input() branding!: EcoBranding;

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}
