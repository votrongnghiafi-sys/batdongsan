import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EcoSectionBase, EcoAnalytics } from '../../models/eco-site-config.interface';

@Component({
  selector: 'eco-analytics-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrl: './analytics-dashboard.component.scss',
})
export class AnalyticsDashboardComponent {
  @Input() section!: EcoSectionBase;
  @Input() analytics!: EcoAnalytics;

  readonly chartYears = [2026, 2027, 2028, 2029, 2030];
}
