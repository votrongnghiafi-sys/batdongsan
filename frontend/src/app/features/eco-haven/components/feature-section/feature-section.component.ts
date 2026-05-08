import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EcoHavenFeature } from '../../models/eco-haven.interface';

@Component({
  selector: 'eh-feature-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feature-section.component.html',
  styleUrl: './feature-section.component.scss',
})
export class FeatureSectionComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() features: EcoHavenFeature[] = [];
}
