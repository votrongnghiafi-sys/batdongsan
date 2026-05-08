import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EcoSectionBase, EcoFilterState } from '../../models/eco-site-config.interface';

@Component({
  selector: 'eco-smart-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './smart-filters.component.html',
  styleUrl: './smart-filters.component.scss',
})
export class SmartFiltersComponent implements OnInit {
  @Input() section!: EcoSectionBase;
  @Output() filterChange = new EventEmitter<EcoFilterState>();

  filters: EcoFilterState = {
    location: '',
    minPrice: 0,
    maxPrice: 20,
    ecoScore: 0,
    propertyType: '',
    minSolar: 0,
    certification: '',
  };

  locations = ['TP.HCM', 'Bình Dương', 'Đồng Nai', 'Long An', 'Vũng Tàu'];
  propertyTypes = ['Căn hộ', 'Biệt thự', 'Townhouse', 'Shophouse'];
  certifications = ['LEED Platinum', 'LEED Gold', 'EDGE', 'Green Mark'];

  ngOnInit(): void {
    this.emitFilters();
  }

  emitFilters(): void {
    this.filterChange.emit({ ...this.filters });
  }

  resetFilters(): void {
    this.filters = {
      location: '',
      minPrice: 0,
      maxPrice: 20,
      ecoScore: 0,
      propertyType: '',
      minSolar: 0,
      certification: '',
    };
    this.emitFilters();
  }
}
