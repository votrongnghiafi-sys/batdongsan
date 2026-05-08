import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EcoSectionBase, EcoProperty } from '../../models/eco-site-config.interface';

@Component({
  selector: 'eco-property-cards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-cards.component.html',
  styleUrl: './property-cards.component.scss',
})
export class PropertyCardsComponent implements OnChanges {
  @Input() section!: EcoSectionBase;
  @Input() properties: EcoProperty[] = [];

  filtered: EcoProperty[] = [];

  // Filter state
  filterLocation = '';
  filterType = '';
  filterCert = '';
  filterScore = '';

  // Derived option lists from data
  get locations(): string[] {
    return [...new Set(this.properties.map(p => p.location))];
  }

  get types(): string[] {
    return [...new Set(this.properties.map(p => p.type))];
  }

  get certifications(): string[] {
    return [...new Set(this.properties.map(p => p.certification).filter(Boolean))];
  }

  ngOnChanges(): void {
    this.filtered = [...this.properties];
  }

  applyFilter(): void {
    this.filtered = this.properties.filter(p => {
      if (this.filterLocation && !p.location.includes(this.filterLocation)) return false;
      if (this.filterType && p.type !== this.filterType) return false;
      if (this.filterCert && p.certification !== this.filterCert) return false;
      if (this.filterScore && p.sustainabilityScore < +this.filterScore) return false;
      return true;
    });
  }
}
